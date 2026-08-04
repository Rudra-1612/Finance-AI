package com.financeai.advisor;

import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Built-in rule-based financial advisor. Produces data-driven, structured
 * answers derived from the user's real financial context so the Advisor never
 * depends on external services and never crashes.
 */
@Component
public class LocalAdvisorEngine {

    /**
     * Generates the complete assistant reply for a user message.
     *
     * @param question    the user's latest message
     * @param context     markdown overview of the user's real financial data
     * @param systemName  name used for the persona
     * @return full markdown response
     */
    public String answer(String question, String context, String systemName) {
        String q = question == null ? "" : question.toLowerCase(Locale.ROOT);

        NumberBag num = extractNumbers(context);

        if (containsAny(q, "hello", "hi ", "hey", "greetings")) {
            return greeting();
        }
        if (containsAny(q, "analy", "spending", "expense", "where does my money", "how am i doing", "my finances")) {
            return analyzeSpending(context, num);
        }
        if (containsAny(q, "save", "saving", "emergency fund", "rainy day")) {
            return savingAdvice(num);
        }
        if (containsAny(q, "budget", "limit", "overspend", "tracking")) {
            return budgetAdvice(context, num);
        }
        if (containsAny(q, "invest", "portfolio", "etf", "mutual fund", "stock", "gold", "bond", "sip")) {
            return investingAdvice(num);
        }
        if (containsAny(q, "debt", "loan", "credit card", "emi", "interest", "repay")) {
            return debtAdvice();
        }
        if (containsAny(q, "retire", "retirement", "pension")) {
            return retirementAdvice(num);
        }
        if (containsAny(q, "tax")) {
            return taxAdvice();
        }
        if (containsAny(q, "report")) {
            return "Based on your stored data, here's your financial report summary:\n\n" + context;
        }
        if (containsAny(q, "income", "cash flow", "net worth", "balance")) {
            return netWorthAdvice(num);
        }
        if (containsAny(q, "thank")) {
            return "You're welcome! I'm here whenever you need clarity on your finances. 📈";
        }
        return genericAdvice(q, num);
    }

    private String greeting() {
        return "Hello! 👋 I'm your Financial AI advisor.\n\n"
                + "I can help you with:\n"
                + "- **Analyzing your spending** and finding savings\n"
                + "- **Budget advice** tailored to your goals\n"
                + "- **Investment strategies** — SIPs, ETFs, mutual funds, gold and more\n"
                + "- **Debt payoff plans** and credit optimization\n"
                + "- **Retirement and emergency fund planning**\n\n"
                + "Would you like me to analyze your current finances? Just ask e.g. *\"Analyze my spending\"*.";
    }

    private String analyzeSpending(String context, NumberBag num) {
        StringBuilder sb = new StringBuilder();
        sb.append("## Your spending analysis\n\n");
        if (num.income != null && num.expense != null) {
            sb.append("Here's what your data shows for the current month:\n\n");
            sb.append("| Metric | Amount |\n|---|---|\n");
            sb.append("| Income | **").append(num.income).append("** |\n");
            sb.append("| Expenses | **").append(num.expense).append("** |\n");
            double diff = num.incomeV - num.expenseV;
            double rate = num.incomeV > 0 ? (diff / num.incomeV) * 100 : 0;
            sb.append("| Net savings | **$").append(String.format("%,.2f", diff)).append("** |\n");
            sb.append("| Savings rate | **").append(String.format("%.1f%%", rate)).append("** |\n\n");
            if (rate < 15) {
                sb.append("⚠️ Your savings rate is below the recommended **20%** target. "
                        + "Redirecting even a few percent of discretionary spending would meaningfully "
                        + "improve your runway.\n\n");
            } else {
                sb.append("✅ Your savings rate is healthy. Keep it above **20%** to build wealth steadily.\n\n");
            }
        }

        // Extract the category breakdown lines from the context
        String categories = extractSection(context, "Expenses by category");
        if (categories != null && !categories.isBlank()) {
            sb.append("**Where your money went this month:**\n\n");
            sb.append(categories);
            sb.append("\n");
        } else {
            sb.append("You don't have any expense transactions recorded yet. "
                    + "Add a few transactions and I'll give you a category-level analysis.\n");
        }

        sb.append("\n**Recommended next steps:**\n");
        sb.append("1. Set or review budgets for your top 3 spending categories.\n");
        sb.append("2. Automate a monthly transfer to a savings goal before payday.\n");
        sb.append("3. Review subscriptions and recurring charges for unused services.\n");
        return sb.toString();
    }

    private String savingAdvice(NumberBag num) {
        StringBuilder sb = new StringBuilder();
        sb.append("## Saving & emergency fund strategy\n\n");
        sb.append("A strong financial foundation rests on **three layers**:\n\n");
        sb.append("1. **Emergency fund (3–6 months of expenses)** — liquid, low-risk assets used "
                + "only for genuine emergencies.\n");
        sb.append("2. **Short-term goals** (vacations, electronics, car) — separate savings buckets "
                + "with a clear deadline each.\n");
        sb.append("3. **Long-term wealth** (retirement, SIPs, index funds) — automated monthly investing.\n\n");

        if (num.expense != null) {
            double target = num.expenseV * 6;
            sb.append("Based on your monthly expenses of **").append(num.expense).append("**, "
                    + "a 6-month emergency fund would be approximately **$").append(
                    String.format("%,.0f", target)).append("**.\n\n");
        }
        sb.append("**Practical tips:**\n");
        sb.append("- Pay yourself first: automate savings the day after payday.\n");
        sb.append("- Use the **50/30/20 rule** — 50% needs, 30% wants, 20% savings.\n");
        sb.append("- Set up weekly micro-transfers; small consistent deposits beat rare big ones.\n");
        return sb.toString();
    }

    private String budgetAdvice(String context, NumberBag num) {
        String section = extractSection(context, "Budgets");
        StringBuilder sb = new StringBuilder();
        sb.append("## Budget optimization\n\n");
        if (section != null && !section.isBlank()) {
            sb.append("Your current budgets and usage:\n\n");
            sb.append(section);
            sb.append("\n");
            boolean over = section.toLowerCase(Locale.ROOT).contains("100% used");
            if (over) {
                sb.append("⚠️ Some budgets are at or above 100%. For those categories, review recurring "
                        + "charges and either reduce spending or right-size the limit to your real behavior.\n\n");
            }
        } else {
            sb.append("You haven't created budgets yet. Budgets turn tracking into control — "
                    + "set limits for your top spending categories and I'll alert you before you overspend.\n\n");
        }
        sb.append("**How to build a realistic budget:**\n");
        sb.append("1. Look at your **3-month average** per category.\n");
        sb.append("2. Set each limit ~10% below that average to create natural pressure.\n");
        sb.append("3. Review monthly; adjust only intentional, not accidental, changes.\n");
        return sb.toString();
    }

    private String investingAdvice(NumberBag num) {
        StringBuilder sb = new StringBuilder();
        sb.append("## Investment strategy\n\n");
        sb.append("Your allocation should match your **time horizon** and **risk tolerance**:\n\n");
        sb.append("| Asset class | Risk | Horizon | Typical role |\n|---|---|---|---|\n");
        sb.append("| Index ETFs (S&P 500) | Moderate | 5+ yrs | Core growth |\n");
        sb.append("| Government bonds | Low | 1–30 yrs | Stability & income |\n");
        sb.append("| Dividend stocks | Moderate | 5+ yrs | Growth + cash flow |\n");
        sb.append("| Physical gold | Low-Mod | 10+ yrs | Inflation hedge |\n");
        sb.append("| Fixed deposits | Very low | 3 mo–5 yrs | Guaranteed capital |\n");
        sb.append("| Tech mutual funds | High | 7+ yrs | Aggressive upside |\n\n");

        sb.append("**A sensible starter portfolio** might hold:\n");
        sb.append("- **60%** broad index ETFs\n");
        sb.append("- **20%** bonds / fixed income\n");
        sb.append("- **10%** gold or commodities\n");
        sb.append("- **10%** cash & emergency reserve\n\n");

        sb.append("### Systematic Investment Plans (SIP)\n");
        sb.append("SIP = investing a **fixed amount monthly** into a fund. It averages your entry price "
                + "over time (rupee/strike-cost averaging) and makes compounding automatic.\n");
        sb.append("Power of compounding: at an assumed **10% annual return**, a $500/month SIP "
                + "grows to roughly **$400,000 in 20 years** — your contributions would be only $120,000.\n");

        if (num.portfolio > 0) {
            sb.append("\nYour current portfolio value is **$").append(String.format("%,.2f", num.portfolio))
                    .append("**. Reviewing your allocation against the table above is a great next step.\n");
        } else {
            sb.append("\nYou don't have any holdings tracked yet. Add investments in the "
                    + "**Investments** tab to monitor your portfolio here.\n");
        }
        return sb.toString();
    }

    private String debtAdvice() {
        return "## Debt payoff playbook\n\n"
                + "Two proven strategies:\n\n"
                + "**1. Avalanche (maximize savings)** — pay minimums everywhere, then funnel every extra "
                + "dollar to the debt with the **highest interest rate**.\n\n"
                + "**2. Snowball (maximize momentum)** — pay minimums everywhere, then attack the "
                + "**smallest balance** first for quick wins and motivation.\n\n"
                + "A general rule: keep total debt payments under **36% of gross income**, and avoid "
                + "adding high-interest debt while you're carrying a balance.\n\n"
                + "If you refinance or consolidate, compare the **total cost** (fees + rate), not just the "
                + "monthly payment being lower.";
    }

    private String retirementAdvice(NumberBag num) {
        StringBuilder sb = new StringBuilder();
        sb.append("## Retirement planning\n\n");
        sb.append("The earlier you start, the less you need to save each month due to compounding.\n\n");
        if (num.income != null) {
            sb.append("A common goal is replacing **70–80% of pre-retirement income**. "
                    + "Automate **15% of your income** toward retirement accounts "
                    + "(e.g. " + num.income + "/mo → about $")
                    .append(String.format("%,.0f", num.incomeV * 0.15)).append(" per month).\n\n");
        }
        sb.append("**Order of operations:**\n");
        sb.append("1. Emergency fund (3–6 months)\n");
        sb.append("2. Max any employer-match retirement plan\n");
        sb.append("3. Low-cost index funds for the long term\n");
        sb.append("4. Diversify with bonds as you near retirement\n");
        return sb.toString();
    }

    private String taxAdvice() {
        return "## Practical tax optimization\n\n"
                + "- **Maximize deductions** you're entitled to (housing, health, education, retirement contributions).\n"
                + "- **Timing matters** — defer income and accelerate deductible expenses where legal.\n"
                + "- **Long-term holdings** typically attract lower capital-gains treatment; hold investments past the long-term threshold.\n"
                + "- Keep **proper records** of every deductible purchase — receipts saved electronically are your best defense.\n"
                + "- Consider **tax-loss harvesting**: selling a losing position to offset gains.\n\n"
                + "I can guide general strategy, but always confirm specifics with a licensed tax professional for "
                + "your jurisdiction.";
    }

    private String netWorthAdvice(NumberBag num) {
        StringBuilder sb = new StringBuilder();
        sb.append("## Cash flow & net worth\n\n");
        if (num.income != null) {
            double net = num.incomeV - num.expenseV;
            sb.append("Current month:\n");
            sb.append("- Income: **").append(num.income).append("**\n");
            sb.append("- Expenses: **").append(num.expense).append("**\n");
            sb.append("- Net: **$").append(String.format("%,.2f", net)).append("**\n\n");
            if (net <= 0) {
                sb.append("Your cash flow is negative this month — expenses exceed income. "
                        + "Prioritize cutting the largest category and building a buffer before investing.\n");
            } else {
                sb.append("You have positive cash flow. Consider automating the surplus toward goals and investments.\n");
            }
        }
        if (num.portfolio > 0) {
            sb.append("Your tracked investment portfolio is worth **$").append(String.format("%,.2f", num.portfolio))
                    .append("**.\n");
        }
        return sb.toString();
    }

    private String genericAdvice(String q, NumberBag num) {
        StringBuilder sb = new StringBuilder();
        sb.append("Great question — here's some perspective on that.\n\n");
        sb.append("While I can't access real-time market data or your exact account balances, "
                + "I review the **financial data you've stored in FinanceAI**. ");
        if (num.income != null) {
            sb.append("Your current monthly income is **").append(num.income)
                    .append("** with expenses of **").append(num.expense).append("**.\n\n");
        } else {
            sb.append("You don't have financial data recorded yet — adding transactions unlocks "
                    + "personalized analysis.\n\n");
        }
        sb.append("A few principles that usually apply:\n");
        sb.append("- **Spend less than you earn**, and automate the difference.\n");
        sb.append("- **Diversify** across asset classes to manage risk.\n");
        sb.append("- Keep **6 months** of expenses liquid for emergencies.\n");
        sb.append("- Review your finances **monthly**, not yearly.\n\n");
        sb.append("If you'd like, ask me to *\"Analyze my spending\"* or *\"Build an emergency fund plan\"* "
                + "and I'll use your real data.");
        return sb.toString();
    }

    /**
     * Extracts the first currency number present in a money-formatted section,
     * the portfolio value, and the income/expense values from the context text.
     */
    private NumberBag extractNumbers(String context) {
        NumberBag bag = new NumberBag();
        if (context == null) return bag;

        Pattern p = Pattern.compile("- Income this month: \\$([\\d,.]+)");
        Matcher m = p.matcher(context);
        if (m.find()) { bag.income = "$" + m.group(1); bag.incomeV = parse(m.group(1)); }

        m = Pattern.compile("- Expenses this month: \\$([\\d,.]+)").matcher(context);
        if (m.find()) { bag.expense = "$" + m.group(1); bag.expenseV = parse(m.group(1)); }

        m = Pattern.compile("Portfolio: (\\d+) holdings").matcher(context);
        if (m.find() && m.group(1).equals("0")) {
            bag.portfolio = 0;
        }

        // Sum "value $X" lines in portfolio section
        Pattern value = Pattern.compile("value \\$([\\d,.]+)");
        Matcher vm = value.matcher(context);
        while (vm.find()) {
            bag.portfolio += parse(vm.group(1));
        }
        return bag;
    }

    private double parse(String s) {
        try {
            return Double.parseDouble(s.replace(",", ""));
        } catch (Exception e) {
            return 0;
        }
    }

    private String extractSection(String context, String header) {
        if (context == null) return null;
        Pattern p = Pattern.compile("- " + Pattern.quote(header) + ":\\n?(.*?)(?=\\n- |\\nUSER FINANCIAL OVERVIEW|\\Z)",
                Pattern.DOTALL);
        Matcher m = p.matcher(context);
        if (m.find()) {
            return m.group(1).isBlank() ? null : m.group(1).trim();
        }
        return null;
    }

    private boolean containsAny(String q, String... needles) {
        for (String needle : needles) {
            if (q.contains(needle)) return true;
        }
        return false;
    }

    private static class NumberBag {
        String income;
        double incomeV;
        String expense;
        double expenseV;
        double portfolio;
    }
}