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
      <h2>Каталог книг</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Название</th><th>Автор</th><th>Категория</th><th>Доступно</th><th>Обсуждение</th></tr></thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td><td>{book.author}</td><td>{book.category}</td><td>{book.availableCopies}</td>
                <td><button onClick={() => { setSelectedBookId(book.id); loadComments(book.id); }}>Открыть</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBookId && (
        <div className="card comments-card">
          <h3>Комментарии к книге #{selectedBookId}</h3>
          <form onSubmit={sendComment} className="inline-form">
            <input placeholder="Ваш комментарий" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="submit">Отправить</button>
          </form>
          <ul className="comments-list">
            {comments.map((item) => (
              <li key={item.id}>
                <strong>{item.userName}:</strong> {item.body}
                {hasRole(user, ['ADMIN', 'LIBRARIAN']) && <button onClick={() => removeComment(item.id)}>Удалить</button>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
