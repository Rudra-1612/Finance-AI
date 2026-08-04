package com.financeai.service;

import com.financeai.dto.TransactionDto.*;
import com.financeai.exception.BadRequestException;
import com.financeai.exception.ResourceNotFoundException;
import com.financeai.model.Transaction;
import com.financeai.model.User;
import com.financeai.repository.TransactionRepository;
import com.financeai.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TransactionService(TransactionRepository transactionRepository,
                              UserRepository userRepository,
                              NotificationService notificationService) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> list(Long userId, String search, String category, String type, String month) {
        Specification<Transaction> spec = buildSpec(userId, search, category, type, month);
        return transactionRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "date", "id")).stream()
                .map(TransactionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Transaction> listEntities(Long userId, String category, String type, YearMonth month) {
        Specification<Transaction> spec = buildSpec(userId, null, category, type,
                month == null ? null : month.toString());
        return transactionRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "date", "id"));
    }

    @Transactional(readOnly = true)
    public TransactionResponse get(Long userId, Long id) {
        return TransactionResponse.from(findEntity(userId, id));
    }

    @Transactional
    public TransactionResponse create(Long userId, TransactionRequest request) {
        if (request.amount().signum() < 0) {
            throw new BadRequestException("Amount must not be negative. Use type to mark income vs expense.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setDate(parseDate(request.date()));
        tx.setCategory(request.category().trim());
        tx.setAmount("expense".equalsIgnoreCase(request.type()) ? request.amount().negate() : request.amount());
        tx.setPaymentMethod(request.paymentMethod());
        tx.setDescription(request.description().trim());
        tx.setType(request.type().toLowerCase());

        Transaction saved = transactionRepository.save(tx);
        notificationService.notifyTransactionCreated(user, saved);
        return TransactionResponse.from(saved);
    }

    @Transactional
    public TransactionResponse update(Long userId, Long id, TransactionRequest request) {
        if (request.amount().signum() < 0) {
            throw new BadRequestException("Amount must not be negative. Use type to mark income vs expense.");
        }
        Transaction tx = findEntity(userId, id);
        tx.setDate(parseDate(request.date()));
        tx.setCategory(request.category().trim());
        tx.setAmount("expense".equalsIgnoreCase(request.type()) ? request.amount().negate() : request.amount());
        tx.setPaymentMethod(request.paymentMethod());
        tx.setDescription(request.description().trim());
        tx.setType(request.type().toLowerCase());
        return TransactionResponse.from(transactionRepository.save(tx));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        Transaction tx = findEntity(userId, id);
        transactionRepository.delete(tx);
    }

    @Transactional(readOnly = true)
    public List<Transaction> allInRange(Long userId, LocalDate from, LocalDate to) {
        return transactionRepository.findByUserIdAndDateBetweenOrderByDateDescIdDesc(userId, from, to);
    }

    private Transaction findEntity(Long userId, Long id) {
        return transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }

    private LocalDate parseDate(String date) {
        try {
            return LocalDate.parse(date);
        } catch (Exception e) {
            throw new BadRequestException("Invalid date format. Use yyyy-MM-dd.");
        }
    }

    private Specification<Transaction> buildSpec(Long userId, String search, String category, String type, String month) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("description")), like),
                        cb.like(cb.lower(root.get("category")), like),
                        cb.like(cb.lower(root.get("paymentMethod")), like)
                ));
            }
            if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (type != null && !type.isBlank() && !"all".equalsIgnoreCase(type)) {
                predicates.add(cb.equal(cb.lower(root.get("type")), type.toLowerCase()));
            }
            if (month != null && !month.isBlank()) {
                YearMonth ym = YearMonth.parse(month);
                predicates.add(cb.between(root.get("date"), ym.atDay(1), ym.atEndOfMonth()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public BigDecimal sumType(Long userId, String type, LocalDate from, LocalDate to) {
        return transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(userId, type, from, to);
    }

    public List<Transaction> recent(Long userId, int limit) {
        return transactionRepository.findByUserIdOrderByDateDescIdDesc(userId).stream().limit(limit).toList();
    }
}