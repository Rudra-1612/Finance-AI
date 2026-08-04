package com.financeai.dto;

import com.financeai.model.Investment;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public final class InvestmentDto {

    private InvestmentDto() {}

    public record InvestmentRequest(
            @NotBlank(message = "Name is required") String name,
            @NotBlank(message = "Type is required") String type,
            @NotBlank(message = "Category is required") String category,
            String ticker,
            @NotNull(message = "Units are required") @DecimalMin(value = "0", message = "Units must not be negative") BigDecimal units,
            @NotNull(message = "Purchase price is required") @DecimalMin(value = "0", message = "Price must not be negative") BigDecimal purchasePrice,
            @NotNull(message = "Current price is required") @DecimalMin(value = "0", message = "Price must not be negative") BigDecimal currentPrice,
            String purchaseDate,
            String risk,
            String description
    ) {}

    public record InvestmentResponse(
            Long id, String name, String type, String category, String ticker,
            BigDecimal units, BigDecimal purchasePrice, BigDecimal currentPrice, String purchaseDate,
            String risk, String description, BigDecimal invested, BigDecimal value, BigDecimal gain,
            BigDecimal gainPercent
    ) {
        public static InvestmentResponse from(Investment i) {
            BigDecimal invested = i.getUnits().multiply(i.getPurchasePrice());
            BigDecimal value = i.getUnits().multiply(i.getCurrentPrice());
            BigDecimal gain = value.subtract(invested);
            BigDecimal gainPercent = invested.compareTo(BigDecimal.ZERO) > 0
                    ? gain.multiply(BigDecimal.valueOf(100)).divide(invested, 2, java.math.RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            return new InvestmentResponse(i.getId(), i.getName(), i.getType(), i.getCategory(),
                    i.getTicker(), i.getUnits(), i.getPurchasePrice(), i.getCurrentPrice(),
                    i.getPurchaseDate() == null ? null : i.getPurchaseDate().toString(),
                    i.getRisk(), i.getDescription(), invested.setScale(2, java.math.RoundingMode.HALF_UP),
                    value.setScale(2, java.math.RoundingMode.HALF_UP),
                    gain.setScale(2, java.math.RoundingMode.HALF_UP), gainPercent);
        }
    }
}