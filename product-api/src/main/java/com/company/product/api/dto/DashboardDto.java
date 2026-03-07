package com.company.product.api.dto;

public record DashboardDto(long totalBooks, long totalCopies, long availableCopies, long activeLoans, long overdueLoans,
                           long readers, long comments) {}
