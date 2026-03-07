package com.company.product.api.seed;

import com.company.product.api.entity.*;
import com.company.product.api.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile({"default", "dev", "test"})
public class SeedDataInitializer implements CommandLineRunner {
    private final ObjectMapper objectMapper;
    private final BookRepository bookRepository;
    private final BookCopyRepository copyRepository;
    private final ReaderRepository readerRepository;
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedDataInitializer(ObjectMapper objectMapper, BookRepository bookRepository, BookCopyRepository copyRepository,
                               ReaderRepository readerRepository, UserRepository userRepository, LoanRepository loanRepository,
                               CommentRepository commentRepository, PasswordEncoder passwordEncoder) {
        this.objectMapper = objectMapper;
        this.bookRepository = bookRepository;
        this.copyRepository = copyRepository;
        this.readerRepository = readerRepository;
        this.userRepository = userRepository;
        this.loanRepository = loanRepository;
        this.commentRepository = commentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedBooksAndCopies();
        seedReaders();
        seedLoansAndComments();
        writeUsersFile();
    }

    private void seedUsers() {
        upsertUser("admin79@school.local", "Администратор библиотеки", "Admin123!", UserRole.ADMIN);
        upsertUser("librarian79@school.local", "Библиотекарь школы №79", "Lib123!", UserRole.LIBRARIAN);
        upsertUser("reader79@school.local", "Читатель школы №79", "Read123!", UserRole.READER);
    }

    private void upsertUser(String email, String name, String password, UserRole role) {
        UserEntity user = userRepository.findByEmail(email).orElseGet(UserEntity::new);
        user.setEmail(email);
        user.setFullName(name);
        user.setRole(role);
        user.setActive(true);
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(password));
        }
        userRepository.save(user);
    }

    private void seedBooksAndCopies() throws IOException {
        List<BookSeed> books = readJson("seed-data/books.json", new TypeReference<>() {});
        for (BookSeed item : books) {
            BookEntity book = bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(item.title(), item.author())
                    .stream().filter(b -> b.getTitle().equals(item.title()) && b.getAuthor().equals(item.author())).findFirst()
                    .orElseGet(BookEntity::new);
            book.setTitle(item.title());
            book.setAuthor(item.author());
            book.setIsbn(item.isbn());
            book.setPublisher(item.publisher());
            book.setPublishYear(item.publishYear());
            book.setCategory(item.category());
            book.setDescription(item.description());
            BookEntity saved = bookRepository.save(book);

            for (int i = 1; i <= 3; i++) {
                String inventory = "INV-" + saved.getId() + "-" + i;
                BookCopyEntity copy = copyRepository.findByInventoryNumber(inventory).orElseGet(BookCopyEntity::new);
                copy.setBook(saved);
                copy.setInventoryNumber(inventory);
                copy.setStatus(CopyStatus.AVAILABLE);
                copy.setLocation("Стеллаж " + ((saved.getId() % 5) + 1));
                copyRepository.save(copy);
            }
        }
    }

    private void seedReaders() throws IOException {
        List<ReaderSeed> readers = readJson("seed-data/readers.json", new TypeReference<>() {});
        for (ReaderSeed item : readers) {
            ReaderEntity reader = readerRepository.findByQrCode(item.qrCode()).orElseGet(ReaderEntity::new);
            reader.setFullName(item.fullName());
            reader.setRoleType(ReaderRoleType.valueOf(item.roleType()));
            reader.setClassName(item.className());
            reader.setContact(item.contact());
            reader.setQrCode(item.qrCode());
            readerRepository.save(reader);
        }
    }

    private void seedLoansAndComments() {
        if (loanRepository.count() == 0) {
            var librarian = userRepository.findByEmail("librarian79@school.local").orElseThrow();
            var readers = readerRepository.findAll();
            var copies = copyRepository.findAll();
            for (int i = 0; i < Math.min(4, copies.size()); i++) {
                BookCopyEntity copy = copies.get(i);
                copy.setStatus(CopyStatus.ISSUED);
                copyRepository.save(copy);
                LoanEntity loan = new LoanEntity();
                loan.setCopy(copy);
                loan.setReader(readers.get(i % readers.size()));
                loan.setIssuedBy(librarian);
                loan.setIssuedAt(LocalDateTime.now().minusDays(4 + i));
                loan.setDueAt(LocalDateTime.now().plusDays(5 - i));
                loan.setStatus(LoanStatus.ACTIVE);
                loanRepository.save(loan);
            }
        }

        if (commentRepository.count() == 0) {
            var readerUser = userRepository.findByEmail("reader79@school.local").orElseThrow();
            for (BookEntity book : bookRepository.findAll()) {
                CommentEntity comment = new CommentEntity();
                comment.setBook(book);
                comment.setUser(readerUser);
                comment.setBody("Отличная книга для внеклассного чтения: " + book.getTitle());
                commentRepository.save(comment);
            }
        }
    }

    private void writeUsersFile() throws IOException {
        Path output = Path.of("users.txt");
        List<String> lines = List.of(
                "email=admin79@school.local; password=Admin123!; role=ADMIN",
                "email=librarian79@school.local; password=Lib123!; role=LIBRARIAN",
                "email=reader79@school.local; password=Read123!; role=READER"
        );
        Files.write(output, lines);
    }

    private <T> T readJson(String relativePath, TypeReference<T> typeReference) throws IOException {
        Path directPath = Path.of(relativePath);
        if (Files.exists(directPath)) {
            return objectMapper.readValue(Files.readString(directPath), typeReference);
        }
        try (var stream = getClass().getClassLoader().getResourceAsStream(relativePath)) {
            if (stream == null) {
                throw new IllegalArgumentException("Файл seed не найден: " + relativePath);
            }
            return objectMapper.readValue(stream, typeReference);
        }
    }

    private record BookSeed(String title, String author, String isbn, String publisher, Integer publishYear,
                            String category, String description) {}

    private record ReaderSeed(String fullName, String roleType, String className, String contact, String qrCode) {}
}
