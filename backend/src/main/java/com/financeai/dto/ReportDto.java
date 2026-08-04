package com.financeai.dto;

import java.math.BigDecimal;
import java.util.List;

public final class ReportDto {

    private ReportDto() {}

    public record MonthlyPoint(String month, BigDecimal income, BigDecimal expenses, BigDecimal savings) {}

    public record CategoryRow(String category, BigDecimal amount, int percent) {}

    public record ReportPayload(
            String period,
            String from,
            String to,
            BigDecimal income,
            BigDecimal expenses,
            BigDecimal savings,
            BigDecimal net,
            int savingsRate,
            List<MonthlyPoint> monthly,
            List<CategoryRow> categories
    ) {}
}