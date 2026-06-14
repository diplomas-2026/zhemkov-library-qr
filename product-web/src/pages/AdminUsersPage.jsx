import { useEffect, useMemo, useState } from 'react';
import { request } from '../lib/api';
import Notice from '../components/Notice';
import { roleLabel } from '../lib/roles';

const emptyForm = {
  id: null,
  email: '',
  fullName: '',
  password: '',
  role: 'READER',
  active: true
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const editing = Boolean(form.id);
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.email.localeCompare(b.email)),
    [users]
  );

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

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSuccess('');
    setError('');
  };

  const editUser = (user) => {
    setForm({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      password: '',
      role: user.role,
      active: user.active
    });
    setSuccess('');
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!editing && !form.password.trim()) {
      setError('Укажите пароль для нового пользователя');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        role: form.role,
        active: form.active
      };
      if (form.password.trim()) {
        payload.password = form.password;
      }

      if (editing) {
        await request(`/api/users/${form.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccess('Пользователь обновлен');
      } else {
        await request('/api/users', {
          method: 'POST',
          body: JSON.stringify({ ...payload, password: form.password })
        });
        setSuccess('Пользователь добавлен');
      }
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user) => {
    setError('');
    setSuccess('');
    try {
      await request(`/api/users/${user.id}/active`, {
        method: 'PUT',
        body: JSON.stringify({ active: !user.active })
      });
      setSuccess(user.active ? 'Пользователь заблокирован' : 'Пользователь активирован');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <div className="kicker">Администрирование</div>
          <h1 className="page-title">Пользователи и <span className="hl">доступ</span></h1>
          <p className="page-subtitle">
            Добавляйте сотрудников и читателей, меняйте роли, контакты и состояние учетной записи.
          </p>
        </div>
      </header>

      {success && (
        <div style={{ marginBottom: 12 }}>
          <Notice type="success" title="Готово" onClose={() => setSuccess('')}>
            {success}
          </Notice>
        </div>
      )}
      {error && (
        <div style={{ marginBottom: 12 }}>
          <Notice type="error" title="Ошибка" onClose={() => setError('')}>
            {error}
          </Notice>
        </div>
      )}

      <form className="panel grid-form" onSubmit={submit}>
        <div className="col-12">
          <div className="kicker">{editing ? 'Редактирование' : 'Новый пользователь'}</div>
          <h2 style={{ marginTop: 10 }}>{editing ? form.email : 'Добавить учетную запись'}</h2>
        </div>
        <label className="col-4">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateForm('email', e.target.value)}
            placeholder="user@school.local"
            required
          />
        </label>
        <label className="col-4">
          ФИО
          <input
            value={form.fullName}
            onChange={(e) => updateForm('fullName', e.target.value)}
            placeholder="Иван Петров"
            required
          />
        </label>
        <label className="col-4">
          Пароль
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateForm('password', e.target.value)}
            placeholder={editing ? 'Оставьте пустым, чтобы не менять' : 'Пароль'}
            required={!editing}
          />
        </label>
        <label className="col-4">
          Роль
          <select value={form.role} onChange={(e) => updateForm('role', e.target.value)}>
            <option value="ADMIN">{roleLabel('ADMIN')}</option>
            <option value="LIBRARIAN">{roleLabel('LIBRARIAN')}</option>
            <option value="READER">{roleLabel('READER')}</option>
          </select>
        </label>
        <label className="col-4">
          Активность
          <select value={form.active ? 'true' : 'false'} onChange={(e) => updateForm('active', e.target.value === 'true')}>
            <option value="true">Активен</option>
            <option value="false">Заблокирован</option>
          </select>
        </label>
        <div className="col-12 form-actions">
          {editing && (
            <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={saving}>
              Отмена
            </button>
          )}
          <button className="btn btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            {editing ? 'Сохранить изменения' : 'Добавить пользователя'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="panel panel-soft" style={{ marginTop: 12 }}>
          <div className="kicker"><span className="spinner" />Загрузка</div>
          <h2 style={{ marginTop: 10 }}>Получаем список пользователей…</h2>
        </div>
      )}

      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>Email</th><th>ФИО</th><th>Роль</th><th>Активен</th><th>Действия</th></tr></thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.fullName}</td>
                <td><span className="badge">{roleLabel(user.role)}</span></td>
                <td>{user.active ? 'Да' : 'Нет'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => editUser(user)}>
                      Редактировать
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => toggleActive(user)}>
                      {user.active ? 'Заблокировать' : 'Активировать'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && sortedUsers.length === 0 && (
              <tr><td colSpan={5} style={{ color: 'rgba(23,20,18,0.60)' }}>Пользователей пока нет</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
