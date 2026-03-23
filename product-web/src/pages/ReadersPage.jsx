import { useEffect, useState } from 'react';
import { request } from '../lib/api';

export default function ReadersPage() {
  const [readers, setReaders] = useState([]);
  const [qrCode, setQrCode] = useState('RDR-79001');
  const [profile, setProfile] = useState(null);

  const load = async () => setReaders(await request('/api/readers'));
  useEffect(() => { load(); }, []);

  const findByQr = async (e) => {
    e.preventDefault();
    const data = await request(`/api/readers/qr/${encodeURIComponent(qrCode)}`);
    setProfile(data);
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

      {profile && (
        <div className="panel">
          <div className="page-header" style={{ margin: 0 }}>
            <div>
              <h2 style={{ margin: 0 }}>{profile.reader.fullName}</h2>
              <p className="page-subtitle" style={{ marginTop: 10 }}>
                QR: <span className="badge">{profile.reader.qrCode}</span> {' '}
                Тип: <span className="badge badge-accent">{profile.reader.roleType}</span> {' '}
                Класс: <span className="badge">{profile.reader.className || '-'}</span>
              </p>
            </div>
          </div>
          <h4>История выдач</h4>
          <ul className="list">
            {profile.loans.length === 0 && <li>Выдач пока нет.</li>}
            {profile.loans.map((loan) => (
              <li key={loan.id}>
                {loan.bookTitle} <span className="badge">{loan.status}</span> до {new Date(loan.dueAt).toLocaleDateString('ru-RU')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead><tr><th>ФИО</th><th>Тип</th><th>Класс</th><th>QR</th></tr></thead>
          <tbody>
            {readers.map((r) => (
              <tr key={r.id}><td>{r.fullName}</td><td>{r.roleType}</td><td>{r.className || '-'}</td><td>{r.qrCode}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
