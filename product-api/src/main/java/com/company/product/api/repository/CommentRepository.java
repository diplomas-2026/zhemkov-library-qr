package com.company.product.api.repository;

import com.company.product.api.entity.CommentEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    List<CommentEntity> findByBookIdOrderByCreatedAtDesc(Long bookId);
}
