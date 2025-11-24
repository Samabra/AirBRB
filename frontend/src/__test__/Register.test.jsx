import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../Register.jsx';
import { MemoryRouter } from 'react-router-dom';
import { apiRequest } from '../api.js';

jest.mock('../api.js', () => ({
  apiRequest: jest.fn()
}));

test('navigates to /login after successful registration', async () => {
  apiRequest.mockResolvedValueOnce({});

  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@test.com' } });
  fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Test User' } });
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
  fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password' } });

  fireEvent.submit(screen.getByRole('form'));

  expect(apiRequest).toHaveBeenCalledWith(
    '/user/auth/register',
    'POST',
    { email: 'test@test.com', password: 'password', name: 'Test User' }
  );
});
