import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { request } from '../lib/api';
import { saveAuth } from '../lib/auth';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    }
    try {
      const data = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName })
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
          <div className="kicker">Регистрация</div>
          <h1 style={{ marginTop: 14 }}>
            Создайте учетную запись и сохраняйте <span className="hl">историю</span> работы
          </h1>
          <p>
            После регистрации вы сможете входить в систему и использовать доступные функции в соответствии с ролью.
          </p>
        </section>
        <form className="panel login-form" onSubmit={submit}>
          <h2>Создать аккаунт</h2>
          <p>Введите данные — это займет минуту.</p>
          <label>
            ФИО
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Например, Иванов Иван" />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="username" />
          </label>
          <label>
            Пароль
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </label>
          <label>
            Повтор пароля
            <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} autoComplete="new-password" />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary" type="submit">Зарегистрироваться</button>
          <Link className="btn btn-ghost" to="/login">Уже есть аккаунт? Войти</Link>
        </form>
      </div>
    </div>
  );
}

