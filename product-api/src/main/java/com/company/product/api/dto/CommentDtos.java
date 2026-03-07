package com.company.product.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CommentDtos {
    public record CommentResponse(Long id, Long bookId, String userName, String body, LocalDateTime createdAt) {}

    public record CommentRequest(@NotNull Long bookId, @NotBlank String body) {}
}
