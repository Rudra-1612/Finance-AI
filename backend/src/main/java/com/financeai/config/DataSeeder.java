package com.financeai.config;

import com.financeai.model.*;
import com.financeai.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingsGoalRepository goalRepository;
    private final InvestmentRepository investmentRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;

    public DataSeeder(UserRepository userRepository,
                      TransactionRepository transactionRepository,
                      BudgetRepository budgetRepository,
                      SavingsGoalRepository goalRepository,
                      InvestmentRepository investmentRepository,
                      ConversationRepository conversationRepository,
                      MessageRepository messageRepository,
                      NotificationRepository notificationRepository,
                      PasswordEncoder passwordEncoder,
                      @Value("${financeai.seed-demo-data:true}") boolean enabled) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.goalRepository = goalRepository;
        this.investmentRepository = investmentRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled) return;
        if (userRepository.count() > 0) {
            return;
        }

        log.info("Seeding demo data...");

        User demo = new User();
        demo.setFirstName("Andrew");
        demo.setLastName("Wright");
        demo.setEmail("demo@financeai.com");
        demo.setPhone("+1 (555) 123-4567");
        demo.setPasswordHash(passwordEncoder.encode("demo1234"));
        demo = userRepository.save(demo);

        seedTransactions(demo);
        seedBudgets(demo);
        seedGoals(demo);
        seedInvestments(demo);
        seedNotifications(demo);
        seedWelcomeConversation(demo);

        log.info("Demo data seeded. Login with demo@financeai.com / demo1234");
    }

    private void seedTransactions(User demo) {
        YearMonth current = YearMonth.now();

        // Monthly salary + rent recurrence
        for (int i = 5; i >= 0; i--) {
            YearMonth m = current.minusMonths(i);

            Transaction salary = tx(demo, m.atDay(24), "Income", "5200.00",
                    "Direct Deposit", "Acme Corp Salary", "income");
            transactionRepository.save(salary);

            Transaction rent = tx(demo, m.atDay(3), "Housing", "1500.00",
                    "Bank Transfer", "Monthly Rent", "expense");
            transactionRepository.save(rent);

            int netExpenseBase = 1500;
            if (i <= 1) {
                String entertainment = (i == 0 ? "120.00" : "95.00");
                transactionRepository.save(tx(demo, m.atDay(12), "Entertainment", entertainment,
                        "Debit Card", "Concert & Movies", "expense"));
                netExpenseBase += 120;
            }
            transactionRepository.save(tx(demo, m.atDay(9), "Food & Dining", "180.00",
                    "Credit Card", "Groceries", "expense"));
            transactionRepository.save(tx(demo, m.atDay(14), "Food & Dining", "85.50",
                    "Credit Card", "Whole Foods Market", "expense"));
            transactionRepository.save(tx(demo, m.atDay(16), "Transportation", "45.00",
                    "Credit Card", "Uber Rides", "expense"));
            transactionRepository.save(tx(demo, m.atDay(20), "Utilities", "95.20",
                    "Bank Transfer", (i == 0 ? "Electric & Internet" : "Electric Bill"), "expense"));
            transactionRepository.save(tx(demo, m.atDay(5), "Shopping", "210.00",
                    "Credit Card", "Online Shopping", "expense"));
            transactionRepository.save(tx(demo, m.atDay(18), "Healthcare", "45.00",
                    "Debit Card", "Pharmacy", "expense"));
        }

        // Current-month freelance income
        LocalDate today = LocalDate.now();
        transactionRepository.save(tx(demo, today.minusDays(4), "Income", "450.00",
                "PayPal", "Freelance Design", "income"));
        transactionRepository.save(tx(demo, today.minusDays(2), "Food & Dining", "64.25",
                "Credit Card", "Weekend Dinner", "expense"));
        transactionRepository.save(tx(demo, today.minusDays(1), "Shopping", "35.00",
                "Credit Card", "Stationery Supplies", "expense"));
    }

    private void seedBudgets(User demo) {
        budget(demo, "Food & Dining", "600.00");
        budget(demo, "Shopping", "400.00");
        budget(demo, "Housing", "1600.00");
        budget(demo, "Transportation", "250.00");
        budget(demo, "Entertainment", "200.00");
        budget(demo, "Healthcare", "150.00");
    }

    private void seedGoals(User demo) {
        goal(demo, "Emergency Fund", "8500.00", "10000.00", YearMonth.now().plusMonths(10));
        goal(demo, "New Car Downpayment", "4200.00", "8000.00", YearMonth.now().plusMonths(16));
        goal(demo, "Summer Vacation", "1500.00", "3000.00", YearMonth.now().plusMonths(11));
    }

    private void seedInvestments(User demo) {
        invest(demo, "Vanguard S&P 500 ETF", "VOO", "Equity", "Index ETF", "18.5", "412.30", "438.60",
                "Low-Moderate", "Broad US market index fund with automatic diversification.");
        invest(demo, "iShares 20+ Year Treasury Bond ETF", "TLT", "Fixed Income", "Bond ETF", "40", "92.15", "94.80",
                "Low", "Long-duration government bonds for steady income and capital preservation.");
        invest(demo, "Physical Gold", "XAU", "Commodities", "Bullion", "1.2", "1980.00", "2045.00",
                "Low-Moderate", "Inflation hedge and store of value held in allocated custody.");
    }

    private void seedNotifications(User demo) {
        notif(demo, "info", "Welcome to FinanceAI",
                "Your account is ready. Add transactions and set budgets to unlock AI insights.", null, true);
        notif(demo, "spending", "Unusual spending detected",
                "Your 'Dining Out' category is 35% higher than usual this week.", "Review Expenses", false);
        notif(demo, "bill", "Upcoming bill: Electric Utility",
                "$95.20 is due in 3 days. Your account balance is sufficient.", null, true);
        notif(demo, "report", "Monthly report is ready",
                "Your financial summary has been generated by FinanceAI.", "Download PDF", false);
        notif(demo, "goal", "Goal milestone reached",
                "Emergency Fund is now 85% funded. Keep up the pace!", null, true);
    }

    private void seedWelcomeConversation(User demo) {
        Conversation convo = new Conversation();
        convo.setUser(demo);
        convo.setTitle("Welcome to FinanceAI Advisor");
        conversationRepository.save(convo);

        Message assistant = new Message();
        assistant.setConversation(convo);
        assistant.setRole("assistant");
        assistant.setContent("Hello Andrew! 👋 I'm your Financial AI advisor.\n\n"
                + "I've already analyzed the data in your account. Here's what I see:\n\n"
                + "- You have **6 budgets** set across Food, Shopping, Housing and more\n"
                + "- **3 active savings goals**, including an Emergency Fund at 85% funded\n"
                + "- A **3-position portfolio** worth roughly $9,800\n\n"
                + "Ask me anything — e.g. *\"Analyze my spending\"*, *\"How can I save more?\"*, "
                + "or *\"Explain SIP\"*.");
        messageRepository.save(assistant);
    }

    private Transaction tx(User u, LocalDate date, String category, String amount,
                           String method, String desc, String type) {
        Transaction t = new Transaction();
        t.setUser(u);
        t.setDate(date);
        t.setCategory(category);
        t.setAmount(new BigDecimal(amount));
        t.setPaymentMethod(method);
        t.setDescription(desc);
        t.setType(type);
        return t;
    }

    private void budget(User u, String category, String limit) {
        Budget b = new Budget();
        b.setUser(u);
        b.setCategory(category);
        b.setLimitAmount(new BigDecimal(limit));
        budgetRepository.save(b);
    }

    private void goal(User u, String name, String current, String target, YearMonth deadline) {
        SavingsGoal g = new SavingsGoal();
        g.setUser(u);
        g.setName(name);
        g.setCurrent(new BigDecimal(current));
        g.setTarget(new BigDecimal(target));
        g.setDeadline(deadline.atDay(1));
        goalRepository.save(g);
    }

    private void invest(User u, String name, String ticker, String type, String category,
                        String units, String purchasePrice, String currentPrice,
                        String risk, String description) {
        Investment i = new Investment();
        i.setUser(u);
        i.setName(name);
        i.setTicker(ticker);
        i.setType(type);
        i.setCategory(category);
        i.setUnits(new BigDecimal(units));
        i.setPurchasePrice(new BigDecimal(purchasePrice));
        i.setCurrentPrice(new BigDecimal(currentPrice));
        i.setPurchaseDate(YearMonth.now().minusMonths(4).atDay(10));
        i.setRisk(risk);
        i.setDescription(description);
        investmentRepository.save(i);
    }

    private void notif(User u, String type, String title, String message, String action, boolean read) {
        Notification n = new Notification();
        n.setUser(u);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setAction(action);
        n.setReadFlag(read);
        notificationRepository.save(n);
    }
}