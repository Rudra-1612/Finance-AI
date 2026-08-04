package com.financeai.service;

import com.financeai.dto.NotificationDto.NotificationResponse;
import com.financeai.exception.ResourceNotFoundException;
import com.financeai.model.Notification;
import com.financeai.model.Transaction;
import com.financeai.model.User;
import com.financeai.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public NotificationResponse markRead(Long userId, Long id) {
        Notification n = notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setReadFlag(true);
        return NotificationResponse.from(notificationRepository.save(n));
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .forEach(n -> n.setReadFlag(true));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        Notification n = notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notificationRepository.delete(n);
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFlagFalse(userId);
    }

    protected void notify(User user, String type, String title, String message, String action) {
        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setAction(action);
        notificationRepository.save(n);
    }

    @Transactional
    public void notifyTransactionCreated(User user, Transaction tx) {
        if ("income".equalsIgnoreCase(tx.getType())
                && (user.isAiRecommendations() || user.isBudgetWarnings() || user.isBillReminders())) {
            notify(user, "income", "Income received",
                    "You received " + money(tx.getAmount()) + " for \"" + tx.getDescription() + "\".",
                    null);
        } else if ("expense".equalsIgnoreCase(tx.getType())) {
            notify(user, "expense", "Expense recorded",
                    "Spent " + money(tx.getAmount().negate()) + " on " + tx.getCategory()
                            + " (" + tx.getDescription() + ").", null);
        }
    }

    @Transactional
    public void notifyBudgetWarning(User user, String category, BigDecimal spent, BigDecimal limit) {
        if (!user.isBudgetWarnings()) return;
        BigDecimal remaining = limit.subtract(spent);
        if (remaining.signum() < 0) {
            notify(user, "budget", "Budget exceeded",
                    "Your \"" + category + "\" budget of " + money(limit) + " has been exceeded. "
                            + money(remaining.abs()) + " over budget this month.", "Review Budget");
        } else if (spent.compareTo(limit.multiply(BigDecimal.valueOf(0.85))) >= 0) {
            notify(user, "budget", "Budget warning",
                    "You've used " + spent.multiply(BigDecimal.valueOf(100)).divide(limit, 0, java.math.RoundingMode.HALF_UP)
                            + "% of your \"" + category + "\" budget. Only " + money(remaining) + " remains.", "Review Budget");
        }
    }

    @Transactional
    public void notifyGoalReached(User user, String goalName, BigDecimal current, BigDecimal target) {
        if (!user.isAiRecommendations()) return;
        if (current.compareTo(target) >= 0) {
            notify(user, "goal", "Goal reached: " + goalName,
                    "Congratulations! You've reached your savings target of " + money(target) + ".", null);
        }
    }

    @Transactional
    public void notifySecurity(User user, String action) {
        notify(user, "security", "Account " + action,
                "Your account was successfully " + action + ". If this wasn't you, contact support immediately.", null);
    }

    private String money(BigDecimal amount) {
        return "$" + String.format("%,.2f", amount);
    }
}