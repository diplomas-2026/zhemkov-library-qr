package com.company.product.api.controller;

import com.company.product.api.dto.CommentDtos;
import com.company.product.api.service.CommentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/book/{bookId}")
    public List<CommentDtos.CommentResponse> list(@PathVariable Long bookId) {
        return commentService.listByBook(bookId);
    }

    @PostMapping
    public CommentDtos.CommentResponse create(@Valid @RequestBody CommentDtos.CommentRequest request) {
        return commentService.create(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        commentService.delete(id);
    }
}
