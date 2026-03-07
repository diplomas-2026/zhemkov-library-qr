package com.company.product.api.service;

import com.company.product.api.dto.LoanDtos;
import com.company.product.api.entity.*;
import com.company.product.api.repository.*;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.*;

class LoanServiceTest {

    @Test
    void issueShouldFailWhenCopyUnavailable() {
        LoanRepository loanRepository = mock(LoanRepository.class);
        BookCopyRepository copyRepository = mock(BookCopyRepository.class);
        ReaderRepository readerRepository = mock(ReaderRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        LoanService loanService = new LoanService(
                loanRepository,
                copyRepository,
                readerRepository,
                userRepository,
                new CurrentUserService(null),
                new AuditService(null)
        );

        BookCopyEntity copy = new BookCopyEntity();
        copy.setStatus(CopyStatus.ISSUED);
        ReaderEntity reader = new ReaderEntity();
        when(readerRepository.findByQrCode("RDR-1")).thenReturn(Optional.of(reader));
        when(copyRepository.findById(1L)).thenReturn(Optional.of(copy));

        assertThrows(IllegalArgumentException.class,
                () -> loanService.issue(new LoanDtos.IssueRequest("RDR-1", 1L, LocalDateTime.now().plusDays(1))));

        verify(loanRepository, never()).save(any());
    }
}
