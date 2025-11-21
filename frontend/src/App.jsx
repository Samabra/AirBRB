import { useState, useEffect } from 'react';
import { apiRequest } from './api.js';

import Landing from './Landing.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [token, setToken] = useState(null);
  const go = (screenName) => {
    setScreen(screenName);
  };
  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (saved) {
      setToken(saved);
      setScreen('home');
    }
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    go('home');
  };
  const handleLogout = () => {
    if (token) {
      apiRequest('/user/auth/logout', 'POST', {}, token)
        .finally(() => {
          localStorage.removeItem('token');
          setToken(null);
          go('landing');
        });
    } else {
      go('landing');
    }
  };

  const screens = {
    landing: <Landing go={go} />,
    login: <Login go={go} onLogin={handleLogin} />,
    register: <Register go={go} />,
  };

  return (
    <div>
      {token && <button onClick={handleLogout}>Logout</button>}
      {screens[screen]}
    </div>
  );
}
