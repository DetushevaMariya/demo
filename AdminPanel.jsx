import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import Toast from '../components/Toast';
import Layout from '../components/Layout';

export default function AdminPanel() {
  const [applications, setApplications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState({ message: '', type: '' });
  const { user } = useContext(AuthContext);
  const itemsPerPage = 5;

  const fetchApplications = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch('http://localhost:3000/api/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
        setFiltered(data);
      }
    } catch {
      setToast({ message: 'Ошибка загрузки данных', type: 'error' });
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    let result = applications;
    if (filter !== 'all') {
      result = applications.filter(app => app.status === filter);
    }
    setFiltered(result);
    setPage(1);
  }, [filter, applications]);

  const updateStatus = async (id, status) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch(`http://localhost:3000/api/applications/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setApplications(apps => apps.map(app => 
          app.id === id ? { ...app, status } : app
        ));
        setToast({ message: 'Статус обновлён', type: 'success' });
      }
    } catch {
      setToast({ message: 'Ошибка обновления', type: 'error' });
    }
  };

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const getStatusOptions = (current) => [
    { value: 'new', label: 'Новая', disabled: current === 'new' },
    { value: 'in_progress', label: 'Идет обучение', disabled: current === 'in_progress' },
    { value: 'completed', label: 'Завершено', disabled: current === 'completed' },
  ];

  return (
    <Layout>
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2>Панель администратора</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'new', 'in_progress', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={filter === f ? 'btn-primary' : ''}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: filter === f ? 'var(--primary)' : 'white',
                  color: filter === f ? 'white' : 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                {f === 'all' ? 'Все' : f === 'new' ? 'Новые' : f === 'in_progress' ? 'В процессе' : 'Завершённые'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
            Заявок не найдено
          </p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Пользователь</th>
                    <th>Курс</th>
                    <th>Дата</th>
                    <th>Оплата</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(app => (
                    <tr key={app.id} className="hover-pulse">
                      <td style={{ fontWeight: '500' }}>#{app.id}</td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{app.full_name || app.login}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{app.login}</div>
                      </td>
                      <td>{app.course_name}</td>
                      <td>{app.start_date?.split('T')[0] || app.start_date}</td>
                      <td>{app.payment_method === 'cash' ? '💵 Наличные' : '📱 По телефону'}</td>
                      <td>
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          {getStatusOptions(app.status).map(opt => (
                            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${app.login} | ${app.course_name}`);
                            setToast({ message: 'Скопировано!', type: 'info' });
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          📋 Копировать
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ opacity: page === 1 ? 0.5 : 1 }}
                >
                  ← Назад
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={page === i + 1 ? 'active' : ''}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ opacity: page === totalPages ? 0.5 : 1 }}
                >
                  Вперёд →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: '' })} 
      />
    </Layout>
  );
}