package com.company.product.api.dto;

import com.company.product.api.entity.ReportType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReportDtos {
    public record ReportRequest(@NotNull ReportType type, @NotNull LocalDate periodFrom, @NotNull LocalDate periodTo) {}

    public record ReportResponse(Long id, ReportType type, LocalDate periodFrom, LocalDate periodTo, String generatedBy,
                                 LocalDateTime generatedAt) {}
}
