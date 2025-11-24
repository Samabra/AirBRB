import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HostedListings from '../HostedListings';
import { BrowserRouter } from 'react-router-dom';
import { apiRequest } from '../api';
import { vi } from 'vitest';

vi.mock('../api', () => ({
  apiRequest: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('HostedListings Component', () => {
  test('loads and displays listings', async () => {
    apiRequest.mockResolvedValue({
      listings: [
        {
          id: 1,
          title: 'Test House',
          price: 100,
          metadata: { propertyType: 'Unit', bedrooms: 2, bathrooms: 1 },
          reviews: [],
          thumbnail: '',
        },
      ],
    });

    render(
      <BrowserRouter>
        <HostedListings token="token123" />
      </BrowserRouter>
    );

    expect(await screen.findByText('Test House')).toBeInTheDocument();
    expect(screen.getByText('Price: $100 / night')).toBeInTheDocument();
  });

  test('delete button removes listing', async () => {
    apiRequest.mockResolvedValueOnce({
      listings: [
        { id: 1, title: 'House One', price: 50, metadata: {}, reviews: [] },
      ],
    });

    apiRequest.mockResolvedValueOnce({});

    global.confirm = vi.fn(() => true);

    render(
      <BrowserRouter>
        <HostedListings token="token123" />
      </BrowserRouter>
    );

    const deleteBtn = await screen.findByText('Delete');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('House One')).not.toBeInTheDocument();
    });
  });

  test('shows "no hosted listings" when empty', async () => {
    apiRequest.mockResolvedValue({ listings: [] });

    render(
      <BrowserRouter>
        <HostedListings token="token123" />
      </BrowserRouter>
    );

    expect(await screen.findByText('You have no hosted listings.')).toBeInTheDocument();
  });
});
