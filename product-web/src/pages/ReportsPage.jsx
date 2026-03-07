import { useEffect, useState } from 'react';
import { request, API_URL } from '../lib/api';
import { getUser, hasRole } from '../lib/auth';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ type: 'ISSUES_BY_PERIOD', periodFrom: '2026-01-01', periodTo: '2026-12-31' });
  const user = getUser();

  const load = async () => setReports(await request('/api/reports'));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await request('/api/reports/generate', { method: 'POST', body: JSON.stringify(form) });
    await load();
  };

  return (
    <section>
      <h2>Отчеты</h2>
      {hasRole(user, ['ADMIN', 'LIBRARIAN']) && (
        <form className="card grid-form" onSubmit={create}>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="FUND_MOVEMENT">Движение фонда</option>
            <option value="ISSUES_BY_PERIOD">Выдачи за период</option>
            <option value="OVERDUE">Просрочки</option>
            <option value="WRITTEN_OFF">Списания</option>
          </select>
          <input type="date" value={form.periodFrom} onChange={(e) => setForm({ ...form, periodFrom: e.target.value })} />
          <input type="date" value={form.periodTo} onChange={(e) => setForm({ ...form, periodTo: e.target.value })} />
          <button>Сформировать</button>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Тип</th><th>Период</th><th>Кем</th><th>CSV</th></tr></thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.type}</td>
                <td>{report.periodFrom} - {report.periodTo}</td>
                <td>{report.generatedBy}</td>
                <td><a href={`${API_URL}/api/reports/${report.id}/download`} target="_blank">Скачать</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
