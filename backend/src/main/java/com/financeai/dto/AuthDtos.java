package com.financeai.dto;

import com.financeai.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank(message = "First name is required") String firstName,
            @NotBlank(message = "Last name is required") String lastName,
            @NotBlank(message = "Email is required") @Email(message = "Invalid email") String email,
            String phone,
            @NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters") String password
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required") String email,
            @NotBlank(message = "Password is required") String password
    ) {}

    public record AuthResponse(String token, UserResponse user) {}

    public record UserResponse(
            Long id, String firstName, String lastName, String email, String phone,
            String currency, boolean aiRecommendations, boolean budgetWarnings, boolean billReminders,
            String createdAt
    ) {
        public static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail(),
                    u.getPhone(), u.getCurrency(), u.isAiRecommendations(), u.isBudgetWarnings(),
                    u.isBillReminders(), u.getCreatedAt().toString());
        }
    }

    public record UpdateProfileRequest(
            @NotBlank(message = "First name is required") String firstName,
            @NotBlank(message = "Last name is required") String lastName,
            String phone,
            String currency
    ) {}

    public record UpdatePreferencesRequest(
            Boolean aiRecommendations, Boolean budgetWarnings, Boolean billReminders
    ) {}

    public record ChangePasswordRequest(
            @NotBlank(message = "Current password is required") String currentPassword,
            @NotBlank(message = "New password is required") @Size(min = 6, message = "Password must be at least 6 characters") String newPassword
    ) {}
}