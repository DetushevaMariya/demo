import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import Toast from '../components/Toast';

export default function Login() {
  const [form, setForm] = useState({ login: '', password: '' });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ message: '', type: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.login.trim()) errs.login = 'Введите логин';
    if (!form.password) errs.password = 'Введите пароль';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setErrors({ server: data.error });
        setToast({ message: data.error, type: 'error' });
        return;
      }
      
      login({ ...data, login: form.login });
      setToast({ message: 'Успешный вход!', type: 'success' });
    } catch (err) {
      setErrors({ server: 'Ошибка подключения к серверу' });
      setToast({ message: 'Ошибка сети', type: 'error' });
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Авторизация</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <input
            placeholder="Логин"
            value={form.login}
            onChange={(e) => {
              setForm({ ...form, login: e.target.value });
              if (errors.login) setErrors({ ...errors, login: '' });
            }}
            style={{ borderColor: errors.login ? 'var(--error)' : '' }}
          />
          {errors.login && <span className="error">{errors.login}</span>}
        </div>
        
        <div>
          <input
            type="password"
            placeholder="Пароль"
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            style={{ borderColor: errors.password ? 'var(--error)' : '' }}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        
        {errors.server && <span className="error" style={{ display: 'block', textAlign: 'center' }}>{errors.server}</span>}
        
        <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
          Войти
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        <span className="link" onClick={() => navigate('/register')}>
          Еще не зарегистрированы? Регистрация
        </span>
      </p>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: '' })} 
      />
    </div>
  );
}