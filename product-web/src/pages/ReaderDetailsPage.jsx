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
  const [copies, setCopies] = useState([]);
  const [copiesLoading, setCopiesLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [savingIssue, setSavingIssue] = useState(false);
  const [savingReturnId, setSavingReturnId] = useState(null);
  const [issueForm, setIssueForm] = useState({ copyId: '', dueAt: '' });

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

  const loadCopies = async () => {
    setCopiesLoading(true);
    setActionError('');
    try {
      const list = await request('/api/copies');
      setCopies(list);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCopiesLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(readerId)) return;
    load();
    loadCopies();
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
  const availableCopies = useMemo(() => copies.filter((c) => c.status === 'AVAILABLE'), [copies]);

  const issue = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    if (!issueForm.copyId || !issueForm.dueAt) {
      setActionError('Заполните экземпляр и срок возврата');
      return;
    }
    setSavingIssue(true);
    try {
      await request('/api/loans/issue', {
        method: 'POST',
        body: JSON.stringify({
          readerQrCode: reader.qrCode,
          copyId: Number(issueForm.copyId),
          dueAt: new Date(issueForm.dueAt).toISOString()
        })
      });
      setActionSuccess('Выдача оформлена');
      setIssueForm({ copyId: '', dueAt: '' });
      await load();
      await loadCopies();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingIssue(false);
    }
  };

  const returnLoan = async (loanId) => {
    setActionError('');
    setActionSuccess('');
    setSavingReturnId(loanId);
    try {
      await request(`/api/loans/${loanId}/return`, { method: 'POST' });
      setActionSuccess('Возврат принят');
      await load();
      await loadCopies();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingReturnId(null);
    }
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <div className="kicker">Читатели</div>
          <h1 className="page-title">{reader.fullName}</h1>
          <p className="page-subtitle" style={{ marginTop: 10 }}>
            <span className="badge badge-accent">{readerRoleTypeLabel(reader.roleType)}</span>{' '}
            <span className="badge">Штрихкод: {reader.qrCode}</span>{' '}
            <span className="badge">Класс: {reader.className || '—'}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn btn-secondary" to={`/loans?code=${encodeURIComponent(reader.qrCode)}`}>Выдача и возврат</Link>
          <Link className="btn btn-ghost" to="/readers">К списку</Link>
        </div>
      </header>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <article style={{ gridColumn: 'span 12' }}>
          <ReaderCodeCard code={reader.qrCode} />
        </article>

        <article className="panel" style={{ gridColumn: 'span 12' }}>
          <div className="page-header" style={{ margin: 0 }}>
            <div>
              <div className="kicker">Обслуживание</div>
              <h2 style={{ marginTop: 10 }}>Выдать книгу этому читателю</h2>
              <p className="page-subtitle" style={{ marginTop: 10 }}>
                Выдача доступна только при наличии штрихкода. Сейчас используется штрихкод: <strong>{reader.qrCode}</strong>
              </p>
            </div>
          </div>

          {actionSuccess && (
            <div style={{ marginTop: 12 }}>
              <Notice type="success" title="Готово" onClose={() => setActionSuccess('')}>
                {actionSuccess}
              </Notice>
            </div>
          )}
          {actionError && (
            <div style={{ marginTop: 12 }}>
              <Notice type="error" title="Ошибка" onClose={() => setActionError('')}>
                {actionError}
              </Notice>
            </div>
          )}

          {copiesLoading ? (
            <div className="panel panel-soft" style={{ marginTop: 12 }}>
              <div className="kicker"><span className="spinner" />Загрузка</div>
              <h2 style={{ marginTop: 10 }}>Подбираем доступные экземпляры…</h2>
            </div>
          ) : (
            <form className="grid-form" style={{ marginTop: 12, marginBottom: 0 }} onSubmit={issue}>
              <label className="col-6">
                Экземпляр
                <select value={issueForm.copyId} onChange={(e) => setIssueForm({ ...issueForm, copyId: e.target.value })}>
                  <option value="">Выберите доступный экземпляр</option>
                  {availableCopies.map((c) => (
                    <option key={c.id} value={c.id}>{c.inventoryNumber} — {c.bookTitle}</option>
                  ))}
                </select>
              </label>
              <label className="col-3">
                Срок возврата
                <input type="datetime-local" value={issueForm.dueAt} onChange={(e) => setIssueForm({ ...issueForm, dueAt: e.target.value })} />
              </label>
              <div className="col-12 form-actions">
                <button className="btn btn-primary" disabled={savingIssue}>
                  {savingIssue && <span className="spinner" />}
                  Оформить выдачу
                </button>
              </div>
            </form>
          )}
        </article>

        <article className="panel" style={{ gridColumn: 'span 6' }}>
          <div className="kicker">Активные</div>
          <h2 style={{ marginTop: 10 }}>Должен вернуть</h2>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table>
              <thead><tr><th>Книга</th><th>Инв. №</th><th>Выдано</th><th>Срок</th><th>Возврат</th></tr></thead>
              <tbody>
                {activeLoans.length === 0 && (
                  <tr><td colSpan={5} style={{ color: 'rgba(23,20,18,0.60)' }}>Нет активных выдач</td></tr>
                )}
                {activeLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.bookTitle}</td>
                    <td>{loan.inventoryNumber}</td>
                    <td>{formatDateTime(loan.issuedAt)}</td>
                    <td>{formatDateTime(loan.dueAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => returnLoan(loan.id)}
                        disabled={savingReturnId === loan.id}
                      >
                        {savingReturnId === loan.id && <span className="spinner" />}
                        Принять
                      </button>
                    </td>
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
