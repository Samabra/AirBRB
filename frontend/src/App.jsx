import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from './api.js';

import Home from './Home.jsx';
import Landing from './Landing.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import HostedListings from './HostedListings.jsx';
import CreateListing from './CreateListing.jsx';
import EditListing from './EditListing.jsx';
import ViewListing from './ViewListing.jsx';
import HostedListingBookings from './HostedListingBookings.jsx';

function AppRoutes({ token, email, setToken, setEmail }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (token) {
      apiRequest('/user/auth/logout', 'POST', {}, token).finally(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        setToken(null);

        if (location.pathname.startsWith("/listing/")) {
          navigate("/login");
        }
      });
    }
  };

  return (
    <>
      {token && <button onClick={handleLogout}>Logout</button>}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={(t, e) => { setToken(t); setEmail(e); localStorage.setItem('token', t); localStorage.setItem('email', e); }} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hosted" element={token ? <HostedListings token={token} email={email} /> : <Navigate to="/login" />} />
        <Route path="/hosted/create" element={<CreateListing token={token} />} />
        <Route path="/hosted/edit/:listingId" element={<EditListing token={token} />} />
        <Route path="/hosted/:listingId/bookings" element={token ? <HostedListingBookings token={token} /> : <Navigate to="/login" />} />
        <Route path="/listing/:listingId" element={<ViewListing token={token} />} />
      </Routes>
    </>
  );
}

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

  return (
    <Router>
      <AppRoutes token={token} email={email} setToken={setToken} setEmail={setEmail} />
    </Router>
  );
}
