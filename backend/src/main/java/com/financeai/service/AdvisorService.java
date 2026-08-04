package com.financeai.service;

import com.financeai.advisor.LocalAdvisorEngine;
import com.financeai.advisor.OpenAiClient;
import com.financeai.dto.ConversationDto.*;
import com.financeai.exception.ResourceNotFoundException;
import com.financeai.model.Conversation;
import com.financeai.model.Message;
import com.financeai.model.User;
import com.financeai.repository.ConversationRepository;
import com.financeai.repository.MessageRepository;
import com.financeai.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class AdvisorService {

    private static final Logger log = LoggerFactory.getLogger(AdvisorService.class);

    private static final String SYSTEM_PROMPT = """
            You are FinanceAI, a world-class AI financial advisor. You help users with:
            - Personal finance, budgeting, and expense tracking
            - Investment strategies (stocks, ETFs, mutual funds, bonds, gold, fixed deposits)
            - Savings goals and wealth building
            - Tax optimization strategies
            - Understanding financial concepts and instruments
            - SIP (Systematic Investment Plans) and compound interest
            - Emergency funds and insurance planning
            - Debt management and credit optimization
            - Retirement planning

            Always be:
            - Precise and data-driven in your advice
            - Clear about risk levels and time horizons
            - Honest about the limitations of your advice (you are not a licensed financial advisor)
            - Proactive in suggesting actionable next steps
            - Concise but thorough

            A snapshot of the user's actual stored financial data is included below each message.
            Reference their real numbers whenever relevant.
            """;

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final InsightService insightService;
    private final OpenAiClient openAiClient;
    private final LocalAdvisorEngine localEngine;

    private final ExecutorService executor = Executors.newCachedThreadPool();

    public AdvisorService(ConversationRepository conversationRepository,
                          MessageRepository messageRepository,
                          UserRepository userRepository,
                          InsightService insightService,
                          OpenAiClient openAiClient,
                          LocalAdvisorEngine localEngine) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.insightService = insightService;
        this.openAiClient = openAiClient;
        this.localEngine = localEngine;
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> listConversations(Long userId) {
        return conversationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ConversationResponse::brief)
                .toList();
    }

    @Transactional(readOnly = true)
    public long conversationCount(Long userId) {
        return conversationRepository.findByUserIdOrderByCreatedAtDesc(userId).size();
    }

    @Transactional
    public ConversationResponse createConversation(Long userId, ConversationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Conversation conversation = new Conversation();
        conversation.setUser(user);
        conversation.setTitle(request.title().trim());
        return ConversationResponse.brief(conversationRepository.save(conversation));
    }

    @Transactional(readOnly = true)
    public ConversationResponse getConversation(Long userId, Long id) {
        Conversation conversation = findConversation(userId, id);
        conversation.getMessages().size(); // initialize lazy collection
        return ConversationResponse.from(conversation);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> listMessages(Long userId, Long conversationId) {
        findConversation(userId, conversationId);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(MessageResponse::from)
                .toList();
    }

    @Transactional
    public void deleteConversation(Long userId, Long id) {
        findConversation(userId, id);
        conversationRepository.deleteByIdAndUserId(id, userId);
    }

    /**
     * Returns an SSE emitter immediately and does all work (persisting the user
     * message, generating + streaming the answer, persisting the reply) on a
     * background thread so the response lifecycle is driven by the emitter's
     * async events instead of a blocking request thread holding a transaction.
     */
    public SseEmitter sendMessage(Long userId, Long conversationId, String content) {
        SseEmitter emitter = new SseEmitter(180_000L);

        executor.execute(() -> {
            try {
                Conversation conversation = findConversation(userId, conversationId);
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Message userMsg = new Message();
                userMsg.setConversation(conversation);
                userMsg.setRole("user");
                userMsg.setContent(content);
                messageRepository.save(userMsg);

                List<Message> history = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

                if (history.size() <= 2 && conversation.getTitle().equals("New Conversation")) {
                    conversation.setTitle(shortenTitle(content));
                    conversationRepository.save(conversation);
                }

                String financialContext = insightService.buildFinancialContext(userId);
                List<Map<String, String>> openAiMessages = new ArrayList<>();
                for (Message m : history) {
                    openAiMessages.add(Map.of("role", m.getRole(), "content", m.getContent()));
                }
                openAiMessages.add(Map.of("role", "system",
                        "content", "Here is the user's current financial data:\n" + financialContext));

                String assistantText = switchAnswer(user, content, financialContext, openAiMessages, emitter);

                Message assistantMsg = new Message();
                assistantMsg.setConversation(conversation);
                assistantMsg.setRole("assistant");
                assistantMsg.setContent(assistantText);
                messageRepository.save(assistantMsg);
            } catch (Exception e) {
                log.error("Advisor stream failed", e);
                try {
                    emitter.send(new java.util.HashMap<>() {{ put("error", "Stream failed: " + e.getMessage()); }});
                } catch (Exception ignored) {
                }
            } finally {
                try {
                    emitter.complete();
                } catch (Exception ignored) {
                }
            }
        });

        return emitter;
    }

    /**
     * Determines which engine answers and streams the tokens. Returns the full
     * assistant text so it can be persisted.
     */
    private String switchAnswer(User user, String content, String financialContext,
                                List<Map<String, String>> openAiMessages, SseEmitter emitter) {
        StringBuilder full = new StringBuilder();
        DraftStream streamer = new DraftStream(full, emitter);

        // 1) Try OpenAI streaming
        if (openAiClient.isEnabled()) {
            try {
                boolean ok = openAiClient.streamChat(
                        SYSTEM_PROMPT + "\nUser name: " + user.getFullName(),
                        openAiMessages,
                        streamer::emitToken,
                        streamer::emitDone);
                if (ok && full.length() > 0) {
                    return streamer.finish();
                }
                // If OpenAI failed early, fall through to the local engine
                full.setLength(0);
            } catch (Exception e) {
                log.error("OpenAI stream aborted, switching to local engine", e);
                full.setLength(0);
            }
        }

        // 2) Local rule-based engine (always available)
        String answer = localEngine.answer(content, financialContext, user.getFullName());
        streamer.streamText(answer);
        streamer.finish();
        return answer;
    }

    private Conversation findConversation(Long userId, Long id) {
        return conversationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
    }

    private String shortenTitle(String content) {
        String t = content.trim().replaceAll("\\s+", " ");
        return t.length() > 40 ? t.substring(0, 40).trim() + "…" : t;
    }

    /**
     * Helper that accumulates streamed content, writes to the SseEmitter, and
     * emits the final done event.
     */
    private static final class DraftStream {
        private final StringBuilder full;
        private final SseEmitter emitter;

        DraftStream(StringBuilder full, SseEmitter emitter) {
            this.full = full;
            this.emitter = emitter;
        }

        void emitToken(String token) {
            full.append(token);
            send(new java.util.HashMap<>() {{ put("content", token); }});
        }

        void emitDone(String whole) {
            full.setLength(0);
            full.append(whole);
        }

        String finish() {
            if (full.length() > 0) {
                send(new java.util.HashMap<>() {{ put("done", true); }});
            } else {
                send(new java.util.HashMap<>() {{ put("error", "No response generated"); }});
            }
            try {
                emitter.complete();
            } catch (Exception ignored) {
            }
            return full.toString();
        }

        /** Streams the local engine's answer in small chunks to mimic token flow. */
        void streamText(String text) {
            int chunk = 24;
            for (int i = 0; i < text.length(); i += chunk) {
                String slice = text.substring(i, Math.min(i + chunk, text.length()));
                emitToken(slice);
                try {
                    Thread.sleep(8);
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }

        private void send(Object data) {
            try {
                emitter.send(data);
            } catch (IOException | IllegalStateException e) {
                // Client disconnected mid-stream; stop writing.
            }
        }
    }
}