import { useEffect, useMemo, useState } from 'react';
import { request } from '../lib/api';
import ReaderCodeCard from '../components/ReaderCodeCard';
import Notice from '../components/Notice';
import { loanStatusLabel, readerRoleTypeLabel } from '../lib/labels';

function formatDateTime(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('ru-RU');
  } catch {
    return String(value);
  }
}

export default function MyCodePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await request('/api/readers/me/profile'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reader = data?.reader;
  const loans = data?.loans || [];
  const activeLoans = useMemo(() => loans.filter((loan) => loan.status === 'ACTIVE'), [loans]);
  const historyLoans = useMemo(() => loans.filter((loan) => loan.status !== 'ACTIVE'), [loans]);

  if (loading) {
    return (
      <section>
        <div className="panel panel-soft">
          <div className="kicker"><span className="spinner" />Загрузка</div>
          <h2 style={{ marginTop: 10 }}>Готовим ваш штрихкод…</h2>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <Notice type="error" title="Не удалось загрузить штрихкод" onClose={() => setError('')}>
          {error}
        </Notice>
      </section>
    );
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <div className="kicker">Мой профиль</div>
          <h1 className="page-title">Мой <span className="hl">штрихкод</span> и книги</h1>
          <p className="page-subtitle">
            Покажите штрихкод библиотекарю при выдаче или возврате книги. Здесь отображается ваша история.
          </p>
        </div>
      </header>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <article className="panel" style={{ gridColumn: 'span 4' }}>
          <div className="kicker">Читатель</div>
          <h2 style={{ marginTop: 10 }}>{reader.fullName}</h2>
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            <span className="badge badge-accent">{readerRoleTypeLabel(reader.roleType)}</span>
            <span className="badge">Класс: {reader.className || '—'}</span>
            <span className="badge">Контакт: {reader.contact || '—'}</span>
          </div>
        </article>
        <article style={{ gridColumn: 'span 8' }}>
          <ReaderCodeCard code={reader.qrCode} />
        </article>

        <article className="panel" style={{ gridColumn: 'span 6' }}>
          <div className="kicker">На руках</div>
          <h2 style={{ marginTop: 10 }}>Должен вернуть</h2>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table>
              <thead><tr><th>Книга</th><th>Инв. №</th><th>Выдано</th><th>Срок</th></tr></thead>
              <tbody>
                {activeLoans.length === 0 && (
                  <tr><td colSpan={4} style={{ color: 'rgba(23,20,18,0.60)' }}>Нет активных выдач</td></tr>
                )}
                {activeLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.bookTitle}</td>
                    <td>{loan.inventoryNumber}</td>
                    <td>{formatDateTime(loan.issuedAt)}</td>
                    <td>{formatDateTime(loan.dueAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel" style={{ gridColumn: 'span 6' }}>
          <div className="kicker">История</div>
          <h2 style={{ marginTop: 10 }}>Взял и вернул</h2>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table>
              <thead><tr><th>Книга</th><th>Выдано</th><th>Возврат</th><th>Статус</th></tr></thead>
              <tbody>
                {historyLoans.length === 0 && (
                  <tr><td colSpan={4} style={{ color: 'rgba(23,20,18,0.60)' }}>История пока пуста</td></tr>
                )}
                {historyLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.bookTitle}</td>
                    <td>{formatDateTime(loan.issuedAt)}</td>
                    <td>{formatDateTime(loan.returnedAt)}</td>
                    <td><span className="badge">{loanStatusLabel(loan.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}
