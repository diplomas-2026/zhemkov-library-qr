


### Рисунок 2.25 – Фрагменткода реализации авторизации пользователя

### [Скрин кода](./img_1.png)

```java
@PostConstruct
    public void init() {
        System.out.println("Application started - 1.0.0");
    }
```
### Рисунок 2.26 – Фрагменткода проверки роли пользователя

### [Скрин кода](./img_2.png)

```java
@PostConstruct
    public void init() {
        System.out.println("Application started - 1.0.0");
    }
```
### Рисунок 2.27 – Фрагменткода получения и сохранения книг

### [Скрин кода](./img_3.png)

```java
@PostConstruct
    public void init() {
        System.out.println("Application started - 1.0.0");
    }
```
### Рисунок 2.28 – Фрагменткода работы с экземплярами книг

### [Скрин кода](./img_4.png)

```java
@PostConstruct
    public void init() {
        System.out.println("Application started - 1.0.0");
    }
```
### Рисунок 2.29 – Фрагменткода поиска читателя по штрихкоду

### [Скрин кода](./img_5.png)

```java
@PostConstruct
    public void init() {
        System.out.println("Application started - 1.0.0");
    }
```
### Рисунок 2.30 – Фрагменткода оформления выдачи книги

### [Скрин кода](./img_6.png)

```java
@PostConstruct
    public void init() {
        System.out.println("Application started - 1.0.0");
    }
```
### Рисунок 2.31 – Фрагменткода возврата книги

### [Скрин кода](./img_7.png)

```java
@PostConstruct
    public void init() {
        System.out.println("Application started - 1.0.0");
    }
```
### Рисунок 2.32 – Фрагменткода формирования CSV-отчета

### [Скрин кода](./img_8.png)

```java
@PostConstruct
    public void init() {
        System.out.println("Application started - 1.0.0");
    }
```
### Рисунок 2.33 – Фрагменткода получения статистики для dashboard

### [Скрин кода](./img_9.png)

```java
@PostConstruct
    public void init() {
        System.out.println("Application started - 1.0.0");
    }
```
### Рисунок 2.34 – Фрагменткода клиентского запроса к API

### [Скрин кода](./img_10.png)

```java
@PostConstruct
    public void init() {
        System.out.println("Application started - 1.0.0");
    }
```

### Листинг кода программного продукта страниц на 3-4.

```java
public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        String token = jwtService.generate(user);
        return new AuthDtos.AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }

public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email уже зарегистрирован");
        }

        UserEntity user = new UserEntity();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setRole(UserRole.READER);
        user.setActive(true);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);

        String token = jwtService.generate(user);
        return new AuthDtos.AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }

public List<UserDtos.UserResponse> list() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

@Transactional
    public UserDtos.UserResponse create(UserDtos.CreateUserRequest request) {
        UserEntity user = new UserEntity();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setRole(request.role());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setActive(true);
        return toResponse(userRepository.save(user));
    }

@Transactional
    public UserDtos.UserResponse updateRole(Long id, UserDtos.UpdateRoleRequest request) {
        UserEntity user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        user.setRole(request.role());
        return toResponse(userRepository.save(user));
    }

@Transactional
    public UserDtos.UserResponse updateActive(Long id, UserDtos.UpdateActiveRequest request) {
        UserEntity user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        user.setActive(request.active());
        return toResponse(userRepository.save(user));
    }

private UserDtos.UserResponse toResponse(UserEntity user) {
        return new UserDtos.UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.isActive());
    }

public String generate(UserEntity user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(properties.expirationMinutes(), ChronoUnit.MINUTES)))
                .signWith(signingKey())
                .compact();
    }

public String extractSubject(String token) {
        return parse(token).getSubject();
    }

public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

public String extractSubject(String token) {
        return parse(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

private Key signingKey() {
        return Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }

public void log(UserEntity actor, String entity, Long entityId, String action) {
        AuditLogEntity log = new AuditLogEntity();
        log.setActor(actor);
        log.setEntity(entity);
        log.setEntityId(entityId);
        log.setAction(action);
        auditLogRepository.save(log);
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

public UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
    }

public DashboardDto get() {
        long totalBooks = bookRepository.count();
        long totalCopies = copyRepository.count();
        long availableCopies = copyRepository.findByStatus(CopyStatus.AVAILABLE).size();
        long activeLoans = loanRepository.findAll().stream().filter(l -> l.getStatus() == LoanStatus.ACTIVE).count();
        long overdueLoans = loanRepository.findByStatusAndDueAtBefore(LoanStatus.ACTIVE, LocalDateTime.now()).size();
        return new DashboardDto(totalBooks, totalCopies, availableCopies, activeLoans, overdueLoans, readerRepository.count(), commentRepository.count());
    }

public List<LoanDtos.LoanResponse> list() {
        return loanRepository.findAll().stream().map(this::toResponse).toList();
    }

public List<LoanDtos.LoanResponse> listByReader(Long readerId) {
        return loanRepository.findByReaderIdOrderByIssuedAtDesc(readerId).stream().map(this::toResponse).toList();
    }

public List<LoanDtos.LoanResponse> overdue() {
        return loanRepository.findByStatusAndDueAtBefore(LoanStatus.ACTIVE, LocalDateTime.now())
                .stream().map(this::toResponse).toList();
    }

@Transactional
    public LoanDtos.LoanResponse issue(LoanDtos.IssueRequest request) {
        var reader = readerRepository.findByQrCode(request.readerQrCode())
                .orElseThrow(() -> new IllegalArgumentException("QR-код не найден"));
        var copy = copyRepository.findById(request.copyId())
                .orElseThrow(() -> new IllegalArgumentException("Экземпляр не найден"));
        if (copy.getStatus() != CopyStatus.AVAILABLE) {
            throw new IllegalArgumentException("Экземпляр недоступен для выдачи");
        }
        if (request.dueAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Срок возврата не может быть в прошлом");
        }

        var actor = currentUserService.getCurrentUser();
        LoanEntity loan = new LoanEntity();
        loan.setReader(reader);
        loan.setCopy(copy);
        loan.setIssuedBy(userRepository.findById(actor.getId()).orElseThrow());
        loan.setIssuedAt(LocalDateTime.now());
        loan.setDueAt(request.dueAt());
        loan.setStatus(LoanStatus.ACTIVE);
        copy.setStatus(CopyStatus.ISSUED);
        copyRepository.save(copy);
        LoanEntity saved = loanRepository.save(loan);
        auditService.log(actor, "loan", saved.getId(), "ISSUED");
        return toResponse(saved);
    }

@Transactional
    public LoanDtos.LoanResponse returnLoan(Long id) {
        LoanEntity loan = loanRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Выдача не найдена"));
        if (loan.getReturnedAt() != null) {
            throw new IllegalArgumentException("Книга уже возвращена");
        }
        loan.setReturnedAt(LocalDateTime.now());
        loan.setStatus(LoanStatus.RETURNED);
        loan.getCopy().setStatus(CopyStatus.AVAILABLE);
        copyRepository.save(loan.getCopy());
        LoanEntity saved = loanRepository.save(loan);
        auditService.log(currentUserService.getCurrentUser(), "loan", saved.getId(), "RETURNED");
        return toResponse(saved);
    }
```
