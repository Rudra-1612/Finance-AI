package com.financeai.dto;

import com.financeai.model.SavingsGoal;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public final class GoalDto {

    private GoalDto() {}

    public record GoalRequest(
            @NotBlank(message = "Name is required") String name,
            @NotNull(message = "Current amount is required") @DecimalMin(value = "0", message = "Current must not be negative") BigDecimal current,
            @NotNull(message = "Target amount is required") @DecimalMin(value = "0.01", message = "Target must be positive") BigDecimal target,
            String deadline
    ) {}

    public record DepositRequest(
            @NotNull(message = "Amount is required") @DecimalMin(value = "0.01", message = "Deposit must be positive") BigDecimal amount
    ) {}

    public record GoalResponse(
            Long id, String name, BigDecimal current, BigDecimal target, String deadline,
            int percent, boolean complete
    ) {
        public static GoalResponse from(SavingsGoal g) {
            int percent = g.getTarget().compareTo(BigDecimal.ZERO) > 0
                    ? g.getCurrent().multiply(BigDecimal.valueOf(100)).divide(g.getTarget(), 0, java.math.RoundingMode.HALF_UP).intValue()
                    : 0;
            return new GoalResponse(g.getId(), g.getName(), g.getCurrent(), g.getTarget(),
                    g.getDeadline() == null ? null : g.getDeadline().toString(),
                    percent, g.getCurrent().compareTo(g.getTarget()) >= 0);
        }
    }
}