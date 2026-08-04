package com.financeai.service;

import com.financeai.dto.InsightDto.Insight;
import com.financeai.dto.TransactionDto.TransactionResponse;
import com.financeai.model.Investment;
import com.financeai.model.Transaction;
import com.financeai.repository.InvestmentRepository;
import com.financeai.repository.SavingsGoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Rule-based insight engine. Every insight is computed from the user's real
 * stored financial data so the dashboard and the AI advisor always reflect
 * actual application state.
 */
@Service
public class InsightService {

    private final TransactionService transactionService;
    private final BudgetService budgetService;
    private final SavingsGoalRepository goalRepository;
    private final InvestmentRepository investmentRepository;

    public InsightService(TransactionService transactionService,
                          BudgetService budgetService,
                          SavingsGoalRepository goalRepository,
                          InvestmentRepository investmentRepository) {
        this.transactionService = transactionService;
        this.budgetService = budgetService;
        this.goalRepository = goalRepository;
        this.investmentRepository = investmentRepository;
    }

    @Transactional(readOnly = true)
    public List<Insight> generateInsights(Long userId, int limit) {
        List<Insight> insights = new ArrayList<>();

        YearMonth current = YearMonth.now();
        YearMonth prevMonth = current.minusMonths(1);

        List<TransactionResponse> curTxs = transactionService.list(userId, null, null, null, current.toString());
        List<TransactionResponse> prevTxs = transactionService.list(userId, null, null, null, prevMonth.toString());

        BigDecimal curExpense = sumExpenses(curTxs);
        BigDecimal prevExpense = sumExpenses(prevTxs);
        BigDecimal curIncome = sumIncome(curTxs);
        BigDecimal curSavings = curIncome.subtract(curExpense);

        // Unusual category spending vs. 6-month average
        insights.addAll(categoryAnomalies(userId));

        // Savings rate
        if (curIncome.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal savingsRate = curSavings.multiply(BigDecimal.valueOf(100))
                    .divide(curIncome, 1, RoundingMode.HALF_UP);
            if (savingsRate.compareTo(BigDecimal.valueOf(15)) < 0) {
                insights.add(new Insight("savings", "Low savings rate",
                        "You're saving only " + savingsRate + "% of your income this month. "
                                + "A healthy target is 20%+. Consider trimming discretionary spending "
                                + "to build a stronger buffer.",
                        "View Budgets", "warning"));
            } else if (savingsRate.compareTo(BigDecimal.valueOf(25)) >= 0) {
                insights.add(new Insight("savings", "Strong savings rate",
                        "Excellent! You're saving " + savingsRate + "% of your income this month — "
                                + "well above the recommended 20%. Keep it up.",
                        "View Goals", "positive"));
            }
        }

        // Month-over-month expense change
        if (prevExpense.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal change = curExpense.subtract(prevExpense).multiply(BigDecimal.valueOf(100))
                    .divide(prevExpense, 1, RoundingMode.HALF_UP);
            if (change.compareTo(BigDecimal.valueOf(20)) > 0) {
                insights.add(new Insight("spending", "Spending increased " + change + "%",
                        "Your spending this month is " + change + "% higher than last month "
                                + money(prevExpense) + " → " + money(curExpense) + ". Review larger purchases to stay on track.",
                        "View Expenses", "warning"));
            } else if (change.compareTo(BigDecimal.valueOf(-10)) < 0) {
                insights.add(new Insight("spending", "Spending down " + change.abs() + "%",
                        "You spent " + change.abs() + "% less this month than last. That's a "
                                + money(prevExpense.subtract(curExpense)) + " improvement.",
                        "View Expenses", "positive"));
            }
        }

        // Budget health
        budgetService.list(userId).stream()
                .filter(b -> !"Income".equalsIgnoreCase(b.category()))
                .forEach(b -> {
                    if (b.over()) {
                        insights.add(new Insight("budget", "Budget exceeded: " + b.category(),
                                "You've gone over your " + b.category() + " budget by "
                                        + money(b.spent().subtract(b.limit())) + " this month.",
                                "Review Budget", "critical"));
                    } else if (b.percent() >= 80) {
                        insights.add(new Insight("budget", b.category() + " budget nearly used",
                                "You've used " + b.percent() + "% of your " + b.category()
                                        + " budget. Only " + money(b.remaining()) + " remains for the month.",
                                "Review Budget", "warning"));
                    }
                });

        // Savings goals
        goalRepository.findByUserIdOrderByIdAsc(userId).forEach(g -> {
            if (g.getCurrent().compareTo(g.getTarget()) >= 0) {
                insights.add(new Insight("goal", "Goal achieved: " + g.getName(),
                        "You've fully funded \"" + g.getName() + "\" (" + money(g.getTarget()) + "). "
                                + "Consider setting a new target or redirecting this flow to another goal.",
                        "View Goals", "positive"));
            } else if (g.getDeadline() != null && g.getTarget().compareTo(BigDecimal.ZERO) > 0) {
                long months = java.time.temporal.ChronoUnit.MONTHS.between(LocalDate.now(), g.getDeadline());
                BigDecimal needed = g.getTarget().subtract(g.getCurrent());
                if (months > 0) {
                    BigDecimal monthly = needed.divide(BigDecimal.valueOf(months), 0, RoundingMode.HALF_UP);
                    insights.add(new Insight("goal", "On track for " + g.getName(),
                            "To reach \"" + g.getName() + "\" by " + g.getDeadline() + ", save about "
                                    + money(monthly) + "/month. You need " + money(needed) + " more.",
                            "View Goals", "info"));
                }
            }
        });

        // Investment concentration & performance
        List<Investment> investments = investmentRepository.findByUserIdOrderByIdAsc(userId);
        if (!investments.isEmpty()) {
            Map<String, BigDecimal> byType = new LinkedHashMap<>();
            BigDecimal totalValue = BigDecimal.ZERO;
            for (Investment inv : investments) {
                BigDecimal value = inv.getUnits().multiply(inv.getCurrentPrice());
                totalValue = totalValue.add(value);
                String type = inv.getType() == null ? "Other" : inv.getType();
                byType.merge(type, value, BigDecimal::add);
            }
            if (totalValue.compareTo(BigDecimal.ZERO) > 0 && byType.size() == 1) {
                insights.add(new Insight("invest", "Portfolio concentration risk",
                        "All of your portfolio value (" + money(totalValue) + ") is in a single asset type ("
                                + byType.keySet().iterator().next() + "). Diversifying across asset classes "
                                + "typically reduces risk without sacrificing much return.",
                        "View Investments", "warning"));
            }
            BigDecimal costs = investments.stream()
                    .map(inv -> inv.getUnits().multiply(inv.getPurchasePrice()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal gain = investments.stream()
                    .map(inv -> inv.getUnits().multiply(inv.getCurrentPrice()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add).subtract(costs);
            if (gain.signum() > 0) {
                insights.add(new Insight("invest", "Portfolio up " + money(gain),
                        "Your investments have gained " + money(gain) + " since purchase. "
                                + "Periodic rebalancing keeps your allocation aligned with your goals.",
                        "View Investments", "positive"));
            } else if (gain.signum() < 0) {
                insights.add(new Insight("invest", "Portfolio down " + money(gain.abs()),
                        "Your investments are currently " + money(gain.abs()) + " below cost. "
                                + "Long-term historical returns favor staying invested. Review your time horizon before acting.",
                        "View Investments", "warning"));
            }
        }

        return limit > 0 && insights.size() > limit ? List.copyOf(insights.subList(0, limit)) : insights;
    }

    @Transactional(readOnly = true)
    public List<Insight> categoryAnomalies(Long userId) {
        List<Insight> result = new ArrayList<>();
        YearMonth current = YearMonth.now();
        LocalDate start = current.minusMonths(5).atDay(1);

        List<Transaction> sixMonth = transactionService.allInRange(userId, start, current.atEndOfMonth());

        // Aggregate by category for the 6-month window and the current month
        Map<String, BigDecimal> histByCat = new LinkedHashMap<>();
        Map<String, BigDecimal> curByCat = new LinkedHashMap<>();
        for (Transaction t : sixMonth) {
            if (!"expense".equalsIgnoreCase(t.getType()) || "Income".equalsIgnoreCase(t.getCategory())) continue;
            BigDecimal abs = t.getAmount().abs();
            histByCat.merge(t.getCategory(), abs, BigDecimal::add);
            if (YearMonth.from(t.getDate()).equals(current)) {
                curByCat.merge(t.getCategory(), abs, BigDecimal::add);
            }
        }

        for (Map.Entry<String, BigDecimal> e : curByCat.entrySet()) {
            String cat = e.getKey();
            BigDecimal hist = histByCat.getOrDefault(cat, BigDecimal.ZERO);
            BigDecimal monthlyAvg = hist.divide(BigDecimal.valueOf(6), 2, RoundingMode.HALF_UP);
            if (monthlyAvg.compareTo(BigDecimal.ZERO) <= 0) continue;
            BigDecimal cur = e.getValue();
            BigDecimal ratio = cur.multiply(BigDecimal.valueOf(100)).divide(monthlyAvg, 0, RoundingMode.HALF_UP);
            if (ratio.compareTo(BigDecimal.valueOf(140)) > 0) {
                result.add(new Insight("anomaly", "Unusual spending in " + cat,
                        "Your \"" + cat + "\" spending is " + ratio + "% of the 6-month average "
                                + "(" + money(monthlyAvg) + "/mo → " + money(cur) + "). "
                                + "Review recent purchases in this category.",
                        "View Expenses", "warning"));
            } else if (ratio.compareTo(BigDecimal.valueOf(40)) < 0) {
                result.add(new Insight("anomaly", cat + " spending is unusually low",
                        "Your \"" + cat + "\" spending dropped to " + ratio + "% of the 6-month average. "
                                + "If this isn't deliberate, you may be missing expected payments.",
                        "View Expenses", "info"));
            }
        }
        return result;
    }

    /**
     * Produces a markdown-style financial report describing the user's stored
     * data — used by the AI advisor (OpenAI and local engine) and the PDF report.
     */
    @Transactional(readOnly = true)
    public String buildFinancialContext(Long userId) {
        StringBuilder sb = new StringBuilder();
        YearMonth current = YearMonth.now();

        sb.append("USER FINANCIAL OVERVIEW (current month: ").append(current).append(")\n");

        List<TransactionResponse> cur = transactionService.list(userId, null, null, null, current.toString());
        BigDecimal income = sumIncome(cur);
        BigDecimal expense = sumExpenses(cur);
        sb.append("- Income this month: ").append(money(income)).append("\n");
        sb.append("- Expenses this month: ").append(money(expense)).append("\n");
        sb.append("- Net savings this month: ").append(money(income.subtract(expense))).append("\n");

        Map<String, BigDecimal> catMap = new LinkedHashMap<>();
        cur.stream().filter(t -> "expense".equalsIgnoreCase(t.type()))
                .forEach(t -> catMap.merge(t.category(), t.amount().abs(), BigDecimal::add));
        sb.append("- Expenses by category:\n");
        catMap.forEach((k, v) -> sb.append("    * ").append(k).append(": ").append(money(v)).append("\n"));

        sb.append("- Budgets:\n");
        budgetService.list(userId).stream().filter(b -> !"Income".equalsIgnoreCase(b.category())).forEach(b ->
                sb.append("    * ").append(b.category()).append(": ").append(money(b.spent()))
                        .append(" / ").append(money(b.limit())).append(" (").append(b.percent()).append("% used)\n"));

        sb.append("- Savings goals:\n");
        goalRepository.findByUserIdOrderByIdAsc(userId).forEach(g ->
                sb.append("    * ").append(g.getName()).append(": ").append(money(g.getCurrent()))
                        .append(" of ").append(money(g.getTarget()))
                        .append(g.getDeadline() == null ? "" : " (deadline " + g.getDeadline() + ")").append("\n"));

        List<Investment> invs = investmentRepository.findByUserIdOrderByIdAsc(userId);
        sb.append("- Portfolio: ").append(invs.size()).append(" holdings\n");
        invs.forEach(inv -> {
            BigDecimal value = inv.getUnits().multiply(inv.getCurrentPrice());
            BigDecimal gain = value.subtract(inv.getUnits().multiply(inv.getPurchasePrice()));
            sb.append("    * ").append(inv.getName()).append(" (").append(inv.getType()).append("): value ")
                    .append(money(value)).append(", gain ").append(money(gain)).append("\n");
        });

        return sb.toString();
    }

    public BigDecimal sumIncome(List<TransactionResponse> txs) {
        return txs.stream().filter(t -> "income".equalsIgnoreCase(t.type()))
                .map(TransactionResponse::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal sumExpenses(List<TransactionResponse> txs) {
        return txs.stream().filter(t -> "expense".equalsIgnoreCase(t.type()))
                .map(t -> t.amount().abs())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String money(BigDecimal amount) {
        return "$" + String.format("%,.2f", amount);
    }
}