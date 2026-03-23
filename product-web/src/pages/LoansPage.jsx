import { useEffect, useState } from 'react';
import { request } from '../lib/api';
import { getUser, hasRole } from '../lib/auth';
import Notice from '../components/Notice';
import { loanStatusLabel } from '../lib/labels';

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [copies, setCopies] = useState([]);
  const [form, setForm] = useState({ readerQrCode: 'RDR-79001', copyId: '', dueAt: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = getUser();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [loansData, copiesData] = await Promise.all([
        request('/api/loans'),
        request('/api/copies')
      ]);
      setLoans(loansData);
      setCopies(copiesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const issue = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await request('/api/loans/issue', {
        method: 'POST',
        body: JSON.stringify({
          readerQrCode: form.readerQrCode,
          copyId: Number(form.copyId),
          dueAt: new Date(form.dueAt).toISOString()
        })
      });
      setSuccess('Выдача оформлена');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const returnLoan = async (id) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await request(`/api/loans/${id}/return`, { method: 'POST' });
      setSuccess('Возврат принят');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <div className="kicker">Обслуживание</div>
          <h1 className="page-title">Выдача и <span className="hl">возврат</span></h1>
          <p className="page-subtitle">
            Оформляйте выдачу по QR-коду читателя, а возврат — в один клик.
          </p>
        </div>
      </header>
      {success && (
        <div style={{ marginBottom: 12 }}>
          <Notice type="success" title="Готово" onClose={() => setSuccess('')}>
            {success}
          </Notice>
        </div>
      )}
      {error && (
        <div style={{ marginBottom: 12 }}>
          <Notice type="error" title="Ошибка" onClose={() => setError('')}>
            {error}
          </Notice>
        </div>
      )}
      {loading && (
        <div className="panel panel-soft" style={{ marginBottom: 12 }}>
          <div className="kicker"><span className="spinner" />Загрузка</div>
          <h2 style={{ marginTop: 10 }}>Обновляем выдачи и экземпляры…</h2>
        </div>
      )}
      {hasRole(user, ['ADMIN', 'LIBRARIAN']) && (
        <form className="panel grid-form" onSubmit={issue}>
          <label className="col-3">
            QR читателя
            <input
              placeholder="Например, RDR-79001"
              value={form.readerQrCode}
              onChange={(e) => setForm({ ...form, readerQrCode: e.target.value })}
            />
          </label>
          <label className="col-6">
            Экземпляр
            <select value={form.copyId} onChange={(e) => setForm({ ...form, copyId: e.target.value })}>
              <option value="">Выберите доступный экземпляр</option>
              {copies.filter((c) => c.status === 'AVAILABLE').map((c) => (
                <option key={c.id} value={c.id}>{c.inventoryNumber} — {c.bookTitle}</option>
              ))}
            </select>
          </label>
          <label className="col-3">
            Срок возврата
            <input type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
          </label>
          <div className="col-12 form-actions">
            <button className="btn btn-primary" disabled={saving}>
              {saving && <span className="spinner" />}
              Оформить выдачу
            </button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Книга</th><th>Читатель</th><th>QR</th><th>Срок</th><th>Статус</th><th>Действие</th></tr></thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.bookTitle}</td>
                <td>{loan.readerName}</td>
                <td>{loan.readerQrCode}</td>
                <td>{new Date(loan.dueAt).toLocaleString('ru-RU')}</td>
                <td><span className="badge">{loanStatusLabel(loan.status)}</span></td>
                <td>
                  {hasRole(user, ['ADMIN', 'LIBRARIAN']) && loan.status === 'ACTIVE' ? (
                    <button type="button" className="btn btn-secondary" onClick={() => returnLoan(loan.id)} disabled={saving}>
                      {saving && <span className="spinner" />}
                      Принять возврат
                    </button>
                  ) : (
                    <span style={{ color: 'rgba(23, 20, 18, 0.50)' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
