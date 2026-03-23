import { useEffect, useState } from 'react';
import { request, API_URL } from '../lib/api';
import { getUser, hasRole } from '../lib/auth';
import Notice from '../components/Notice';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ type: 'ISSUES_BY_PERIOD', periodFrom: '2026-01-01', periodTo: '2026-12-31' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = getUser();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setReports(await request('/api/reports'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await request('/api/reports/generate', { method: 'POST', body: JSON.stringify(form) });
      setSuccess('Отчет сформирован');
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
          <div className="kicker">Документы</div>
          <h1 className="page-title">Отчеты и <span className="hl">выгрузки</span></h1>
          <p className="page-subtitle">
            Формируйте отчеты по движению фонда и выдачам. CSV удобно открывается в Excel.
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
          <h2 style={{ marginTop: 10 }}>Обновляем список отчетов…</h2>
        </div>
      )}
      {hasRole(user, ['ADMIN', 'LIBRARIAN']) && (
        <form className="panel grid-form" onSubmit={create}>
          <label className="col-6">
            Тип отчета
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="FUND_MOVEMENT">Движение фонда</option>
              <option value="ISSUES_BY_PERIOD">Выдачи за период</option>
              <option value="OVERDUE">Просрочки</option>
              <option value="WRITTEN_OFF">Списания</option>
            </select>
          </label>
          <label className="col-3">
            Начало периода
            <input type="date" value={form.periodFrom} onChange={(e) => setForm({ ...form, periodFrom: e.target.value })} />
          </label>
          <label className="col-3">
            Конец периода
            <input type="date" value={form.periodTo} onChange={(e) => setForm({ ...form, periodTo: e.target.value })} />
          </label>
          <div className="col-12 form-actions">
            <button className="btn btn-primary" disabled={saving}>
              {saving && <span className="spinner" />}
              Сформировать
            </button>
          </div>
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
                <td><a href={`${API_URL}/api/reports/${report.id}/download`} target="_blank" rel="noreferrer">Скачать</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
