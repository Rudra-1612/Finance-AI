package com.financeai.service;

import com.financeai.dto.BudgetDto.BudgetResponse;
import com.financeai.dto.DashboardDto.*;
import com.financeai.dto.GoalDto.GoalResponse;
import com.financeai.dto.TransactionDto.TransactionResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class DashboardService {

    private static final String[] CHART_COLORS = {
            "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"
    };

    private final TransactionService transactionService;
    private final BudgetService budgetService;
    private final GoalService goalService;
    private final InvestmentService investmentService;
    private final InsightService insightService;
    private final NotificationService notificationService;
    private final AdvisorService advisorService;

    public DashboardService(TransactionService transactionService,
                            BudgetService budgetService,
                            GoalService goalService,
                            InvestmentService investmentService,
                            InsightService insightService,
                            NotificationService notificationService,
                            AdvisorService advisorService) {
        this.transactionService = transactionService;
        this.budgetService = budgetService;
        this.goalService = goalService;
        this.investmentService = investmentService;
        this.insightService = insightService;
        this.notificationService = notificationService;
        this.advisorService = advisorService;
    }

    @Transactional(readOnly = true)
    public DashboardSummary summary(Long userId) {
        YearMonth current = YearMonth.now();
        YearMonth prev = current.minusMonths(1);

        List<TransactionResponse> curTxs = transactionService.list(userId, null, null, null, current.toString());
        List<TransactionResponse> prevTxs = transactionService.list(userId, null, null, null, prev.toString());

        BigDecimal curIncome = insightService.sumIncome(curTxs);
        BigDecimal curExpense = insightService.sumExpenses(curTxs);
        BigDecimal prevIncome = insightService.sumIncome(prevTxs);
        BigDecimal prevExpense = insightService.sumExpenses(prevTxs);

        // Lifetime totals
        List<TransactionResponse> all = transactionService.list(userId, null, null, null, null);
        BigDecimal totalBalance = insightService.sumIncome(all).subtract(insightService.sumExpenses(all));

        // Investment totals
        BigDecimal portfolioValue = investmentService.portfolioValue(userId);
        BigDecimal totalSavings = totalBalance.add(portfolioValue);

        // Cash flow for last 6 months
        List<CashFlowPoint> cashFlow = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            List<TransactionResponse> txs = transactionService.list(userId, null, null, null, ym.toString());
            BigDecimal inc = insightService.sumIncome(txs);
            BigDecimal exp = insightService.sumExpenses(txs);
            cashFlow.add(new CashFlowPoint(
                    ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    inc, exp, inc.subtract(exp)));
        }

        // Expense categories this month
        Map<String, BigDecimal> catMap = new LinkedHashMap<>();
        curTxs.stream().filter(t -> "expense".equalsIgnoreCase(t.type()))
                .forEach(t -> catMap.merge(t.category(), t.amount().abs(), BigDecimal::add));
        List<CategorySlice> expenseByCategory = new ArrayList<>();
        int colorIdx = 0;
        for (Map.Entry<String, BigDecimal> e : catMap.entrySet()) {
            expenseByCategory.add(new CategorySlice(e.getKey(), e.getValue(),
                    CHART_COLORS[colorIdx % CHART_COLORS.length]));
            colorIdx++;
        }
        if (expenseByCategory.isEmpty()) {
            expenseByCategory.add(new CategorySlice("No expenses yet", BigDecimal.ZERO, CHART_COLORS[0]));
        }

        int score = computeFinancialScore(userId, curIncome, curExpense);

        List<StatCard> stats = List.of(
                new StatCard("balance", "Total Balance", totalBalance,
                        percentChange(totalBalance, BigDecimal.ZERO), "wallet", "up"),
                new StatCard("income", "Monthly Income", curIncome,
                        percentChange(curIncome, prevIncome), "trending-up", "up"),
                new StatCard("expenses", "Monthly Expenses", curExpense.negate(),
                        percentChange(curExpense, prevExpense), "credit-card", "down"),
                new StatCard("score", "Financial Score", BigDecimal.valueOf(score),
                        BigDecimal.ZERO, "target", "info")
        );

        List<BudgetResponse> budgets = budgetService.list(userId);
        List<GoalResponse> goals = goalService.list(userId);

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("month", current.toString());
        meta.put("portfolioValue", portfolioValue);
        meta.put("unreadNotifications", notificationService.unreadCount(userId));
        meta.put("conversationCount", advisorService.conversationCount(userId));
        meta.put("currency", "USD");
        meta.put("firstName", null); // filled by controller with the authenticated name

        return new DashboardSummary(totalBalance, curIncome, curExpense, totalSavings, score, scoreLabel(score),
                stats, cashFlow, expenseByCategory,
                transactionService.list(userId, null, null, null, current.toString()).stream()
                        .limit(6).toList(),
                insightService.generateInsights(userId, 4),
                goals, budgets, meta);
    }

    private BigDecimal percentChange(BigDecimal value, BigDecimal previous) {
        if (previous.signum() == 0) return BigDecimal.ZERO;
        return value.subtract(previous).multiply(BigDecimal.valueOf(100))
                .divide(previous, 2, RoundingMode.HALF_UP);
    }

    private int computeFinancialScore(Long userId, BigDecimal income, BigDecimal expense) {
        int score = 60;

        if (income.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal savingsRate = income.subtract(expense).multiply(BigDecimal.valueOf(100))
                    .divide(income, 2, RoundingMode.HALF_UP);
            score += clamp(savingsRate.intValue() / 2, 0, 20);
        }

        long over = budgetService.list(userId).stream().filter(BudgetResponse::over).count();
        if (over == 0) score += 10;
        else score += Math.max(0, 10 - (int) over * 4);

        YearMonth current = YearMonth.now();
        BigDecimal expCur = insightService.sumExpenses(transactionService.list(
                userId, null, null, null, current.toString()));
        BigDecimal expPrev = insightService.sumExpenses(transactionService.list(
                userId, null, null, null, current.minusMonths(1).toString()));
        if (expPrev.signum() > 0) {
            BigDecimal ratio = expCur.multiply(BigDecimal.valueOf(100)).divide(expPrev, 0, RoundingMode.HALF_UP);
            if (ratio.compareTo(BigDecimal.valueOf(150)) > 0) score -= 10;
        }

        return clamp(score, 0, 100);
    }

    private int clamp(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }

    private String scoreLabel(int score) {
        if (score >= 85) return "Excellent — on track for your goals";
        if (score >= 70) return "Good — small improvements will help";
        if (score >= 50) return "Fair — review your budgets";
        return "Needs attention — review your finances";
    }
}