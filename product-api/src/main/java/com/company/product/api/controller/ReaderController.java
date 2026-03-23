package com.company.product.api.controller;

import com.company.product.api.dto.ReaderDtos;
import com.company.product.api.service.ReaderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/readers")
public class ReaderController {
    private final ReaderService readerService;

    public ReaderController(ReaderService readerService) {
        this.readerService = readerService;
    }

    @GetMapping
    public List<ReaderDtos.ReaderResponse> list() {
        return readerService.list();
    }

    @GetMapping("/qr/{qrCode}")
    public ReaderDtos.ReaderQrLookupResponse byQr(@PathVariable String qrCode) {
        return readerService.byQr(qrCode);
    }

    @PreAuthorize("hasRole('READER')")
    @GetMapping("/me")
    public ReaderDtos.ReaderResponse myReader() {
        return readerService.myReader();
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @GetMapping("/{id}/profile")
    public ReaderDtos.ReaderQrLookupResponse profile(@PathVariable Long id) {
        return readerService.profile(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @PostMapping
    public ReaderDtos.ReaderResponse create(@Valid @RequestBody ReaderDtos.ReaderRequest request) {
        return readerService.create(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @PutMapping("/{id}")
    public ReaderDtos.ReaderResponse update(@PathVariable Long id, @Valid @RequestBody ReaderDtos.ReaderRequest request) {
        return readerService.update(id, request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        readerService.delete(id);
    }
}
