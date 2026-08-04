package com.financeai.repository;

import com.financeai.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    List<Transaction> findByUserIdOrderByDateDescIdDesc(Long userId);

    List<Transaction> findByUserIdAndDateBetweenOrderByDateDescIdDesc(Long userId, LocalDate from, LocalDate to);

    @Query("select coalesce(sum(t.amount), 0) from Transaction t " +
            "where t.user.id = :userId and t.type = :type and t.date between :from and :to")
    BigDecimal sumAmountByUserIdAndTypeAndDateBetween(@Param("userId") Long userId,
                                                      @Param("type") String type,
                                                      @Param("from") LocalDate from,
                                                      @Param("to") LocalDate to);
}