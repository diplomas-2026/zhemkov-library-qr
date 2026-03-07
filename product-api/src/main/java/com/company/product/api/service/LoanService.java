package com.company.product.api.service;

import com.company.product.api.dto.LoanDtos;
import com.company.product.api.entity.CopyStatus;
import com.company.product.api.entity.LoanEntity;
import com.company.product.api.entity.LoanStatus;
import com.company.product.api.repository.BookCopyRepository;
import com.company.product.api.repository.LoanRepository;
import com.company.product.api.repository.ReaderRepository;
import com.company.product.api.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class LoanService {
    private final LoanRepository loanRepository;
    private final BookCopyRepository copyRepository;
    private final ReaderRepository readerRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final AuditService auditService;

    public LoanService(LoanRepository loanRepository, BookCopyRepository copyRepository, ReaderRepository readerRepository,
                       UserRepository userRepository, CurrentUserService currentUserService, AuditService auditService) {
        this.loanRepository = loanRepository;
        this.copyRepository = copyRepository;
        this.readerRepository = readerRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.auditService = auditService;
    }

    public List<LoanDtos.LoanResponse> list() {
        return loanRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<LoanDtos.LoanResponse> listByReader(Long readerId) {
        return loanRepository.findByReaderIdOrderByIssuedAtDesc(readerId).stream().map(this::toResponse).toList();
    }

    public List<LoanDtos.LoanResponse> overdue() {
        return loanRepository.findByStatusAndDueAtBefore(LoanStatus.ACTIVE, LocalDateTime.now())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public LoanDtos.LoanResponse issue(LoanDtos.IssueRequest request) {
        var reader = readerRepository.findByQrCode(request.readerQrCode())
                .orElseThrow(() -> new IllegalArgumentException("QR-код не найден"));
        var copy = copyRepository.findById(request.copyId())
                .orElseThrow(() -> new IllegalArgumentException("Экземпляр не найден"));
        if (copy.getStatus() != CopyStatus.AVAILABLE) {
            throw new IllegalArgumentException("Экземпляр недоступен для выдачи");
        }
        if (request.dueAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Срок возврата не может быть в прошлом");
        }

        var actor = currentUserService.getCurrentUser();
        LoanEntity loan = new LoanEntity();
        loan.setReader(reader);
        loan.setCopy(copy);
        loan.setIssuedBy(userRepository.findById(actor.getId()).orElseThrow());
        loan.setIssuedAt(LocalDateTime.now());
        loan.setDueAt(request.dueAt());
        loan.setStatus(LoanStatus.ACTIVE);
        copy.setStatus(CopyStatus.ISSUED);
        copyRepository.save(copy);
        LoanEntity saved = loanRepository.save(loan);
        auditService.log(actor, "loan", saved.getId(), "ISSUED");
        return toResponse(saved);
    }

    @Transactional
    public LoanDtos.LoanResponse returnLoan(Long id) {
        LoanEntity loan = loanRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Выдача не найдена"));
        if (loan.getReturnedAt() != null) {
            throw new IllegalArgumentException("Книга уже возвращена");
        }
        loan.setReturnedAt(LocalDateTime.now());
        loan.setStatus(LoanStatus.RETURNED);
        loan.getCopy().setStatus(CopyStatus.AVAILABLE);
        copyRepository.save(loan.getCopy());
        LoanEntity saved = loanRepository.save(loan);
        auditService.log(currentUserService.getCurrentUser(), "loan", saved.getId(), "RETURNED");
        return toResponse(saved);
    }

    private LoanDtos.LoanResponse toResponse(LoanEntity loan) {
        return new LoanDtos.LoanResponse(
                loan.getId(), loan.getCopy().getId(), loan.getCopy().getInventoryNumber(), loan.getCopy().getBook().getTitle(),
                loan.getReader().getId(), loan.getReader().getFullName(), loan.getReader().getQrCode(), loan.getIssuedAt(),
                loan.getDueAt(), loan.getReturnedAt(), loan.getStatus());
    }
}
