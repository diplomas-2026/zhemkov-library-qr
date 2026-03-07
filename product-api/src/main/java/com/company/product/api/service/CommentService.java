package com.company.product.api.service;

import com.company.product.api.dto.CommentDtos;
import com.company.product.api.entity.CommentEntity;
import com.company.product.api.repository.BookRepository;
import com.company.product.api.repository.CommentRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final BookRepository bookRepository;
    private final CurrentUserService currentUserService;

    public CommentService(CommentRepository commentRepository, BookRepository bookRepository, CurrentUserService currentUserService) {
        this.commentRepository = commentRepository;
        this.bookRepository = bookRepository;
        this.currentUserService = currentUserService;
    }

    public List<CommentDtos.CommentResponse> listByBook(Long bookId) {
        return commentRepository.findByBookIdOrderByCreatedAtDesc(bookId).stream()
                .map(c -> new CommentDtos.CommentResponse(c.getId(), c.getBook().getId(), c.getUser().getFullName(), c.getBody(), c.getCreatedAt()))
                .toList();
    }

    @Transactional
    public CommentDtos.CommentResponse create(CommentDtos.CommentRequest request) {
        var user = currentUserService.getCurrentUser();
        var book = bookRepository.findById(request.bookId()).orElseThrow(() -> new IllegalArgumentException("Книга не найдена"));
        CommentEntity entity = new CommentEntity();
        entity.setUser(user);
        entity.setBook(book);
        entity.setBody(request.body());
        CommentEntity saved = commentRepository.save(entity);
        return new CommentDtos.CommentResponse(saved.getId(), saved.getBook().getId(), saved.getUser().getFullName(), saved.getBody(), saved.getCreatedAt());
    }

    @Transactional
    public void delete(Long id) {
        commentRepository.deleteById(id);
    }
}
