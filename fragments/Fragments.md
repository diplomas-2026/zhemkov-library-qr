### Рисунок 2.25 – Фрагменткода реализации авторизации пользователя

### [Скрин кода](./img_1.png)

```java
public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
    authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
    var user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
    String token = jwtService.generate(user);
    return new AuthDtos.AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole());
}
```

### Рисунок 2.26 – Фрагменткода проверки роли пользователя

### [Скрин кода](./img_2.png)

```java
@PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
@PostMapping("/issue")
public LoanDtos.LoanResponse issue(@Valid @RequestBody LoanDtos.IssueRequest request) {
    return loanService.issue(request);
}
```

### Рисунок 2.27 – Фрагменткода получения и сохранения книг

### [Скрин кода](./img_3.png)

```java
@Transactional
public BookDtos.BookResponse create(BookDtos.BookRequest request) {
    BookEntity entity = new BookEntity();
    patch(entity, request);
    return toBookResponse(bookRepository.save(entity));
}
```

### Рисунок 2.28 – Фрагменткода работы с экземплярами книг

### [Скрин кода](./img_4.png)

```java
@Transactional
public BookDtos.CopyResponse updateCopy(Long id, BookDtos.CopyRequest request) {
    BookCopyEntity copy = copyRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Экземпляр не найден"));
    patchCopy(copy, request);
    return toCopyResponse(copyRepository.save(copy));
}
```

### Рисунок 2.29 – Фрагменткода поиска читателя по штрихкоду

### [Скрин кода](./img_5.png)

```java
public ReaderDtos.ReaderQrLookupResponse byQr(String qrCode) {
    ReaderEntity reader = readerRepository.findByQrCode(qrCode).orElseThrow(() -> new IllegalArgumentException("QR-код не найден"));
    List<LoanDtos.LoanResponse> loans = loanService.listByReader(reader.getId());
    return new ReaderDtos.ReaderQrLookupResponse(toResponse(reader), loans);
}
```

### Рисунок 2.30 – Фрагменткода оформления выдачи книги

### [Скрин кода](./img_6.png)

```java
@Transactional
public LoanDtos.LoanResponse issue(LoanDtos.IssueRequest request) {
    var reader = readerRepository.findByQrCode(request.readerQrCode())
            .orElseThrow(() -> new IllegalArgumentException("QR-код не найден"));
    var copy = copyRepository.findById(request.copyId())
            .orElseThrow(() -> new IllegalArgumentException("Экземпляр не найден"));
    if (copy.getStatus() != CopyStatus.AVAILABLE) {
        throw new IllegalArgumentException("Экземпляр недоступен для выдачи");
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
```

### Рисунок 2.31 – Фрагменткода возврата книги

### [Скрин кода](./img_7.png)

```java
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

### Рисунок 2.32 – Фрагменткода формирования CSV-отчета

### [Скрин кода](./img_8.png)

```java
private String buildCsv() {
    long books = bookRepository.count();
    long readers = readerRepository.count();
    long copies = copyRepository.count();
    long activeLoans = loanRepository.findAll().stream().filter(l -> l.getStatus() == LoanStatus.ACTIVE).count();
    long overdue = loanRepository.findByStatusAndDueAtBefore(LoanStatus.ACTIVE, LocalDateTime.now()).size();
    return "metric,value\\n" +
            "books," + books + "\\n" +
            "copies," + copies + "\\n" +
            "readers," + readers + "\\n" +
            "active_loans," + activeLoans + "\\n" +
            "overdue," + overdue + "\\n";
}
```

### Рисунок 2.33 – Фрагменткода получения статистики для дашборда

### [Скрин кода](./img_9.png)

```java
public DashboardDto get() {
    long totalBooks = bookRepository.count();
    long totalCopies = copyRepository.count();
    long availableCopies = copyRepository.findByStatus(CopyStatus.AVAILABLE).size();
    long activeLoans = loanRepository.findAll().stream().filter(l -> l.getStatus() == LoanStatus.ACTIVE).count();
    long overdueLoans = loanRepository.findByStatusAndDueAtBefore(LoanStatus.ACTIVE, LocalDateTime.now()).size();
    return new DashboardDto(totalBooks, totalCopies, availableCopies, activeLoans, overdueLoans, readerRepository.count(), commentRepository.count());
}
```

### Рисунок 2.34 – Фрагменткода клиентского запроса к API

### [Скрин кода](./img_10.png)

```javascript
export async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Недостаточно прав или истекла сессия');
  }

  if (!response.ok) {
    let message = 'Ошибка запроса';
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
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

public ReaderDtos.ReaderQrLookupResponse byQr(String qrCode) {
    ReaderEntity reader = readerRepository.findByQrCode(qrCode).orElseThrow(() -> new IllegalArgumentException("QR-код не найден"));
    List<LoanDtos.LoanResponse> loans = loanService.listByReader(reader.getId());
    return new ReaderDtos.ReaderQrLookupResponse(toResponse(reader), loans);
}

@Transactional
public ReaderDtos.ReaderResponse myReader() {
    var user = currentUserService.getCurrentUser();
    ReaderEntity reader = readerRepository.findByUserId(user.getId())
            .orElseGet(() -> readerRepository.findByContact(user.getEmail()).orElse(null));
    if (reader == null) {
        throw new IllegalArgumentException("Профиль читателя не найден");
    }
    if (reader.getUser() == null) {
        reader.setUser(user);
        readerRepository.save(reader);
    }
    return toResponse(reader);
}

public List<LoanDtos.LoanResponse> list() {
    return loanRepository.findAll().stream().map(this::toResponse).toList();
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

public ReportDtos.ReportResponse generate(ReportDtos.ReportRequest request) {
    String csv = buildCsv();
    ReportEntity entity = new ReportEntity();
    entity.setType(request.type());
    entity.setPeriodFrom(request.periodFrom());
    entity.setPeriodTo(request.periodTo());
    entity.setGeneratedBy(currentUserService.getCurrentUser());
    entity.setGeneratedAt(LocalDateTime.now());
    entity.setCsvContent(csv);
    ReportEntity saved = reportRepository.save(entity);
    return new ReportDtos.ReportResponse(saved.getId(), saved.getType(), saved.getPeriodFrom(), saved.getPeriodTo(),
            saved.getGeneratedBy().getFullName(), saved.getGeneratedAt());
}

public byte[] download(Long id) {
    return reportRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Отчет не найден"))
            .getCsvContent().getBytes(StandardCharsets.UTF_8);
}

private String buildCsv() {
    long books = bookRepository.count();
    long readers = readerRepository.count();
    long copies = copyRepository.count();
    long activeLoans = loanRepository.findAll().stream().filter(l -> l.getStatus() == LoanStatus.ACTIVE).count();
    long overdue = loanRepository.findByStatusAndDueAtBefore(LoanStatus.ACTIVE, LocalDateTime.now()).size();
    return "metric,value\\n" +
            "books," + books + "\\n" +
            "copies," + copies + "\\n" +
            "readers," + readers + "\\n" +
            "active_loans," + activeLoans + "\\n" +
            "overdue," + overdue + "\\n";
}

public DashboardDto get() {
    long totalBooks = bookRepository.count();
    long totalCopies = copyRepository.count();
    long availableCopies = copyRepository.findByStatus(CopyStatus.AVAILABLE).size();
    long activeLoans = loanRepository.findAll().stream().filter(l -> l.getStatus() == LoanStatus.ACTIVE).count();
    long overdueLoans = loanRepository.findByStatusAndDueAtBefore(LoanStatus.ACTIVE, LocalDateTime.now()).size();
    return new DashboardDto(totalBooks, totalCopies, availableCopies, activeLoans, overdueLoans, readerRepository.count(), commentRepository.count());
}
```
