package com.company.product.api.repository;

import com.company.product.api.entity.LoanEntity;
import com.company.product.api.entity.LoanStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanRepository extends JpaRepository<LoanEntity, Long> {
    List<LoanEntity> findByReaderIdOrderByIssuedAtDesc(Long readerId);
    List<LoanEntity> findByStatusAndDueAtBefore(LoanStatus status, LocalDateTime dateTime);
}
