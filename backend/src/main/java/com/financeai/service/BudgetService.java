package com.financeai.service;

import com.financeai.dto.BudgetDto.*;
import com.financeai.exception.BadRequestException;
import com.financeai.exception.ConflictException;
import com.financeai.exception.ResourceNotFoundException;
import com.financeai.model.Budget;
import com.financeai.model.User;
import com.financeai.repository.BudgetRepository;
import com.financeai.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final TransactionService transactionService;
    private final NotificationService notificationService;

    public BudgetService(BudgetRepository budgetRepository,
                         UserRepository userRepository,
                         TransactionService transactionService,
                         NotificationService notificationService) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.transactionService = transactionService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> list(Long userId) {
        YearMonth current = YearMonth.now();
        return budgetRepository.findByUserIdOrderByIdAsc(userId).stream()
                .map(b -> BudgetResponse.from(b, spentFor(b, current)))
                .toList();
    }

    @Transactional
    public BudgetResponse create(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String category = request.category().trim();
        if (budgetRepository.existsByUserIdAndCategory(userId, category)) {
            throw new ConflictException("A budget for '" + category + "' already exists");
        }

        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setLimitAmount(request.limit());
        if (request.month() != null && !request.month().isBlank()) {
            budget.setMonth(YearMonth.parse(request.month()));
        }
        return BudgetResponse.from(budgetRepository.save(budget), BigDecimal.ZERO);
    }

    @Transactional
    public BudgetResponse update(Long userId, Long id, BudgetRequest request) {
        Budget budget = findEntity(userId, id);
        budget.setCategory(request.category().trim());
        budget.setLimitAmount(request.limit());
        if (request.month() != null && !request.month().isBlank()) {
            budget.setMonth(YearMonth.parse(request.month()));
        } else {
            budget.setMonth(null);
        }
        return BudgetResponse.from(budgetRepository.save(budget), spentFor(budget, YearMonth.now()));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        Budget budget = findEntity(userId, id);
        budgetRepository.delete(budget);
    }

    @Transactional(readOnly = true)
    public BigDecimal spentFor(Budget budget, YearMonth month) {
        String cat = budget.getCategory();
        if (cat.equalsIgnoreCase("Income")) return BigDecimal.ZERO;
        var txs = transactionService.listEntities(budget.getUser().getId(), cat, "expense",
                budget.getMonth() != null ? budget.getMonth() : month);
        return txs.stream().map(t -> t.getAmount().negate()).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Budget findEntity(Long userId, Long id) {
        return budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
    }
}