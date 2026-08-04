package com.financeai.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public final class DashboardDto {

    private DashboardDto() {}

    public record StatCard(String key, String label, BigDecimal value, BigDecimal change, String icon, String trend) {}

    public record CashFlowPoint(String month, BigDecimal income, BigDecimal expenses, BigDecimal savings) {}

    public record CategorySlice(String name, BigDecimal value, String color) {}

    public record DashboardSummary(
            BigDecimal totalBalance,
            BigDecimal monthlyIncome,
            BigDecimal monthlyExpenses,
            BigDecimal totalSavings,
            int financialScore,
            String scoreLabel,
            List<StatCard> stats,
            List<CashFlowPoint> cashFlow,
            List<CategorySlice> expenseByCategory,
            List<TransactionDto.TransactionResponse> recentTransactions,
            List<InsightDto.Insight> insights,
            List<GoalDto.GoalResponse> goals,
            List<BudgetDto.BudgetResponse> budgets,
            Map<String, Object> meta
    ) {}
}