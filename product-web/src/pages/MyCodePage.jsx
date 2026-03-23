import { useEffect, useState } from 'react';
import { request } from '../lib/api';
import ReaderCodeCard from '../components/ReaderCodeCard';
import Notice from '../components/Notice';
import { readerRoleTypeLabel } from '../lib/labels';

export default function MyCodePage() {
  const [reader, setReader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await request('/api/readers/me');
      setReader(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <section>
        <div className="panel panel-soft">
          <div className="kicker"><span className="spinner" />Загрузка</div>
          <h2 style={{ marginTop: 10 }}>Готовим ваш штрихкод…</h2>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <Notice type="error" title="Не удалось загрузить штрихкод" onClose={() => setError('')}>
          {error}
        </Notice>
      </section>
    );
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <div className="kicker">Мой профиль</div>
          <h1 className="page-title">Мой <span className="hl">штрихкод</span></h1>
          <p className="page-subtitle">
            Покажите этот штрихкод библиотекарю при выдаче или возврате книги.
          </p>
        </div>
      </header>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <article className="panel" style={{ gridColumn: 'span 4' }}>
          <div className="kicker">Читатель</div>
          <h2 style={{ marginTop: 10 }}>{reader.fullName}</h2>
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            <span className="badge badge-accent">{readerRoleTypeLabel(reader.roleType)}</span>
            <span className="badge">Класс: {reader.className || '—'}</span>
            <span className="badge">Контакт: {reader.contact || '—'}</span>
          </div>
        </article>
        <article style={{ gridColumn: 'span 8' }}>
          <ReaderCodeCard code={reader.qrCode} />
        </article>
      </div>
    </section>
  );
}

