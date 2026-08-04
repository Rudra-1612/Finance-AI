package com.financeai.dto;

public final class InsightDto {

    private InsightDto() {}

    public record Insight(String type, String title, String message, String action, String severity) {}
}