import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { apiRequest } from './api.js';

import Home from './Home.jsx';
import Landing from './Landing.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';

export default function App() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('email');
    if (saved && savedEmail) {
      setToken(saved);
      setEmail(savedEmail);
    }
  }, []);

  const handleLogin = (newToken, userEmail) => {
    setToken(newToken);
    setEmail(userEmail);
    localStorage.setItem('token', newToken);
    localStorage.setItem('email', userEmail);
  };

  const handleLogout = () => {
    if (token) {
      apiRequest('/user/auth/logout', 'POST', {}, token).finally(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        setToken(null);
      });
    }
  };

  return (
    <Router>
      {token && <button onClick={handleLogout}>Logout</button>}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/hosted"
          element={token ? <HostedListings token={token} email={email} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}
