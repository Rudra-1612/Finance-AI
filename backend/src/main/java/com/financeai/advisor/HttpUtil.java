package com.financeai.advisor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Tiny JSON helpers for the OpenAI client (no extra dependencies needed).
 */
final class HttpUtil {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private HttpUtil() {}

    static String toJson(Object value) throws Exception {
        return MAPPER.writeValueAsString(value);
    }

    /** Extracts the content delta from a raw SSE data payload. */
    static String extractDelta(String data) {
        try {
            JsonNode node = MAPPER.readTree(data);
            JsonNode delta = node.path("choices").path(0).path("delta").path("content");
            return delta.isMissingNode() || delta.isNull() ? null : delta.asText();
        } catch (Exception e) {
            return null;
        }
    }
}