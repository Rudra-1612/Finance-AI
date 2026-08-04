package com.financeai.controller;

import com.financeai.dto.InvestmentDto.*;
import com.financeai.security.UserPrincipal;
import com.financeai.service.InvestmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    private final InvestmentService investmentService;

    public InvestmentController(InvestmentService investmentService) {
        this.investmentService = investmentService;
    }

    @GetMapping
    public List<InvestmentResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return investmentService.list(principal.getId());
    }

    @GetMapping("/library")
    public List<Map<String, String>> library() {
        return investmentService.library();
    }

    @GetMapping("/{id}")
    public InvestmentResponse get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return investmentService.get(principal.getId(), id);
    }

    @PostMapping
    public ResponseEntity<InvestmentResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                     @Valid @RequestBody InvestmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(investmentService.create(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public InvestmentResponse update(@AuthenticationPrincipal UserPrincipal principal,
                                     @PathVariable Long id,
                                     @Valid @RequestBody InvestmentRequest request) {
        return investmentService.update(principal.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        investmentService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}