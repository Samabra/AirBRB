import { useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell.jsx';

export default function Header({ token, email, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const onLandingAndLoggedOut = location.pathname === '/' && !token;

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        padding: '10px 20px',
        borderBottom: '1px solid #eee',
      }}
    >
      <h1
        style={{ margin: 0, cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        Airbrb
      </h1>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {token && email && <NotificationBell token={token} email={email} />}

        {onLandingAndLoggedOut ? (
          <>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/register')}>Register</button>
          </>
        ) : token ? (
          <>
            <button onClick={() => navigate('/home')}>Home</button>
            <button onClick={() => navigate('/hosted')}>My Hosted Listings</button>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/register')}>Register</button>
          </>
        )}
      </div>
    </header>
  );
}