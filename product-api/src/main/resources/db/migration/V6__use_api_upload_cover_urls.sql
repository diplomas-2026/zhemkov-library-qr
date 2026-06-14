UPDATE books
SET cover_url = '/api' || cover_url
WHERE cover_url LIKE '/uploads/%';

