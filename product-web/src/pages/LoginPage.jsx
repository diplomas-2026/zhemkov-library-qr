import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../lib/api';
import { saveAuth } from '../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('librarian79@school.local');
  const [password, setPassword] = useState('Lib123!');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      saveAuth(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
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
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary" type="submit">Войти</button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => { setEmail('librarian79@school.local'); setPassword('Lib123!'); }}
          >
            Подставить тестовые данные
          </button>
        </form>
      </div>
    </div>
  );
}
