create table users (
    id bigserial primary key,
    email varchar(160) not null unique,
    password_hash varchar(255) not null,
    full_name varchar(160) not null,
    role varchar(30) not null,
    active boolean not null default true,
    created_at timestamp not null default now()
);

create table books (
    id bigserial primary key,
    title varchar(255) not null,
    author varchar(255) not null,
    isbn varchar(40),
    publisher varchar(255),
    publish_year integer,
    category varchar(120) not null,
    description text,
    created_at timestamp not null default now(),
    unique (isbn)
);

create table book_copies (
    id bigserial primary key,
    book_id bigint not null references books(id),
    inventory_number varchar(80) not null unique,
    status varchar(30) not null,
    location varchar(120)
);

create table readers (
    id bigserial primary key,
    full_name varchar(160) not null,
    role_type varchar(30) not null,
    class_name varchar(30),
    contact varchar(120),
    qr_code varchar(120) not null unique,
    created_at timestamp not null default now()
);

create table loans (
    id bigserial primary key,
    copy_id bigint not null references book_copies(id),
    reader_id bigint not null references readers(id),
    issued_by bigint not null references users(id),
    issued_at timestamp not null,
    due_at timestamp not null,
    returned_at timestamp,
    status varchar(30) not null
);

create table comments (
    id bigserial primary key,
    book_id bigint not null references books(id),
    user_id bigint not null references users(id),
    body text not null,
    created_at timestamp not null default now()
);

create table reports (
    id bigserial primary key,
    type varchar(60) not null,
    period_from date not null,
    period_to date not null,
    generated_by bigint not null references users(id),
    generated_at timestamp not null,
    csv_content text not null
);

create table audit_logs (
    id bigserial primary key,
    actor_id bigint references users(id),
    entity varchar(60) not null,
    entity_id bigint,
    action varchar(60) not null,
    created_at timestamp not null default now()
);
