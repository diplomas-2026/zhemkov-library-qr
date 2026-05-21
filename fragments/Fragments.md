


### Рисунок 2.25 – Фрагменткода регистрации и авторизации пользователя

### [Скрин кода](./img_1.png)

```java
@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

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
}
```
### Рисунок 2.26 – Фрагменткода проверки роли пользователя

### [Скрин кода](./img_2.png)

```java
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { request } from '../lib/api';
import { saveAuth } from '../lib/auth';
import Notice from '../components/Notice';
import { setFlash } from '../lib/flash';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    }
    try {
      setLoading(true);
      const data = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName })
      });
      saveAuth(data);
      setFlash({ type: 'success', text: 'Регистрация выполнена' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-grid">
        <section className="login-hero">
          <div className="kicker">Регистрация</div>
          <h1 style={{ marginTop: 14 }}>
            Создайте учетную запись и сохраняйте <span className="hl">историю</span> работы
          </h1>
          <p>
            После регистрации вы сможете входить в систему и использовать доступные функции в соответствии с ролью.
          </p>
        </section>
        <form className="panel login-form" onSubmit={submit}>
          <h2>Создать аккаунт</h2>
          <p>Введите данные — это займет минуту.</p>
          <label>
            ФИО
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Например, Иванов Иван" />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="username" />
          </label>
          <label>
            Пароль
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </label>
          <label>
            Повтор пароля
            <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} autoComplete="new-password" />
          </label>
          {error && (
            <Notice type="error" title="Ошибка регистрации" onClose={() => setError('')}>
              {error}
            </Notice>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading && <span className="spinner" />}
            Зарегистрироваться
          </button>
          <Link className="btn btn-ghost" to="/login">Уже есть аккаунт? Войти</Link>
```
### Рисунок 2.27 – Фрагменткода получения и сохранения книг

### [Скрин кода](./img_3.png)

```java
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
        linkReaderUsers();
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
```
### Рисунок 2.28 – Фрагменткода работы с экземплярами книг

### [Скрин кода](./img_4.png)

```java
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
        linkReaderUsers();
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
```
### Рисунок 2.29 – Фрагменткода поиска читателя по штрихкоду

### [Скрин кода](./img_5.png)

```java
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../lib/api';
import Notice from '../components/Notice';
import { readerRoleTypeLabel } from '../lib/labels';
import ScannerDialog from '../components/ScannerDialog';

export default function ReadersPage() {
  const [readers, setReaders] = useState([]);
  const [qrCode, setQrCode] = useState('RDR-79001');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [finding, setFinding] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setReaders(await request('/api/readers'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openByCode = async (code) => {
    setError('');
    try {
      setFinding(true);
      const data = await request(`/api/readers/qr/${encodeURIComponent(code)}`);
      navigate(`/readers/${data.reader.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setFinding(false);
    }
  };

  const findByQr = async (e) => {
    e.preventDefault();
    await openByCode(qrCode);
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <div className="kicker">Обслуживание</div>
          <h1 className="page-title">Читатели и <span className="hl">штрихкод</span></h1>
          <p className="page-subtitle">
            Быстрый поиск читателя по штрихкоду и просмотр истории выдач.
          </p>
        </div>
      </header>

      <form onSubmit={findByQr} className="panel panel-soft inline-form">
        <input value={qrCode} onChange={(e) => setQrCode(e.target.value)} placeholder="Штрихкод читателя (например, RDR-79001)" />
        <button type="button" className="btn btn-secondary" onClick={() => setScanOpen(true)} disabled={finding}>
          Сканировать
        </button>
        <button className="btn btn-primary" disabled={finding}>
          {finding && <span className="spinner" />}
          Найти
        </button>
      </form>

      <ScannerDialog
        open={scanOpen}
        title="Сканирование кода читателя"
        hint="Разрешите доступ к камере. Штрихкод можно сканировать с карточки читателя."
        onClose={() => setScanOpen(false)}
        onDetected={(text) => {
          setQrCode(text);
          openByCode(text);
        }}
```
### Рисунок 2.30 – Фрагменткода оформления выдачи книги

### [Скрин кода](./img_6.png)

```java
package com.company.product.api.service;

import com.company.product.api.dto.LoanDtos;
import com.company.product.api.entity.CopyStatus;
import com.company.product.api.entity.LoanEntity;
import com.company.product.api.entity.LoanStatus;
import com.company.product.api.repository.BookCopyRepository;
import com.company.product.api.repository.LoanRepository;
import com.company.product.api.repository.ReaderRepository;
import com.company.product.api.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class LoanService {
    private final LoanRepository loanRepository;
    private final BookCopyRepository copyRepository;
    private final ReaderRepository readerRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final AuditService auditService;

    public LoanService(LoanRepository loanRepository, BookCopyRepository copyRepository, ReaderRepository readerRepository,
                       UserRepository userRepository, CurrentUserService currentUserService, AuditService auditService) {
        this.loanRepository = loanRepository;
        this.copyRepository = copyRepository;
        this.readerRepository = readerRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.auditService = auditService;
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
```
### Рисунок 2.31 – Фрагменткода возврата книги

### [Скрин кода](./img_7.png)

```java
package com.company.product.api.service;

import com.company.product.api.dto.LoanDtos;
import com.company.product.api.entity.CopyStatus;
import com.company.product.api.entity.LoanEntity;
import com.company.product.api.entity.LoanStatus;
import com.company.product.api.repository.BookCopyRepository;
import com.company.product.api.repository.LoanRepository;
import com.company.product.api.repository.ReaderRepository;
import com.company.product.api.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class LoanService {
    private final LoanRepository loanRepository;
    private final BookCopyRepository copyRepository;
    private final ReaderRepository readerRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final AuditService auditService;

    public LoanService(LoanRepository loanRepository, BookCopyRepository copyRepository, ReaderRepository readerRepository,
                       UserRepository userRepository, CurrentUserService currentUserService, AuditService auditService) {
        this.loanRepository = loanRepository;
        this.copyRepository = copyRepository;
        this.readerRepository = readerRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.auditService = auditService;
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
```
### Рисунок 2.32 – Фрагменткода формирования CSV-отчета

### [Скрин кода](./img_8.png)

```java
import { useEffect, useState } from 'react';
import { request, API_URL } from '../lib/api';
import { getUser, hasRole } from '../lib/auth';
import Notice from '../components/Notice';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ type: 'ISSUES_BY_PERIOD', periodFrom: '2026-01-01', periodTo: '2026-12-31' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = getUser();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setReports(await request('/api/reports'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await request('/api/reports/generate', { method: 'POST', body: JSON.stringify(form) });
      setSuccess('Отчет сформирован');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const download = async (reportId) => {
    setDownloadingId(reportId);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reports/${reportId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.status === 401 || res.status === 403) {
        throw new Error('Недостаточно прав или истекла сессия');
      }
      if (!res.ok) {
        throw new Error('Не удалось скачать файл');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess('Файл скачан');
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section>
      <header className="page-header">
        <div>
```
### Рисунок 2.33 – Фрагменткода получения dashboard статистики

### [Скрин кода](./img_9.png)

```java
package com.company.product.api.controller;

import com.company.product.api.dto.DashboardDto;
import com.company.product.api.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardDto get() {
        return dashboardService.get();
    }
}
```
### Рисунок 2.34 – Фрагменткода клиентского запроса к API

### [Скрин кода](./img_10.png)

```java
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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

export function apiAssetUrl(maybeRelativeUrl) {
  if (!maybeRelativeUrl) return null;
  if (maybeRelativeUrl.startsWith('http://') || maybeRelativeUrl.startsWith('https://')) return maybeRelativeUrl;
  return `${API_URL}${maybeRelativeUrl}`;
}

export { API_URL };
```

### Листинг кода программного продукта страниц на 3-4.

```java
package com.company.product.api.service;

import com.company.product.api.dto.AuthDtos;
import com.company.product.api.entity.UserEntity;
import com.company.product.api.entity.UserRole;
import com.company.product.api.repository.UserRepository;
import com.company.product.api.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

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
}

package com.company.product.api.service;

import com.company.product.api.dto.UserDtos;
import com.company.product.api.entity.UserEntity;
import com.company.product.api.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
}
```
