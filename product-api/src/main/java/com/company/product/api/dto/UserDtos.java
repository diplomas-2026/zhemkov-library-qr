package com.company.product.api.dto;

import com.company.product.api.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UserDtos {
    public record UserResponse(Long id, String email, String fullName, UserRole role, boolean active) {}

    public record CreateUserRequest(@Email @NotBlank String email, @NotBlank String fullName,
                                    @NotBlank String password, @NotNull UserRole role) {}

    public record UpdateUserRequest(@Email @NotBlank String email, @NotBlank String fullName,
                                    String password, @NotNull UserRole role, boolean active) {}

    public record UpdateRoleRequest(@NotNull UserRole role) {}

    public record UpdateActiveRequest(boolean active) {}
}
