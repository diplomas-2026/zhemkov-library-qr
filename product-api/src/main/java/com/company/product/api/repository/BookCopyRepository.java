package com.company.product.api.repository;

import com.company.product.api.entity.BookCopyEntity;
import com.company.product.api.entity.CopyStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookCopyRepository extends JpaRepository<BookCopyEntity, Long> {
    Optional<BookCopyEntity> findByInventoryNumber(String inventoryNumber);
    List<BookCopyEntity> findByStatus(CopyStatus status);
    long countByBookIdAndStatus(Long bookId, CopyStatus status);
}
