TRUNCATE TABLE audit_logs, reports, comments, loans, readers, book_copies, books, users RESTART IDENTITY CASCADE;

INSERT INTO users (id, email, password_hash, full_name, role, active, created_at) VALUES
(1, 'admin79@school.local', '$2y$10$wxMP.Lla6dGbiHxF0TGv8.SlAv.n6HkoynDEISj0bxswE45z0Dvzq', 'Администратор библиотеки', 'ADMIN', true, now()),
(2, 'librarian79@school.local', '$2y$10$gSR/E4.Gcg5w426rkDkhP.HhcT5n0SO2.37T2977pPsGJfdtUMEV6', 'Библиотекарь школы №79', 'LIBRARIAN', true, now()),
(3, 'reader79@school.local', '$2y$10$zYlDeq0QVe3F7gBdL4mUK.WsVMiQkDIkCh6pcH6BX62s6okVNq0L.', 'Читатель школы №79', 'READER', true, now()),
(4, 'teacher79@school.local', '$2y$10$zYlDeq0QVe3F7gBdL4mUK.WsVMiQkDIkCh6pcH6BX62s6okVNq0L.', 'Учитель литературы', 'READER', true, now());

INSERT INTO books (id, title, author, isbn, publisher, publish_year, category, description, cover_url, created_at) VALUES
(1, 'Война и мир', 'Лев Толстой', '9785170909001', 'АСТ', 2020, 'Классическая литература', 'Роман-эпопея о русском обществе начала XIX века.', '/uploads/covers/war-and-peace.jpg', now()),
(2, 'Преступление и наказание', 'Фёдор Достоевский', '9785170909018', 'АСТ', 2019, 'Классическая литература', 'Психологический роман о преступлении, вине и искуплении.', '/uploads/covers/crime-and-punishment.jpg', now()),
(3, 'Мастер и Маргарита', 'Михаил Булгаков', '9785170909025', 'Эксмо', 2021, 'Роман', 'Мистический роман о добре и зле, любви и свободе.', '/uploads/covers/master-and-margarita.jpg', now()),
(4, 'Евгений Онегин', 'Александр Пушкин', '9785170909032', 'Просвещение', 2018, 'Поэзия', 'Роман в стихах о судьбе, любви и выборе.', NULL, now()),
(5, 'Герой нашего времени', 'Михаил Лермонтов', '9785170909049', 'Эксмо', 2020, 'Классическая литература', 'Цикл повестей о Печорине и нравственных конфликтах эпохи.', NULL, now()),
(6, 'Отцы и дети', 'Иван Тургенев', '9785170909056', 'Азбука', 2022, 'Классическая литература', 'Роман о конфликте поколений и идеологий.', NULL, now()),
(7, 'Капитанская дочка', 'Александр Пушкин', '9785170909063', 'Детская литература', 2017, 'Исторический роман', 'История чести, долга и любви на фоне Пугачёвского восстания.', NULL, now()),
(8, 'Мёртвые души', 'Николай Гоголь', '9785170909070', 'Эксмо', 2019, 'Сатира', 'Поэма о нравственном состоянии общества и человеческих пороках.', NULL, now());

INSERT INTO book_copies (id, book_id, inventory_number, status, location) VALUES
(1, 1, 'INV-1-1', 'AVAILABLE', 'Стеллаж 1'),
(2, 1, 'INV-1-2', 'ISSUED', 'Стеллаж 1'),
(3, 1, 'INV-1-3', 'AVAILABLE', 'Стеллаж 1'),
(4, 2, 'INV-2-1', 'ISSUED', 'Стеллаж 2'),
(5, 2, 'INV-2-2', 'AVAILABLE', 'Стеллаж 2'),
(6, 2, 'INV-2-3', 'AVAILABLE', 'Стеллаж 2'),
(7, 3, 'INV-3-1', 'ISSUED', 'Стеллаж 3'),
(8, 3, 'INV-3-2', 'AVAILABLE', 'Стеллаж 3'),
(9, 3, 'INV-3-3', 'AVAILABLE', 'Стеллаж 3'),
(10, 4, 'INV-4-1', 'AVAILABLE', 'Стеллаж 4'),
(11, 4, 'INV-4-2', 'AVAILABLE', 'Стеллаж 4'),
(12, 5, 'INV-5-1', 'AVAILABLE', 'Стеллаж 5'),
(13, 5, 'INV-5-2', 'AVAILABLE', 'Стеллаж 5'),
(14, 6, 'INV-6-1', 'AVAILABLE', 'Стеллаж 1'),
(15, 6, 'INV-6-2', 'ISSUED', 'Стеллаж 1'),
(16, 7, 'INV-7-1', 'AVAILABLE', 'Стеллаж 2'),
(17, 7, 'INV-7-2', 'AVAILABLE', 'Стеллаж 2'),
(18, 8, 'INV-8-1', 'AVAILABLE', 'Стеллаж 3'),
(19, 8, 'INV-8-2', 'AVAILABLE', 'Стеллаж 3');

INSERT INTO readers (id, full_name, role_type, class_name, contact, qr_code, user_id, created_at) VALUES
(1, 'Иван Петров', 'STUDENT', '8А', 'ivan.petrov@school.local', 'RDR-79001', 3, now()),
(2, 'Мария Соколова', 'STUDENT', '9Б', 'maria.sokolova@school.local', 'RDR-79002', NULL, now()),
(3, 'Алексей Кузнецов', 'STUDENT', '10А', 'alex.kuznetsov@school.local', 'RDR-79003', NULL, now()),
(4, 'Ольга Смирнова', 'TEACHER', NULL, 'olga.smirnova@school.local', 'RDR-79004', 4, now()),
(5, 'Дмитрий Орлов', 'STUDENT', '11Б', 'dmitry.orlov@school.local', 'RDR-79005', NULL, now()),
(6, 'Елена Белова', 'TEACHER', NULL, 'elena.belova@school.local', 'RDR-79006', NULL, now());

INSERT INTO loans (id, copy_id, reader_id, issued_by, issued_at, due_at, returned_at, status) VALUES
(1, 2, 1, 2, now() - interval '10 days', now() - interval '2 days', NULL, 'ACTIVE'),
(2, 4, 2, 2, now() - interval '6 days', now() + interval '8 days', NULL, 'ACTIVE'),
(3, 7, 4, 2, now() - interval '14 days', now() - interval '1 day', now() - interval '1 day', 'RETURNED'),
(4, 15, 3, 1, now() - interval '3 days', now() + interval '12 days', NULL, 'ACTIVE');

INSERT INTO comments (id, book_id, user_id, body, created_at) VALUES
(1, 1, 3, 'Очень помогло при подготовке к уроку литературы.', now() - interval '2 days'),
(2, 2, 3, 'Сильное произведение, рекомендую для старших классов.', now() - interval '1 day'),
(3, 3, 4, 'Интересно обсуждать на кружке по чтению.', now() - interval '3 hours'),
(4, 6, 3, 'Хороший материал для сочинения по конфликту поколений.', now() - interval '5 hours');

INSERT INTO reports (id, type, period_from, period_to, generated_by, generated_at, csv_content) VALUES
(1, 'LIBRARY_OVERVIEW', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, 2, now() - interval '1 day',
 'metric,value\nbooks,8\ncopies,19\nreaders,6\nactive_loans,3\noverdue,1\n'),
(2, 'MONTHLY_ACTIVITY', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '30 days', 1, now() - interval '20 hours',
 'metric,value\nbooks,8\ncopies,19\nreaders,6\nactive_loans,2\noverdue,0\n');

INSERT INTO audit_logs (id, actor_id, entity, entity_id, action, created_at) VALUES
(1, 2, 'loan', 1, 'ISSUED', now() - interval '10 days'),
(2, 2, 'loan', 2, 'ISSUED', now() - interval '6 days'),
(3, 2, 'loan', 3, 'ISSUED', now() - interval '14 days'),
(4, 2, 'loan', 3, 'RETURNED', now() - interval '1 day'),
(5, 1, 'loan', 4, 'ISSUED', now() - interval '3 days'),
(6, 1, 'report', 1, 'GENERATED', now() - interval '1 day'),
(7, 2, 'report', 2, 'GENERATED', now() - interval '20 hours');

SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('books_id_seq', COALESCE((SELECT MAX(id) FROM books), 1));
SELECT setval('book_copies_id_seq', COALESCE((SELECT MAX(id) FROM book_copies), 1));
SELECT setval('readers_id_seq', COALESCE((SELECT MAX(id) FROM readers), 1));
SELECT setval('loans_id_seq', COALESCE((SELECT MAX(id) FROM loans), 1));
SELECT setval('comments_id_seq', COALESCE((SELECT MAX(id) FROM comments), 1));
SELECT setval('reports_id_seq', COALESCE((SELECT MAX(id) FROM reports), 1));
SELECT setval('audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM audit_logs), 1));
