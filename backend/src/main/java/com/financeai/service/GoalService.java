package com.financeai.service;

import com.financeai.dto.GoalDto.*;
import com.financeai.exception.BadRequestException;
import com.financeai.exception.ResourceNotFoundException;
import com.financeai.model.SavingsGoal;
import com.financeai.model.User;
import com.financeai.repository.SavingsGoalRepository;
import com.financeai.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class GoalService {

    private final SavingsGoalRepository goalRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public GoalService(SavingsGoalRepository goalRepository,
                       UserRepository userRepository,
                       NotificationService notificationService) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> list(Long userId) {
        return goalRepository.findByUserIdOrderByIdAsc(userId).stream().map(GoalResponse::from).toList();
    }

    @Transactional
    public GoalResponse create(Long userId, GoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        SavingsGoal goal = new SavingsGoal();
        goal.setUser(user);
        goal.setName(request.name().trim());
        goal.setCurrent(request.current());
        goal.setTarget(request.target());
        goal.setDeadline(parseDate(request.deadline()));
        SavingsGoal saved = goalRepository.save(goal);
        notificationService.notifyGoalReached(user, saved.getName(), saved.getCurrent(), saved.getTarget());
        return GoalResponse.from(saved);
    }

    @Transactional
    public GoalResponse update(Long userId, Long id, GoalRequest request) {
        SavingsGoal goal = findEntity(userId, id);
        goal.setName(request.name().trim());
        goal.setCurrent(request.current());
        goal.setTarget(request.target());
        goal.setDeadline(parseDate(request.deadline()));
        SavingsGoal saved = goalRepository.save(goal);
        notificationService.notifyGoalReached(saved.getUser(), saved.getName(), saved.getCurrent(), saved.getTarget());
        return GoalResponse.from(saved);
    }

    @Transactional
    public GoalResponse deposit(Long userId, Long id, DepositRequest request) {
        SavingsGoal goal = findEntity(userId, id);
        BigDecimal updated = goal.getCurrent().add(request.amount());
        goal.setCurrent(updated);
        SavingsGoal saved = goalRepository.save(goal);
        notificationService.notifyGoalReached(saved.getUser(), saved.getName(), saved.getCurrent(), saved.getTarget());
        return GoalResponse.from(saved);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        SavingsGoal goal = findEntity(userId, id);
        goalRepository.delete(goal);
    }

    private SavingsGoal findEntity(Long userId, Long id) {
        return goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found"));
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) return null;
        try {
            return LocalDate.parse(date);
        } catch (Exception e) {
            throw new BadRequestException("Invalid date format. Use yyyy-MM-dd.");
        }
    }
}