import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from './api';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    apiRequest('/user/auth/register', 'POST', { email, password, name })
      .then(() => navigate('/login'))
      .catch((err) => setError(err.message));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        p: 2
      }}
    >
      <Paper sx={{ p: 4, width: 400, maxWidth: '90%' }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 700 }}>
          Register
        </Typography>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <form onSubmit={onSubmit}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            type="password"
            label="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Create Account
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
