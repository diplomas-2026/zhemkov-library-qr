import { useEffect, useState } from 'react';
import { request } from '../lib/api';
import Notice from '../components/Notice';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    request('/api/dashboard')
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <section>
        <Notice type="error" title="Не удалось загрузить данные">
          {error}
        </Notice>
      </section>
    );
  }

  if (!stats) {
    return (
      <section>
        <div className="panel panel-soft">
          <div className="kicker">Загрузка</div>
          <h2 style={{ marginTop: 10 }}>Подготавливаем обзор библиотеки…</h2>
        </div>
      </section>
    );
  }

  const cards = [
    ['Книг', stats.totalBooks],
    ['Экземпляров', stats.totalCopies],
    ['Доступно', stats.availableCopies],
    ['Активные выдачи', stats.activeLoans],
    ['Просрочки', stats.overdueLoans],
    ['Читателей', stats.readers],
    ['Комментариев', stats.comments]
  ];

  return (
    <section>
      <header className="page-header">
        <div>
          <div className="kicker">Фонд и обслуживание</div>
          <h1 className="page-title">Обзор <span className="hl">библиотеки</span></h1>
          <p className="page-subtitle">
            Ключевые показатели по книгам, экземплярам, выдачам и читателям — чтобы видеть картину за день.
          </p>
        </div>
      </header>
      <div className="grid-cards">
        {cards.map(([label, value]) => (
          <article className="panel metric" key={label}>
            <h3>{label}</h3>
            <p>{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
