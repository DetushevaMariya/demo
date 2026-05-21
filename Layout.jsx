import { useContext } from 'react';
import { AuthContext } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = user?.role === 'admin' 
    ? [
        { path: '/admin', label: 'Панель администратора' },
        { path: '/dashboard', label: 'Заявки' },
      ]
    : [
        { path: '/dashboard', label: 'Мои заявки' },
        { path: '/create', label: 'Новая заявка' },
      ];

  return (
    <div className="layout">
      {/* Шапка */}
      <header className="card flex-between" style={{ marginBottom: '20px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            {user?.role === 'admin' ? 'A' : 'U'}
          </div>
          <div>
            <div style={{ fontWeight: '600' }}>
              {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {user?.login || 'Гость'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={location.pathname === item.path ? 'btn-primary' : ''}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: location.pathname === item.path ? 'var(--primary)' : 'transparent',
                color: location.pathname === item.path ? 'white' : 'var(--text)',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              {item.label}
            </button>
          ))}
          <button 
            onClick={logout}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #ef4444',
              background: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            className="hover-pulse"
          >
            Выйти
          </button>
        </div>
      </header>

      {/* Основной контент */}
      <main className="animate-fade">
        {children}
      </main>

      {/* Футер */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '20px', 
        color: '#64748b', 
        fontSize: '12px',
        marginTop: '40px'
      }}>
        Портал «Корочки.есть» © 2026
      </footer>
    </div>
  );
}