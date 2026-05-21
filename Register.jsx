import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const validate = (data) => {
  const errs = {};
  if (!/^[a-zA-Z0-9]{6,}$/.test(data.login)) errs.login = 'Логин: латиница+цифры, ≥6';
  if (!/^.{8,}$/.test(data.password)) errs.password = 'Пароль: ≥8 символов';
  if (!/^[а-яА-ЯёЁ\s]+$/.test(data.full_name)) errs.full_name = 'ФИО: кириллица и пробелы';
  if (!/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(data.phone)) errs.phone = 'Телефон: 8(XXX)XXX-XX-XX';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'Неверный формат email';
  return errs;
};

export default function Register() {
  const [form, setForm] = useState({ login: '', password: '', full_name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) return setErrors(errs);
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form) 
      });
      const data = await res.json();
      if (!res.ok) return setErrors({ server: data.error });
      login({ ...data, login: form.login }); // Теперь data содержит настоящий token и role
      navigate('/dashboard');
    } catch { setErrors({ server: 'Ошибка сети' }); }
  };

  return (
    <div className="card animate-fade" style={{ maxWidth: '500px', margin: '40px auto' }}>
      {/* Добавлен стиль для центрирования заголовка */}
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Регистрация</h2>
      
      <form onSubmit={submit}>
        {Object.keys(form).map(k => (
          <div key={k} style={{ marginBottom: '12px' }}>
            <input 
              placeholder={k === 'full_name' ? 'ФИО' : k === 'phone' ? '8(XXX)XXX-XX-XX' : k} 
              value={form[k]} 
              onChange={e => setForm(p => ({...p, [k]: e.target.value}))} 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: errors[k] ? '1px solid #ef4444' : '1px solid #cbd5e1' }}
            />
            {errors[k] && <span className="error">{errors[k]}</span>}
          </div>
        ))}
        {errors.server && <span className="error" style={{ display: 'block', textAlign: 'center' }}>{errors.server}</span>}
        
        <button type="submit" className="btn-primary" style={{ marginTop: '8px', cursor: 'pointer' }}>
          Создать пользователя
        </button>
      </form>

      {/* Ссылка также отцентрирована для симметрии */}
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        <span className="link" onClick={() => navigate('/login')}>
          Уже зарегистрированы? Авторизация
        </span>
      </p>
    </div>
  );
}