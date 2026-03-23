alter table readers
    add column if not exists user_id bigint unique references users(id);

