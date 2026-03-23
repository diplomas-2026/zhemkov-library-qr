import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../lib/api';
import Notice from '../components/Notice';
import { readerRoleTypeLabel } from '../lib/labels';
import ScannerDialog from '../components/ScannerDialog';

export default function ReadersPage() {
  const [readers, setReaders] = useState([]);
  const [qrCode, setQrCode] = useState('RDR-79001');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [finding, setFinding] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setReaders(await request('/api/readers'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openByCode = async (code) => {
    setError('');
    try {
      setFinding(true);
      const data = await request(`/api/readers/qr/${encodeURIComponent(code)}`);
      navigate(`/readers/${data.reader.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setFinding(false);
    }
  };

  const findByQr = async (e) => {
    e.preventDefault();
    await openByCode(qrCode);
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <div className="kicker">Обслуживание</div>
          <h1 className="page-title">Читатели и <span className="hl">QR</span></h1>
          <p className="page-subtitle">
            Быстрый поиск читателя по QR-коду и просмотр истории выдач.
          </p>
        </div>
      </header>

      <form onSubmit={findByQr} className="panel panel-soft inline-form">
        <input value={qrCode} onChange={(e) => setQrCode(e.target.value)} placeholder="QR/штрихкод читателя (например, RDR-79001)" />
        <button type="button" className="btn btn-secondary" onClick={() => setScanOpen(true)} disabled={finding}>
          Сканировать
        </button>
        <button className="btn btn-primary" disabled={finding}>
          {finding && <span className="spinner" />}
          Найти
        </button>
      </form>

      <ScannerDialog
        open={scanOpen}
        title="Сканирование кода читателя"
        hint="Разрешите доступ к камере. Код можно сканировать с карточки читателя."
        onClose={() => setScanOpen(false)}
        onDetected={(text) => {
          setQrCode(text);
          openByCode(text);
        }}
      />

      {error && (
        <div style={{ marginTop: 12 }}>
          <Notice type="error" title="Ошибка" onClose={() => setError('')}>
            {error}
          </Notice>
        </div>
      )}

      {loading && (
        <div className="panel panel-soft" style={{ marginTop: 12 }}>
          <div className="kicker"><span className="spinner" />Загрузка</div>
          <h2 style={{ marginTop: 10 }}>Обновляем список читателей…</h2>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>ФИО</th><th>Тип</th><th>Класс</th><th>QR</th></tr></thead>
          <tbody>
            {readers.map((r) => (
              <tr
                key={r.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/readers/${r.id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/readers/${r.id}`); }}
                style={{ cursor: 'pointer' }}
                title="Открыть историю читателя"
              >
                <td><strong>{r.fullName}</strong></td>
                <td>{readerRoleTypeLabel(r.roleType)}</td>
                <td>{r.className || '-'}</td>
                <td>{r.qrCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
