package com.financeai.repository;

import com.financeai.model.Budget;
import com.financeai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdOrderByIdAsc(Long userId);

    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndCategory(Long userId, String category);
}