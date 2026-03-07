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
      <form className="card" onSubmit={submit}>
        <h1>Вход в библиотечную систему</h1>
        <p>Школа №79, Самара</p>
        <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Пароль<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <div className="error">{error}</div>}
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}
