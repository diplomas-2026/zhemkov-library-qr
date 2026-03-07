package com.company.product.api.service;

import com.company.product.api.dto.ReportDtos;
import com.company.product.api.entity.LoanStatus;
import com.company.product.api.entity.ReportEntity;
import com.company.product.api.repository.BookCopyRepository;
import com.company.product.api.repository.BookRepository;
import com.company.product.api.repository.LoanRepository;
import com.company.product.api.repository.ReaderRepository;
import com.company.product.api.repository.ReportRepository;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReportService {
    private final ReportRepository reportRepository;
    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final ReaderRepository readerRepository;
    private final BookCopyRepository copyRepository;
    private final CurrentUserService currentUserService;

    public ReportService(ReportRepository reportRepository, LoanRepository loanRepository, BookRepository bookRepository,
                         ReaderRepository readerRepository, BookCopyRepository copyRepository, CurrentUserService currentUserService) {
        this.reportRepository = reportRepository;
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.readerRepository = readerRepository;
        this.copyRepository = copyRepository;
        this.currentUserService = currentUserService;
    }

    public List<ReportDtos.ReportResponse> list() {
        return reportRepository.findAll().stream()
                .map(r -> new ReportDtos.ReportResponse(r.getId(), r.getType(), r.getPeriodFrom(), r.getPeriodTo(),
                        r.getGeneratedBy().getFullName(), r.getGeneratedAt()))
                .toList();
    }

    public ReportDtos.ReportResponse generate(ReportDtos.ReportRequest request) {
        String csv = buildCsv();
        ReportEntity entity = new ReportEntity();
        entity.setType(request.type());
        entity.setPeriodFrom(request.periodFrom());
        entity.setPeriodTo(request.periodTo());
        entity.setGeneratedBy(currentUserService.getCurrentUser());
        entity.setGeneratedAt(LocalDateTime.now());
        entity.setCsvContent(csv);
        ReportEntity saved = reportRepository.save(entity);
        return new ReportDtos.ReportResponse(saved.getId(), saved.getType(), saved.getPeriodFrom(), saved.getPeriodTo(),
                saved.getGeneratedBy().getFullName(), saved.getGeneratedAt());
    }

    public byte[] download(Long id) {
        return reportRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Отчет не найден"))
                .getCsvContent().getBytes(StandardCharsets.UTF_8);
    }

    private String buildCsv() {
        long books = bookRepository.count();
        long readers = readerRepository.count();
        long copies = copyRepository.count();
        long activeLoans = loanRepository.findAll().stream().filter(l -> l.getStatus() == LoanStatus.ACTIVE).count();
        long overdue = loanRepository.findByStatusAndDueAtBefore(LoanStatus.ACTIVE, LocalDateTime.now()).size();
        return "metric,value\n" +
                "books," + books + "\n" +
                "copies," + copies + "\n" +
                "readers," + readers + "\n" +
                "active_loans," + activeLoans + "\n" +
                "overdue," + overdue + "\n";
    }
}
