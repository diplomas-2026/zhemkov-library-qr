import { Link, NavLink } from 'react-router-dom';
import { getUser, logout } from '../lib/auth';
import { roleLabel } from '../lib/roles';
import FlashHost from './FlashHost';

export default function PublicLayout({ children }) {
  const user = getUser();

  const onLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="content" style={{ paddingTop: 22 }}>
      <FlashHost />
      <header className="app-header" style={{ maxWidth: 1120, margin: '0 auto 16px' }}>
        <div className="user-meta">
          <Link to="/books" className="brand" style={{ padding: '10px 12px' }}>
            <strong>Госбиблиотека №79</strong>
            <span>Каталог и выдача по QR</span>
          </Link>
          <NavLink to="/books" className={({ isActive }) => (isActive ? 'badge badge-accent' : 'badge')}>
            Каталог
          </NavLink>
        </div>
        <div className="user-meta">
          {user ? (
            <>
              <span className="badge">{user.fullName}</span>
              {user.role && <span className="badge badge-accent">{roleLabel(user.role)}</span>}
              <Link className="btn btn-secondary" to="/dashboard">В кабинет</Link>
              <button type="button" className="btn btn-ghost" onClick={onLogout}>Выйти</button>
            </>
          ) : (
            <>
              <Link className="btn btn-secondary" to="/login">Войти</Link>
              <Link className="btn btn-primary" to="/register">Регистрация</Link>
            </>
          )}
        </div>
      </header>
      <div className="page">{children}</div>
    </div>
  );
}
