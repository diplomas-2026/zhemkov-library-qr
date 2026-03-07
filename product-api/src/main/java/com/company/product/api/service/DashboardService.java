package com.company.product.api.service;

import com.company.product.api.dto.DashboardDto;
import com.company.product.api.entity.CopyStatus;
import com.company.product.api.entity.LoanStatus;
import com.company.product.api.repository.BookCopyRepository;
import com.company.product.api.repository.BookRepository;
import com.company.product.api.repository.CommentRepository;
import com.company.product.api.repository.LoanRepository;
import com.company.product.api.repository.ReaderRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final BookRepository bookRepository;
    private final BookCopyRepository copyRepository;
    private final LoanRepository loanRepository;
    private final ReaderRepository readerRepository;
    private final CommentRepository commentRepository;

    public DashboardService(BookRepository bookRepository, BookCopyRepository copyRepository, LoanRepository loanRepository,
                            ReaderRepository readerRepository, CommentRepository commentRepository) {
        this.bookRepository = bookRepository;
        this.copyRepository = copyRepository;
        this.loanRepository = loanRepository;
        this.readerRepository = readerRepository;
        this.commentRepository = commentRepository;
    }

    public DashboardDto get() {
        long totalBooks = bookRepository.count();
        long totalCopies = copyRepository.count();
        long availableCopies = copyRepository.findByStatus(CopyStatus.AVAILABLE).size();
        long activeLoans = loanRepository.findAll().stream().filter(l -> l.getStatus() == LoanStatus.ACTIVE).count();
        long overdueLoans = loanRepository.findByStatusAndDueAtBefore(LoanStatus.ACTIVE, LocalDateTime.now()).size();
        return new DashboardDto(totalBooks, totalCopies, availableCopies, activeLoans, overdueLoans, readerRepository.count(), commentRepository.count());
    }
}
