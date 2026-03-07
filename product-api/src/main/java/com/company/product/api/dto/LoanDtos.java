package com.company.product.api.dto;

import com.company.product.api.entity.LoanStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class LoanDtos {
    public record LoanResponse(Long id, Long copyId, String inventoryNumber, String bookTitle, Long readerId,
                               String readerName, String readerQrCode, LocalDateTime issuedAt, LocalDateTime dueAt,
                               LocalDateTime returnedAt, LoanStatus status) {}

    public record IssueRequest(@NotBlank String readerQrCode, @NotNull Long copyId, @NotNull LocalDateTime dueAt) {}
}
