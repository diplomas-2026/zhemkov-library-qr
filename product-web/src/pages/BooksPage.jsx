import { useEffect, useState } from 'react';
import { request } from '../lib/api';
import { getUser, hasRole } from '../lib/auth';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [comment, setComment] = useState('');
  const user = getUser();

  const loadBooks = async () => setBooks(await request('/api/books'));
  const loadComments = async (bookId) => setComments(await request(`/api/comments/book/${bookId}`));

  useEffect(() => { loadBooks(); }, []);

  const sendComment = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !comment.trim()) return;
    await request('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ bookId: selectedBookId, body: comment })
    });
    setComment('');
    await loadComments(selectedBookId);
  };

  const removeComment = async (id) => {
    await request(`/api/comments/${id}`, { method: 'DELETE' });
    await loadComments(selectedBookId);
  };

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
      </header>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Название</th><th>Автор</th><th>Категория</th><th>Доступно</th><th>Обсуждение</th></tr></thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td><td>{book.author}</td><td>{book.category}</td><td>{book.availableCopies}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => { setSelectedBookId(book.id); loadComments(book.id); }}
                  >
                    Открыть
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBookId && (
        <div className="panel comments">
          <h3>Обсуждение книги #{selectedBookId}</h3>
          <form onSubmit={sendComment} className="inline-form">
            <input
              aria-label="Комментарий"
              placeholder="Ваш комментарий"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Отправить</button>
          </form>
          <ul className="comments-list">
            {comments.length === 0 && (
              <li className="comments-item">
                <div>
                  <strong>Пока тишина</strong>
                  <p>Оставьте первый комментарий — это поможет коллегам и читателям.</p>
                </div>
              </li>
            )}
            {comments.map((item) => (
              <li className="comments-item" key={item.id}>
                <div>
                  <strong>{item.userName}</strong>
                  <p>{item.body}</p>
                </div>
                {hasRole(user, ['ADMIN', 'LIBRARIAN']) && (
                  <button type="button" className="btn btn-danger" onClick={() => removeComment(item.id)}>
                    Удалить
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
