import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getUser, hasRole, logout } from '../lib/auth';

export default function Layout({ children }) {
  const user = getUser();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/dashboard">Библиотека №79</Link>
        <nav>
          <NavLink to="/dashboard">Дашборд</NavLink>
          <NavLink to="/books">Каталог</NavLink>
          <NavLink to="/readers">Читатели</NavLink>
          <NavLink to="/loans">Выдача/Возврат</NavLink>
          <NavLink to="/reports">Отчеты</NavLink>
          {hasRole(user, ['ADMIN']) && <NavLink to="/admin/users">Пользователи</NavLink>}
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <strong>{user?.fullName}</strong>
            <span>{user?.role}</span>
          </div>
          <button onClick={onLogout}>Выйти</button>
        </header>
        {children}
      </main>
    </div>
  );
}
