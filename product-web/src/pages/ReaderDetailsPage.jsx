import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { request } from '../lib/api';
import Notice from '../components/Notice';
import { loanStatusLabel, readerRoleTypeLabel } from '../lib/labels';
import ReaderCodeCard from '../components/ReaderCodeCard';

function formatDateTime(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('ru-RU');
  } catch {
    return String(value);
  }
}

export default function ReaderDetailsPage() {
  const { id } = useParams();
  const readerId = Number(id);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const profile = await request(`/api/readers/${readerId}/profile`);
      setData(profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(readerId)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readerId]);

  const activeLoans = useMemo(() => (data?.loans || []).filter((l) => l.status === 'ACTIVE'), [data]);
  const returnedLoans = useMemo(() => (data?.loans || []).filter((l) => l.status !== 'ACTIVE'), [data]);

  if (error) {
    return (
      <section>
        <div className="panel">
          <Notice type="error" title="Не удалось загрузить читателя">
            {error}
          </Notice>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="btn btn-secondary" to="/readers">К списку</Link>
            <button type="button" className="btn btn-primary" onClick={load}>Повторить</button>
          </div>
        </div>
      </section>
    );
  }

  if (loading && !data) {
    return (
      <section>
        <div className="panel panel-soft">
          <div className="kicker"><span className="spinner" />Загрузка</div>
          <h2 style={{ marginTop: 10 }}>Открываем карточку читателя…</h2>
        </div>
      </section>
    );
  }

  const reader = data.reader;

  return (
    <section>
      <header className="page-header">
        <div>
          <div className="kicker">Читатели</div>
          <h1 className="page-title">{reader.fullName}</h1>
          <p className="page-subtitle" style={{ marginTop: 10 }}>
            <span className="badge badge-accent">{readerRoleTypeLabel(reader.roleType)}</span>{' '}
            <span className="badge">QR: {reader.qrCode}</span>{' '}
            <span className="badge">Класс: {reader.className || '—'}</span>
          </p>
        </div>
        <Link className="btn btn-secondary" to="/readers">К списку</Link>
      </header>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <article style={{ gridColumn: 'span 12' }}>
          <ReaderCodeCard code={reader.qrCode} />
        </article>
        <article className="panel" style={{ gridColumn: 'span 6' }}>
          <div className="kicker">Активные</div>
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
                {returnedLoans.length === 0 && (
                  <tr><td colSpan={4} style={{ color: 'rgba(23,20,18,0.60)' }}>История пока пуста</td></tr>
                )}
                {returnedLoans.map((loan) => (
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
