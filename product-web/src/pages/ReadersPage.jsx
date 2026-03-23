import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../lib/api';

export default function ReadersPage() {
  const [readers, setReaders] = useState([]);
  const [qrCode, setQrCode] = useState('RDR-79001');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = async () => setReaders(await request('/api/readers'));
  useEffect(() => { load(); }, []);

  const findByQr = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await request(`/api/readers/qr/${encodeURIComponent(qrCode)}`);
      navigate(`/readers/${data.reader.id}`);
    } catch (err) {
      setError(err.message);
    }
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
        <input value={qrCode} onChange={(e) => setQrCode(e.target.value)} placeholder="QR-код читателя (например, RDR-79001)" />
        <button className="btn btn-primary">Найти</button>
      </form>

      {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}

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
                <td>{r.roleType}</td>
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
