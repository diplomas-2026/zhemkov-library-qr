import { useEffect, useState } from 'react';
import { request } from '../lib/api';
import { getUser, hasRole } from '../lib/auth';

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [copies, setCopies] = useState([]);
  const [form, setForm] = useState({ readerQrCode: 'RDR-79001', copyId: '', dueAt: '' });
  const user = getUser();

  const load = async () => {
    setLoans(await request('/api/loans'));
    setCopies(await request('/api/copies'));
  };

  useEffect(() => { load(); }, []);

  const issue = async (e) => {
    e.preventDefault();
    await request('/api/loans/issue', {
      method: 'POST',
      body: JSON.stringify({
        readerQrCode: form.readerQrCode,
        copyId: Number(form.copyId),
        dueAt: new Date(form.dueAt).toISOString()
      })
    });
    await load();
  };

  const returnLoan = async (id) => {
    await request(`/api/loans/${id}/return`, { method: 'POST' });
    await load();
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
            <button className="btn btn-primary">Оформить выдачу</button>
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
                <td><span className="badge">{loan.status}</span></td>
                <td>
                  {hasRole(user, ['ADMIN', 'LIBRARIAN']) && loan.status === 'ACTIVE' ? (
                    <button type="button" className="btn btn-secondary" onClick={() => returnLoan(loan.id)}>
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
