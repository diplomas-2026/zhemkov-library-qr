package com.company.product.api.service;

import com.company.product.api.dto.BookDtos;
import com.company.product.api.entity.BookCopyEntity;
import com.company.product.api.entity.BookEntity;
import com.company.product.api.entity.CopyStatus;
import com.company.product.api.repository.BookCopyRepository;
import com.company.product.api.repository.BookRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final BookCopyRepository copyRepository;

    public BookService(BookRepository bookRepository, BookCopyRepository copyRepository) {
        this.bookRepository = bookRepository;
        this.copyRepository = copyRepository;
    }

    public List<BookDtos.BookResponse> list(String q) {
        List<BookEntity> books = (q == null || q.isBlank()) ? bookRepository.findAll() :
                bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(q, q);
        return books.stream().map(this::toBookResponse).toList();
    }

    public BookDtos.BookResponse get(Long id) {
        BookEntity book = bookRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Книга не найдена"));
        return toBookResponse(book);
    }

    @Transactional
    public BookDtos.BookResponse create(BookDtos.BookRequest request) {
        BookEntity entity = new BookEntity();
        patch(entity, request);
        return toBookResponse(bookRepository.save(entity));
    }

    @Transactional
    public BookDtos.BookResponse update(Long id, BookDtos.BookRequest request) {
        BookEntity entity = bookRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Книга не найдена"));
        patch(entity, request);
        return toBookResponse(bookRepository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        bookRepository.deleteById(id);
    }

    @Transactional
    public BookDtos.BookResponse uploadCover(Long bookId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Файл обложки не выбран");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Разрешены только изображения");
        }
        if (file.getSize() > 5L * 1024 * 1024) {
            throw new IllegalArgumentException("Файл слишком большой (макс. 5 МБ)");
        }

        BookEntity book = bookRepository.findById(bookId).orElseThrow(() -> new IllegalArgumentException("Книга не найдена"));
        String ext = extensionFor(contentType);
        String fileName = "book-" + bookId + "-" + UUID.randomUUID() + ext;
        Path dir = Path.of("uploads", "covers");
        Path target = dir.resolve(fileName);
        try {
            Files.createDirectories(dir);
            file.transferTo(target);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Не удалось сохранить файл обложки");
        }
        book.setCoverUrl("/uploads/covers/" + fileName);
        return toBookResponse(bookRepository.save(book));
    }

    @Transactional
    public BookDtos.BookResponse removeCover(Long bookId) {
        BookEntity book = bookRepository.findById(bookId).orElseThrow(() -> new IllegalArgumentException("Книга не найдена"));
        book.setCoverUrl(null);
        return toBookResponse(bookRepository.save(book));
    }

    public List<BookDtos.CopyResponse> listCopies() {
        return copyRepository.findAll().stream().map(this::toCopyResponse).toList();
    }

    @Transactional
    public BookDtos.CopyResponse createCopy(BookDtos.CopyRequest request) {
        BookCopyEntity copy = new BookCopyEntity();
        patchCopy(copy, request);
        return toCopyResponse(copyRepository.save(copy));
    }

    @Transactional
    public BookDtos.CopyResponse updateCopy(Long id, BookDtos.CopyRequest request) {
        BookCopyEntity copy = copyRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Экземпляр не найден"));
        patchCopy(copy, request);
        return toCopyResponse(copyRepository.save(copy));
    }

    private void patch(BookEntity entity, BookDtos.BookRequest request) {
        entity.setTitle(request.title());
        entity.setAuthor(request.author());
        entity.setIsbn(request.isbn());
        entity.setPublisher(request.publisher());
        entity.setPublishYear(request.publishYear());
        entity.setCategory(request.category());
        entity.setDescription(request.description());
    }

    private void patchCopy(BookCopyEntity copy, BookDtos.CopyRequest request) {
        BookEntity book = bookRepository.findById(request.bookId()).orElseThrow(() -> new IllegalArgumentException("Книга не найдена"));
        copy.setBook(book);
        copy.setInventoryNumber(request.inventoryNumber());
        copy.setStatus(request.status());
        copy.setLocation(request.location());
    }

    private BookDtos.BookResponse toBookResponse(BookEntity b) {
        return new BookDtos.BookResponse(
                b.getId(), b.getTitle(), b.getAuthor(), b.getIsbn(), b.getPublisher(), b.getPublishYear(),
                b.getCategory(), b.getDescription(), b.getCoverUrl(),
                copyRepository.countByBookIdAndStatus(b.getId(), CopyStatus.AVAILABLE));
    }

    private BookDtos.CopyResponse toCopyResponse(BookCopyEntity c) {
        return new BookDtos.CopyResponse(c.getId(), c.getBook().getId(), c.getBook().getTitle(), c.getInventoryNumber(), c.getStatus(), c.getLocation());
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "image/jpeg", "image/jpg" -> ".jpg";
            default -> "";
        };
    }
}
