import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from './api.js';
import { Button, Typography, Box, TextField } from '@mui/material';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');

    apiRequest('/user/auth/login', 'POST', { email, password })
      .then((data) => {
        onLogin(data.token, email);
        navigate('/home');
      })
      .catch((err) => setError(err.message));
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 8,
        p: 4,
        border: '1px solid #ccc',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h4" gutterBottom align="center">
        Login
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <form onSubmit={onSubmit}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" color="primary" type="submit">
            Login
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate('/register')}>
            Sign Up
          </Button>
        </Box>
      </form>
    </Box>
  );
}