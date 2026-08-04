package com.financeai.dto;

import com.financeai.model.Transaction;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public final class TransactionDto {

    private TransactionDto() {}

    public record TransactionRequest(
            @NotNull(message = "Date is required") String date,
            @NotBlank(message = "Category is required") String category,
            @NotNull(message = "Amount is required") BigDecimal amount,
            String paymentMethod,
            @NotBlank(message = "Description is required") String description,
            @NotBlank(message = "Type is required") @Pattern(regexp = "income|expense", message = "Type must be income or expense") String type
    ) {}

    public record TransactionResponse(
            Long id, String date, String category, BigDecimal amount, String paymentMethod,
            String description, String type, String createdAt
    ) {
        public static TransactionResponse from(Transaction t) {
            return new TransactionResponse(t.getId(), t.getDate().toString(), t.getCategory(),
                    t.getAmount(), t.getPaymentMethod(), t.getDescription(), t.getType(),
                    t.getCreatedAt().toString());
        }
    }
}