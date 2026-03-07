import { useEffect, useState } from 'react';
import { request } from '../lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    request('/api/dashboard').then(setStats);
  }, []);

  if (!stats) return <div>Загрузка...</div>;

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
      <h2>Обзор библиотеки</h2>
      <div className="grid-cards">
        {cards.map(([label, value]) => (
          <article className="metric" key={label}>
            <h3>{label}</h3>
            <p>{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
