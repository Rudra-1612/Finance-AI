package com.financeai.dto;

import com.financeai.model.Conversation;
import com.financeai.model.Message;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public final class ConversationDto {

    private ConversationDto() {}

    public record ConversationRequest(
            @NotBlank(message = "Title is required") String title
    ) {}

    public record MessageRequest(
            @NotBlank(message = "Message content is required") String content
    ) {}

    public record ConversationResponse(Long id, String title, String createdAt, List<MessageResponse> messages) {
        public static ConversationResponse from(Conversation c) {
            List<MessageResponse> msgs = c.getMessages().stream().map(MessageResponse::from).toList();
            return new ConversationResponse(c.getId(), c.getTitle(), c.getCreatedAt().toString(), msgs);
        }

        public static ConversationResponse brief(Conversation c) {
            return new ConversationResponse(c.getId(), c.getTitle(), c.getCreatedAt().toString(), List.of());
        }
    }

    public record MessageResponse(Long id, String role, String content, String createdAt) {
        public static MessageResponse from(Message m) {
            return new MessageResponse(m.getId(), m.getRole(), m.getContent(), m.getCreatedAt().toString());
        }
    }
}