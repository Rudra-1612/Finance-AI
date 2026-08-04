package com.financeai.dto;

import com.financeai.model.Budget;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public final class BudgetDto {

    private BudgetDto() {}

    public record BudgetRequest(
            @NotBlank(message = "Category is required") String category,
            @NotNull(message = "Limit is required") @DecimalMin(value = "0.01", message = "Limit must be positive") BigDecimal limit,
            String month
    ) {}

    public record BudgetResponse(
            Long id, String category, BigDecimal limit, BigDecimal spent, BigDecimal remaining,
            int percent, boolean over, String month, String icon
    ) {
        public static BudgetResponse from(Budget b, BigDecimal spent) {
            BigDecimal remaining = b.getLimitAmount().subtract(spent).max(BigDecimal.ZERO);
            int percent = b.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
                    ? spent.multiply(BigDecimal.valueOf(100)).divide(b.getLimitAmount(), 0, java.math.RoundingMode.HALF_UP).intValue()
                    : 0;
            boolean over = b.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
                    && spent.compareTo(b.getLimitAmount()) >= 0;
            return new BudgetResponse(b.getId(), b.getCategory(), b.getLimitAmount(), spent,
                    remaining, percent, over, b.getMonth() == null ? null : b.getMonth().toString(),
                    mapIcon(b.getCategory()));
        }

        private static String mapIcon(String category) {
            String c = category == null ? "" : category.toLowerCase();
            if (c.contains("food") || c.contains("dining") || c.contains("grocer")) return "Utensils";
            if (c.contains("shopp") || c.contains("retail")) return "ShoppingBag";
            if (c.contains("house") || c.contains("home") || c.contains("rent") || c.contains("mortgage")) return "Home";
            if (c.contains("trans") || c.contains("car") || c.contains("fuel") || c.contains("gas")) return "Car";
            if (c.contains("enter") || c.contains("film") || c.contains("movie")) return "Film";
            if (c.contains("health") || c.contains("medical") || c.contains("heart")) return "Heart";
            if (c.contains("utili") || c.contains("electric") || c.contains("water")) return "Zap";
            return "Tag";
        }
    }
}