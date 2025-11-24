import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../Register.jsx';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import * as api from '../api.js';

vi.mock('../api.js', () => ({
  apiRequest: vi.fn()
}));

describe('Register Component', () => {
  test('renders input fields', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
  });

  test('shows error when passwords do not match', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'abcd' } });
    fireEvent.click(screen.getByText('Create account'));

    expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
  });

  test('calls apiRequest on successful registration', async () => {
    api.apiRequest.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: '1234' } });

    fireEvent.click(screen.getByText('Create account'));

    await waitFor(() => {
      expect(api.apiRequest).toHaveBeenCalledWith(
        '/user/auth/register',
        'POST',
        { email: 'test@example.com', password: '1234', name: 'Test User' }
      );
    });
  });
});
