import { apiRequest } from "./api.js";
import { useState } from 'react';

export default function Login({ go, onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
  
    const onSubmit = (e) => {
      e.preventDefault();
      setError('');
  
      apiRequest('/user/auth/login', 'POST', {
        email,
        password,
      })
        .then((data) => {
          onLogin(data.token);
        })
        .catch((err) => {
          setError(err.message);
        });
    };
  
    return (
      <div>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={onSubmit}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        <button onClick={() => go('register')}>
          Need an account? Register
        </button>
      </div>
    );
}
