import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import Toast from '../components/Toast';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [reviews, setReviews] = useState({});
  const [toast, setToast] = useState({ message: '', type: '' });
  const { user } = useContext(AuthContext);

  const fetchApplications = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch('http://localhost:3000/api/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      setToast({ message: 'Ошибка загрузки заявок', type: 'error' });
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const submitReview = async (applicationId, text) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ application_id: applicationId, text }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: 'Отзыв отправлен!', type: 'success' });
        setReviews({ ...reviews, [applicationId]: '' });
      } else {
        setToast({ message: data.error, type: 'error' });
      }
    } catch {
      setToast({ message: 'Ошибка отправки отзыва', type: 'error' });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: { bg: '#fbbf24', color: '#78350f', text: 'Новая' },
      in_progress: { bg: '#60a5fa', color: '#1e3a8a', text: 'Идет обучение' },
      completed: { bg: '#22c55e', color: '#14532d', text: 'Завершено' },
    };
    const s = styles[status] || styles.new;
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        background: s.bg,
        color: s.color,
        fontSize: '12px',
        fontWeight: '500'
      }}>
        {s.text}
      </span>
    );
  };

  return (
    <Layout>
      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Мои заявки</h2>
        
        {applications.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
            У вас пока нет заявок. <br/>
            <span className="link" onClick={() => window.location.href = '/create'}>
              Создать первую заявку →
            </span>
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Курс</th>
                  <th>Дата начала</th>
                  <th>Оплата</th>
                  <th>Статус</th>
                  <th>Отзыв</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td>{app.course_name}</td>
                    <td>{app.start_date?.split('T')[0] || app.start_date}</td>
                    <td>{app.payment_method === 'cash' ? 'Наличными' : 'По телефону'}</td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>
                      {app.status === 'completed' ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Ваш отзыв..."
                            value={reviews[app.id] || ''}
                            onChange={(e) => setReviews({ ...reviews, [app.id]: e.target.value })}
                            style={{ padding: '6px 10px', fontSize: '13px', width: '150px' }}
                          />
                          <button
                            onClick={() => submitReview(app.id, reviews[app.id])}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }}
                          >
                            Отправить
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                          {app.status === 'in_progress' ? 'После завершения' : 'Недоступно'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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