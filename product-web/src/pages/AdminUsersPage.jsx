import { useEffect, useState } from 'react';
import { request } from '../lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const load = async () => setUsers(await request('/api/users'));
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
