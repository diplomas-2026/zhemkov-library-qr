package com.company.product.api.controller;

import com.company.product.api.dto.BookDtos;
import com.company.product.api.service.BookService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class BookController {
    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/books")
    public List<BookDtos.BookResponse> books(@RequestParam(required = false) String q) {
        return bookService.list(q);
    }

    @GetMapping("/books/{id}")
    public BookDtos.BookResponse book(@PathVariable Long id) {
        return bookService.get(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @PostMapping("/books")
    public BookDtos.BookResponse createBook(@Valid @RequestBody BookDtos.BookRequest request) {
        return bookService.create(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @PutMapping("/books/{id}")
    public BookDtos.BookResponse updateBook(@PathVariable Long id, @Valid @RequestBody BookDtos.BookRequest request) {
        return bookService.update(id, request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @DeleteMapping("/books/{id}")
    public void deleteBook(@PathVariable Long id) {
        bookService.delete(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @PostMapping(value = "/books/{id}/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BookDtos.BookResponse uploadCover(@PathVariable Long id, @RequestPart("file") MultipartFile file) {
        return bookService.uploadCover(id, file);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @DeleteMapping("/books/{id}/cover")
    public BookDtos.BookResponse removeCover(@PathVariable Long id) {
        return bookService.removeCover(id);
    }

    @GetMapping("/copies")
    public List<BookDtos.CopyResponse> copies() {
        return bookService.listCopies();
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @PostMapping("/copies")
    public BookDtos.CopyResponse createCopy(@Valid @RequestBody BookDtos.CopyRequest request) {
        return bookService.createCopy(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    @PutMapping("/copies/{id}")
    public BookDtos.CopyResponse updateCopy(@PathVariable Long id, @Valid @RequestBody BookDtos.CopyRequest request) {
        return bookService.updateCopy(id, request);
    }
}
