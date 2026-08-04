package com.financeai.advisor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

/**
 * Minimal OpenAI chat-completions client using JDK HttpClient + SSE parsing.
 * Used only when an OPENAI_API_KEY is configured; otherwise the local
 * rule-based engine answers every question.
 */
@Component
public class OpenAiClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiClient.class);
    private static final String ENDPOINT = "https://api.openai.com/v1/chat/completions";

    private final String apiKey;
    private final String model;
    private final boolean enabled;
    private final HttpClient httpClient;

    public OpenAiClient(@Value("${financeai.openai.api-key:}") String apiKey,
                        @Value("${financeai.openai.model:gpt-4o-mini}") String model,
                        @Value("${financeai.openai.enabled:false}") boolean enabled) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model;
        this.enabled = enabled && !this.apiKey.isEmpty();
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();
    }

    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Streams a chat completion, invoking {@code onDelta} for each content
     * fragment and {@code onDone} when the full reply is assembled.
     * Returns true on success; false if streaming failed (caller should fall back).
     */
    public boolean streamChat(String systemPrompt, List<Map<String, String>> messages,
                              Consumer<String> onDelta, Consumer<String> onDone) {
        if (!enabled) return false;

        List<Map<String, Object>> bodyMessages = new java.util.ArrayList<>();
        bodyMessages.add(Map.<String, Object>of("role", "system", "content", systemPrompt));
        for (Map<String, String> m : messages) {
            bodyMessages.add(Map.<String, Object>of("role", m.get("role"), "content", m.get("content")));
        }

        Map<String, Object> body = Map.of(
                "model", model,
                "stream", true,
                "max_tokens", 1200,
                "messages", bodyMessages);

        String payload;
        try {
            payload = HttpUtil.toJson(body);
        } catch (Exception e) {
            log.error("Failed to serialize OpenAI request", e);
            return false;
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ENDPOINT))
                .timeout(Duration.ofSeconds(120))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                .build();

        StringBuilder full = new StringBuilder();
        try {
            HttpResponse<java.io.InputStream> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofInputStream());

            int status = response.statusCode();
            if (status != 200) {
                String err = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
                log.error("OpenAI returned {}: {}", status, err);
                return false;
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.startsWith("data:")) continue;
                    String data = line.substring(5).trim();
                    if (data.equals("[DONE]")) break;
                    String content = HttpUtil.extractDelta(data);
                    if (content != null) {
                        full.append(content);
                        onDelta.accept(content);
                    }
                }
            }
            onDone.accept(full.toString());
            return true;
        } catch (Exception e) {
            log.warn("OpenAI streaming failed: {}", e.getMessage());
            return false;
        }
    }
}