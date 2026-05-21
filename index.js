require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'koroki_db',
  password: process.env.DB_PASS || '',
  port: 5432,
});

const SECRET = 'exam_secret_2026';

// Middleware авторизации
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch { res.status(403).json({ error: 'Неверный токен' }); }
};

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  const { login, password, full_name, phone, email } = req.body;
  try {
    // Добавили role в RETURNING, чтобы сразу подписать токен
    const { rows } = await pool.query(
      'INSERT INTO users (login, password, full_name, phone, email) VALUES ($1,$2,$3,$4,$5) RETURNING id, role',
      [login, password, full_name, phone, email]
    );
    // Генерируем настоящий JWT
    const token = jwt.sign({ id: rows[0].id, role: rows[0].role }, SECRET, { expiresIn: '24h' });
    res.json({ token, role: rows[0].role }); // Отдаём токен клиенту
  } catch (e) {
    res.status(400).json({ error: e.code === '23505' ? 'Логин или Email уже заняты' : e.message });
  }
});

// Авторизация
app.post('/api/auth/login', async (req, res) => {
  const { login, password } = req.body;
  const { rows } = await pool.query('SELECT id, role, password FROM users WHERE login = $1', [login]);
  if (rows.length === 0 || rows[0].password !== password) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }
  const token = jwt.sign({ id: rows[0].id, role: rows[0].role }, SECRET, { expiresIn: '24h' });
  res.json({ token, role: rows[0].role });
});

// Создание заявки
app.post('/api/applications', auth, async (req, res) => {
  const { course_name, start_date, payment_method } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO applications (user_id, course_name, start_date, payment_method) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.user.id, course_name, start_date, payment_method]
  );
  res.json(rows[0]);
});

// Получение заявок (user: свои, admin: все)
app.get('/api/applications', auth, async (req, res) => {
  const query = req.user.role === 'admin'
    ? 'SELECT a.*, u.full_name, u.login FROM applications a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC'
    : 'SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC';
  const params = req.user.role === 'admin' ? [] : [req.user.id];
  const { rows } = await pool.query(query, params);
  res.json(rows);
});

// Смена статуса (админ)
app.put('/api/applications/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  const { status } = req.body;
  if (!['new', 'in_progress', 'completed'].includes(status)) return res.status(400).json({ error: 'Неверный статус' });
  const { rows } = await pool.query('UPDATE applications SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
  res.json(rows[0]);
});

// Отзыв
app.post('/api/reviews', auth, async (req, res) => {
  const { application_id, text } = req.body;
  // Проверка: курс завершён
  const { rows: apps } = await pool.query('SELECT user_id, status FROM applications WHERE id = $1', [application_id]);
  if (!apps.length || apps[0].user_id !== req.user.id || apps[0].status !== 'completed') {
    return res.status(400).json({ error: 'Отзыв можно оставить только после завершения курса' });
  }
  await pool.query('INSERT INTO reviews (application_id, user_id, text) VALUES ($1,$2,$3)', [application_id, req.user.id, text]);
  res.json({ message: 'Отзыв добавлен' });
});

app.listen(3000, () => console.log('✅ Backend running on http://localhost:3000'));