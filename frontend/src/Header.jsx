
import NotificationBell from './NotificationBell.jsx';
import { useNavigate } from 'react-router-dom';

export default function Header({ token, email, onLogout }) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        borderBottom: '1px solid #eee',
        marginBottom: 20,
      }}
    >
      <h1 style={{ margin: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
        Airbrb
      </h1>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {token && email && <NotificationBell token={token} email={email} />}

        {!token ? (
          <>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/register')}>Register</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/home')}>Home</button>
            <button onClick={() => navigate('/hosted')}>My Hosted Listings</button>
            <button onClick={onLogout}>Logout</button>
          </>
        )}
      </div>
    </header>
  );
}