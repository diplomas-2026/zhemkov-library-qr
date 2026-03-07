package com.company.product.api.dto;

import com.company.product.api.entity.CopyStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BookDtos {
    public record BookResponse(Long id, String title, String author, String isbn, String publisher, Integer publishYear,
                               String category, String description, long availableCopies) {}

    public record BookRequest(@NotBlank String title, @NotBlank String author, String isbn, String publisher,
                              Integer publishYear, @NotBlank String category, String description) {}

    public record CopyResponse(Long id, Long bookId, String bookTitle, String inventoryNumber, CopyStatus status, String location) {}

    public record CopyRequest(@NotNull Long bookId, @NotBlank String inventoryNumber, @NotNull CopyStatus status, String location) {}
}
