package com.company.product.api.dto;

import com.company.product.api.entity.ReaderRoleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReaderDtos {
    public record ReaderResponse(Long id, String fullName, ReaderRoleType roleType, String className, String contact, String qrCode) {}

    public record ReaderRequest(@NotBlank String fullName, @NotNull ReaderRoleType roleType, String className,
                                String contact, @NotBlank String qrCode) {}

    public record ReaderQrLookupResponse(ReaderResponse reader, java.util.List<LoanDtos.LoanResponse> loans) {}
}
