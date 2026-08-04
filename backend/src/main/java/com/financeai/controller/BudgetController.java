package com.financeai.controller;

import com.financeai.dto.BudgetDto.*;
import com.financeai.security.UserPrincipal;
import com.financeai.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public List<BudgetResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return budgetService.list(principal.getId());
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                 @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.create(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public BudgetResponse update(@AuthenticationPrincipal UserPrincipal principal,
                                 @PathVariable Long id,
                                 @Valid @RequestBody BudgetRequest request) {
        return budgetService.update(principal.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        budgetService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}