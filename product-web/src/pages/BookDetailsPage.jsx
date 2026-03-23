import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiAssetUrl, request } from '../lib/api';
import { getUser, hasRole } from '../lib/auth';
import placeholderCover from '../assets/cover-placeholder.svg';

function coverSrc(coverUrl) {
  return apiAssetUrl(coverUrl) || placeholderCover;
}

export default function BookDetailsPage() {
  const { id } = useParams();
  const bookId = Number(id);
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [fileError, setFileError] = useState('');
  const [form, setForm] = useState(null);
  const user = getUser();
  const canManage = hasRole(user, ['ADMIN', 'LIBRARIAN']);
  const navigate = useNavigate();

  const load = async () => {
    setError('');
    try {
      const data = await request(`/api/books/${bookId}`);
      setBook(data);
      setForm({
        title: data.title || '',
        author: data.author || '',
        isbn: data.isbn || '',
        publisher: data.publisher || '',
        publishYear: data.publishYear || '',
        category: data.category || '',
        description: data.description || ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(bookId)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const subtitle = useMemo(() => {
    if (!book) return '';
    const parts = [book.author, book.category].filter(Boolean);
    return parts.join(' • ');
  }, [book]);

  const save = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        publishYear: form.publishYear ? Number(form.publishYear) : null
      };
      const data = await request(`/api/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setBook(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!canManage) return;
    if (!window.confirm('Удалить книгу из каталога?')) return;
    setSaving(true);
    setError('');
    try {
      await request(`/api/books/${bookId}`, { method: 'DELETE' });
      navigate('/books');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadCover = async (file) => {
    if (!canManage) return;
    setFileError('');
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const data = await request(`/api/books/${bookId}/cover`, { method: 'POST', body: fd });
      setBook(data);
    } catch (err) {
      setFileError(err.message);
    }
  };

  const clearCover = async () => {
    if (!canManage) return;
    try {
      const data = await request(`/api/books/${bookId}/cover`, { method: 'DELETE' });
      setBook(data);
    } catch (err) {
      setFileError(err.message);
    }
  };

  if (error) {
    return (
      <section>
        <div className="panel">
          <div className="kicker">Ошибка</div>
          <h2 style={{ marginTop: 10 }}>Не удалось загрузить книгу</h2>
          <p style={{ marginTop: 10 }}>{error}</p>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="btn btn-secondary" to="/books">Вернуться в каталог</Link>
            <button type="button" className="btn btn-primary" onClick={load}>Повторить</button>
          </div>
        </div>
      </section>
    );
  }

  if (!book) {
    return (
      <section>
        <div className="panel panel-soft">
          <div className="kicker">Загрузка</div>
          <h2 style={{ marginTop: 10 }}>Открываем карточку книги…</h2>
        </div>
      </section>
    );
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <div className="kicker">Каталог</div>
          <h1 className="page-title">{book.title}</h1>
          <p className="page-subtitle" style={{ marginTop: 10 }}>
            {subtitle}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn btn-secondary" to="/books">В каталог</Link>
          {canManage && <button type="button" className="btn btn-danger" onClick={remove} disabled={saving}>Удалить</button>}
        </div>
      </header>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <article className="panel" style={{ gridColumn: 'span 4', padding: 14 }}>
          <img
            src={coverSrc(book.coverUrl)}
            alt={book.coverUrl ? `Обложка: ${book.title}` : 'Обложка отсутствует'}
            style={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover', borderRadius: 16, border: '1px solid rgba(23,20,18,0.12)' }}
            onError={(e) => { e.currentTarget.src = placeholderCover; }}
          />
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <div className="badge">Доступно: {book.availableCopies}</div>
            {book.isbn && <div className="badge">ISBN: {book.isbn}</div>}
            {book.publisher && <div className="badge">{book.publisher}{book.publishYear ? `, ${book.publishYear}` : ''}</div>}
          </div>
          {canManage && (
            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
              <label>
                Обложка (PNG/JPG/WebP)
                <input type="file" accept="image/*" onChange={(e) => uploadCover(e.target.files?.[0])} />
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={clearCover} disabled={!book.coverUrl}>Убрать обложку</button>
              </div>
              {fileError && <div className="error">{fileError}</div>}
            </div>
          )}
        </article>

        <article className="panel" style={{ gridColumn: 'span 8' }}>
          {book.description ? (
            <>
              <div className="kicker">Аннотация</div>
              <h2 style={{ marginTop: 10 }}>О книге</h2>
              <p style={{ marginTop: 10, color: 'rgba(23,20,18,0.78)' }}>{book.description}</p>
            </>
          ) : (
            <>
              <div className="kicker">Аннотация</div>
              <h2 style={{ marginTop: 10 }}>Описание пока не добавлено</h2>
              <p style={{ marginTop: 10 }}>Можно заполнить карточку книги — это поможет читателям.</p>
            </>
          )}

          {canManage && form && (
            <form onSubmit={save} style={{ marginTop: 18, display: 'grid', gap: 10 }}>
              <h3 style={{ margin: 0 }}>Редактирование</h3>
              <div className="grid-form" style={{ marginBottom: 0 }}>
                <label className="col-6">
                  Название
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </label>
                <label className="col-6">
                  Автор
                  <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                </label>
                <label className="col-6">
                  Категория
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </label>
                <label className="col-3">
                  Год
                  <input value={form.publishYear} onChange={(e) => setForm({ ...form, publishYear: e.target.value })} placeholder="Например, 2019" />
                </label>
                <label className="col-3">
                  ISBN
                  <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
                </label>
                <label className="col-6">
                  Издательство
                  <input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
                </label>
                <label className="col-12">
                  Описание
                  <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </label>
                <div className="col-12 form-actions">
                  <button className="btn btn-primary" disabled={saving}>Сохранить</button>
                </div>
              </div>
            </form>
          )}
        </article>
      </div>
    </section>
  );
}

