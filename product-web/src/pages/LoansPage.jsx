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
      <h2>Выдача и возврат</h2>
      {hasRole(user, ['ADMIN', 'LIBRARIAN']) && (
        <form className="card grid-form" onSubmit={issue}>
          <input placeholder="QR читателя" value={form.readerQrCode} onChange={(e) => setForm({ ...form, readerQrCode: e.target.value })} />
          <select value={form.copyId} onChange={(e) => setForm({ ...form, copyId: e.target.value })}>
            <option value="">Выберите экземпляр</option>
            {copies.filter((c) => c.status === 'AVAILABLE').map((c) => (
              <option key={c.id} value={c.id}>{c.inventoryNumber} - {c.bookTitle}</option>
            ))}
          </select>
          <input type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
          <button>Оформить выдачу</button>
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
                <td>{loan.status}</td>
                <td>{hasRole(user, ['ADMIN', 'LIBRARIAN']) && loan.status === 'ACTIVE' ? <button onClick={() => returnLoan(loan.id)}>Принять возврат</button> : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
