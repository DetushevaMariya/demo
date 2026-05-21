import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateApplication from './pages/CreateApplication';
import AdminPanel from './pages/AdminPanel';
import Slider from './components/Slider';

export const AuthContext = createContext();

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();

  const login = (data) => {
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    navigate(data.role === 'admin' ? '/admin' : '/dashboard');
  };
  const logout = () => { localStorage.removeItem('user'); setUser(null); navigate('/login'); };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="container animate-fade">
        <Slider />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={user?.role === 'user' ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/create" element={user?.role === 'user' ? <CreateApplication /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/login" />} />
          <Route path="*" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}
