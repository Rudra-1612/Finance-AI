package com.financeai.controller;

import com.financeai.dto.GoalDto.*;
import com.financeai.security.UserPrincipal;
import com.financeai.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public List<GoalResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return goalService.list(principal.getId());
    }

    @PostMapping
    public ResponseEntity<GoalResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                               @Valid @RequestBody GoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(goalService.create(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public GoalResponse update(@AuthenticationPrincipal UserPrincipal principal,
                               @PathVariable Long id,
                               @Valid @RequestBody GoalRequest request) {
        return goalService.update(principal.getId(), id, request);
    }

    @PostMapping("/{id}/deposit")
    public GoalResponse deposit(@AuthenticationPrincipal UserPrincipal principal,
                                @PathVariable Long id,
                                @Valid @RequestBody DepositRequest request) {
        return goalService.deposit(principal.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        goalService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}