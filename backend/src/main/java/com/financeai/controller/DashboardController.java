package com.financeai.controller;

import com.financeai.dto.DashboardDto.DashboardSummary;
import com.financeai.security.UserPrincipal;
import com.financeai.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> summary(@AuthenticationPrincipal UserPrincipal principal) {
        DashboardSummary summary = dashboardService.summary(principal.getId());
        var meta = new java.util.LinkedHashMap<>(summary.meta());
        meta.put("firstName", principal.getFirstName());
        var updated = new DashboardSummary(summary.totalBalance(), summary.monthlyIncome(),
                summary.monthlyExpenses(), summary.totalSavings(), summary.financialScore(),
                summary.scoreLabel(), summary.stats(), summary.cashFlow(), summary.expenseByCategory(),
                summary.recentTransactions(), summary.insights(), summary.goals(), summary.budgets(), meta);
        return ResponseEntity.ok(updated);
    }
}