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
      <h2>Читатели и QR</h2>
      <form onSubmit={findByQr} className="inline-form">
        <input value={qrCode} onChange={(e) => setQrCode(e.target.value)} placeholder="QR-код читателя" />
        <button>Сканировать QR</button>
      </form>

      {profile && (
        <div className="card">
          <h3>{profile.reader.fullName}</h3>
          <p>QR: {profile.reader.qrCode} | Роль: {profile.reader.roleType}</p>
          <p>Класс: {profile.reader.className || '-'}</p>
          <h4>История выдач</h4>
          <ul>
            {profile.loans.map((loan) => (
              <li key={loan.id}>{loan.bookTitle} ({loan.status}) до {new Date(loan.dueAt).toLocaleDateString('ru-RU')}</li>
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
