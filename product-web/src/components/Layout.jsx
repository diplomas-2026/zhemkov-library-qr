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
    <div className="shell">
      <aside className="nav" aria-label="Навигация">
        <Link className="brand" to="/dashboard">
          <strong>Государственная библиотека №79</strong>
          <span>Самара • школьный фонд и выдача по QR</span>
        </Link>
        <h3>Разделы</h3>
        <nav className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : undefined)}>Обзор</NavLink>
          <NavLink to="/books" className={({ isActive }) => (isActive ? 'active' : undefined)}>Каталог</NavLink>
          <NavLink to="/readers" className={({ isActive }) => (isActive ? 'active' : undefined)}>Читатели</NavLink>
          <NavLink to="/loans" className={({ isActive }) => (isActive ? 'active' : undefined)}>Выдача и возврат</NavLink>
          <NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : undefined)}>Отчеты</NavLink>
          {hasRole(user, ['ADMIN']) && (
            <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Администрирование
            </NavLink>
          )}
        </nav>
      </aside>
      <main className="content">
        <header className="app-header">
          <div className="user-meta">
            <strong>{user?.fullName || 'Пользователь'}</strong>
            {user?.role && <span className="badge badge-accent">{user.role}</span>}
          </div>
          <button className="btn btn-secondary" onClick={onLogout}>Выйти</button>
        </header>
        <div className="page">{children}</div>
      </main>
    </div>
  );
}
