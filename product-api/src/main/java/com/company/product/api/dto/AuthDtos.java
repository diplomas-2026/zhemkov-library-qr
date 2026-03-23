package com.company.product.api.dto;

import com.company.product.api.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

    public record RegisterRequest(@Email @NotBlank String email,
                                  @NotBlank @Size(min = 6, max = 72) String password,
                                  @NotBlank @Size(min = 2, max = 160) String fullName) {}

    public record AuthResponse(String token, Long id, String email, String fullName, UserRole role) {}
}
