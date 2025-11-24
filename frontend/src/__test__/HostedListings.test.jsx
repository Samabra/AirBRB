import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HostedListings from '../HostedListings';
import { BrowserRouter } from 'react-router-dom';
import { apiRequest } from '../api';

jest.mock('../api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

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

    global.confirm = jest.fn(() => true);

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
