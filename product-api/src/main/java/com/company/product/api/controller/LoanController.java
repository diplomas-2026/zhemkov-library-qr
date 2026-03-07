package com.company.product.api.controller;

import com.company.product.api.dto.LoanDtos;
import com.company.product.api.service.LoanService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loans")
public class LoanController {
    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping
    public List<LoanDtos.LoanResponse> list() {
        return loanService.list();
    }

    @GetMapping("/overdue")
    public List<LoanDtos.LoanResponse> overdue() {
        return loanService.overdue();
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @PostMapping("/issue")
    public LoanDtos.LoanResponse issue(@Valid @RequestBody LoanDtos.IssueRequest request) {
        return loanService.issue(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @PostMapping("/{id}/return")
    public LoanDtos.LoanResponse returnLoan(@PathVariable Long id) {
        return loanService.returnLoan(id);
    }
}
