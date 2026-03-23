import { useEffect, useState } from 'react';
import { apiAssetUrl, request } from '../lib/api';
import { getUser, hasRole } from '../lib/auth';
import { Link, useNavigate } from 'react-router-dom';
import placeholderCover from '../assets/cover-placeholder.svg';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publishYear: '',
    category: '',
    description: ''
  });
  const user = getUser();
  const canManage = hasRole(user, ['ADMIN', 'LIBRARIAN']);
  const navigate = useNavigate();

  const loadBooks = async () => {
    setError('');
    try {
      const query = q.trim();
      const data = await request(query ? `/api/books?q=${encodeURIComponent(query)}` : '/api/books');
      setBooks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { loadBooks(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const create = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    setCreateSaving(true);
    setError('');
    try {
      const payload = {
        ...createForm,
        publishYear: createForm.publishYear ? Number(createForm.publishYear) : null
      };
      const created = await request('/api/books', { method: 'POST', body: JSON.stringify(payload) });
      navigate(`/books/${created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreateSaving(false);
    }
  };

  const coverSrc = (coverUrl) => apiAssetUrl(coverUrl) || placeholderCover;

  return (
    <section>
      <header className="page-header">
        <div>
          <div className="kicker">Фонд</div>
          <h1 className="page-title">Каталог <span className="hl">книг</span></h1>
          <p className="page-subtitle">
            Поиск и просмотр фонда, а также обсуждение отдельных книг для сотрудников и читателей.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {canManage && (
            <button type="button" className="btn btn-primary" onClick={() => setCreateOpen((v) => !v)}>
              Добавить книгу
            </button>
          )}
          {!user && <Link className="btn btn-secondary" to="/login">Войти</Link>}
        </div>
      </header>

      <div className="panel panel-soft">
        <form className="inline-form" onSubmit={(e) => { e.preventDefault(); loadBooks(); }}>
          <label style={{ flex: 2, minWidth: 260 }}>
            Поиск
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Название или автор" />
          </label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <button className="btn btn-secondary" type="submit">Найти</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setQ(''); setTimeout(loadBooks, 0); }}>
              Сбросить
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}

      {canManage && createOpen && (
        <form className="panel" onSubmit={create} style={{ marginTop: 14 }}>
          <h3>Новая книга</h3>
          <div className="grid-form" style={{ marginBottom: 0 }}>
            <label className="col-6">
              Название
              <input value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
            </label>
            <label className="col-6">
              Автор
              <input value={createForm.author} onChange={(e) => setCreateForm({ ...createForm, author: e.target.value })} />
            </label>
            <label className="col-6">
              Категория
              <input value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} />
            </label>
            <label className="col-3">
              Год
              <input value={createForm.publishYear} onChange={(e) => setCreateForm({ ...createForm, publishYear: e.target.value })} />
            </label>
            <label className="col-3">
              ISBN
              <input value={createForm.isbn} onChange={(e) => setCreateForm({ ...createForm, isbn: e.target.value })} />
            </label>
            <label className="col-6">
              Издательство
              <input value={createForm.publisher} onChange={(e) => setCreateForm({ ...createForm, publisher: e.target.value })} />
            </label>
            <label className="col-12">
              Описание
              <textarea rows={4} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
            </label>
            <div className="col-12 form-actions">
              <button className="btn btn-primary" disabled={createSaving}>Создать</button>
              <button type="button" className="btn btn-ghost" onClick={() => setCreateOpen(false)} disabled={createSaving}>Отмена</button>
            </div>
          </div>
        </form>
      )}

      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {books.map((book) => (
          <article className="panel" key={book.id} style={{ padding: 14, display: 'grid', gap: 10 }}>
            <img
              src={coverSrc(book.coverUrl)}
              alt={book.coverUrl ? `Обложка: ${book.title}` : 'Обложка отсутствует'}
              style={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover', borderRadius: 16, border: '1px solid rgba(23,20,18,0.12)' }}
              onError={(e) => { e.currentTarget.src = placeholderCover; }}
            />
            <div style={{ display: 'grid', gap: 6 }}>
              <strong style={{ fontSize: 16 }}>{book.title}</strong>
              <div style={{ color: 'rgba(23,20,18,0.70)' }}>{book.author}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge">{book.category}</span>
                <span className="badge">Доступно: {book.availableCopies}</span>
              </div>
            </div>
            <Link className="btn btn-secondary" to={`/books/${book.id}`}>Открыть</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
