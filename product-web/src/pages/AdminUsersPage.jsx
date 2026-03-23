import { useEffect, useState } from 'react';
import { request } from '../lib/api';
import Notice from '../components/Notice';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setUsers(await request('/api/users'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <section>
      <header className="page-header">
        <div>
          <div className="kicker">Администрирование</div>
          <h1 className="page-title">Пользователи и <span className="hl">доступ</span></h1>
          <p className="page-subtitle">
            Просмотр учетных записей и ролей. Изменение прав — через администратора системы.
          </p>
        </div>
      </header>
      {loading && (
        <div className="panel panel-soft" style={{ marginBottom: 12 }}>
          <div className="kicker"><span className="spinner" />Загрузка</div>
          <h2 style={{ marginTop: 10 }}>Получаем список пользователей…</h2>
        </div>
      )}
      {error && (
        <Notice type="error" title="Ошибка загрузки" onClose={() => setError('')}>
          {error}
        </Notice>
      )}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Email</th><th>ФИО</th><th>Роль</th><th>Активен</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}><td>{user.email}</td><td>{user.fullName}</td><td>{user.role}</td><td>{user.active ? 'Да' : 'Нет'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
