package com.company.product.api.repository;

import com.company.product.api.entity.ReaderEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReaderRepository extends JpaRepository<ReaderEntity, Long> {
    Optional<ReaderEntity> findByQrCode(String qrCode);
}
