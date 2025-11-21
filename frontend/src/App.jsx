import { useState, useEffect } from 'react';
import { apiRequest } from './api.js';

import HostedListings from './HostedListings.jsx';
import Home from './Home.jsx';
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
    const savedEmail = localStorage.getItem('email');
    if (saved && savedEmail) {
      setToken(saved);
      setEmail(savedEmail);
      setScreen('home');
    }
  }, []);

  const handleLogin = (newToken, email) => {
    setToken(newToken);
    setEmail(email);
    localStorage.setItem('token', newToken);
    localStorage.setItem(email);
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
      go('home');
    }
  };

  const screens = {
    home: <Home go={go} />,
    landing: <Landing go={go} />,
    login: <Login go={go} onLogin={handleLogin} />,
    register: <Register go={go} />,
    hosted: <HostedListings go={go} email={email} token={token} /> 
  };

  return (
    <div>
      {token && <button onClick={handleLogout}>Logout</button>}
      {screens[screen]}
    </div>
  );
}
