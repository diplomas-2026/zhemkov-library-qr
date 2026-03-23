import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { request } from '../lib/api';
import { saveAuth } from '../lib/auth';
import Notice from '../components/Notice';
import { setFlash } from '../lib/flash';

export default function LoginPage() {
  const [email, setEmail] = useState('librarian79@school.local');
  const [password, setPassword] = useState('Lib123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      saveAuth(data);
      setFlash({ type: 'success', text: 'Вы вошли в систему' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-grid">
        <section className="login-hero">
          <div className="kicker">Государственная библиотека</div>
          <h1 style={{ marginTop: 14 }}>
            Управляйте фондом и выдачей книг — <span className="hl">по QR</span>, аккуратно и быстро
          </h1>
          <p>
            Тёплый интерфейс без лишнего шума: каталог, читатели, выдача и отчеты — в одном месте.
          </p>
        </section>
        <form className="panel login-form" onSubmit={submit}>
          <h2>Вход в систему</h2>
          <p>Школа №79, Самара</p>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </label>
          <label>
            Пароль
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>
          {error && (
            <Notice type="error" title="Ошибка входа" onClose={() => setError('')}>
              {error}
            </Notice>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading && <span className="spinner" />}
            Войти
          </button>
          <Link className="btn btn-ghost" to="/register">Нет аккаунта? Регистрация</Link>
        </form>
      </div>
    </div>
  );
}
