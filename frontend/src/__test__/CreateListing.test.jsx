import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateListing from '../CreateListing';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { apiRequest } from '../api.js';

vi.mock('../api.js', () => ({
  apiRequest: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CreateListing Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all input fields', () => {
    render(
      <MemoryRouter>
        <CreateListing token="token123" />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Listing Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Street')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('City')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Postcode')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Country')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Price Per Night')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Thumbnail (base64 or URL)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('YouTube embed URL (optional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Property Type')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Number of Bathrooms')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Number of Bedrooms')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amenities (comma separated)')).toBeInTheDocument();
  });

  test('calls apiRequest and navigates on successful submission', async () => {
    apiRequest.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <CreateListing token="token123" />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Listing Title'), { target: { value: 'Test House' } });
    fireEvent.change(screen.getByPlaceholderText('Street'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: 'Testville' } });
    fireEvent.change(screen.getByPlaceholderText('Postcode'), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'Testland' } });
    fireEvent.change(screen.getByPlaceholderText('Price Per Night'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('Property Type'), { target: { value: 'Unit' } });
    fireEvent.change(screen.getByPlaceholderText('Number of Bathrooms'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('Number of Bedrooms'), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText('Amenities (comma separated)'), { target: { value: 'Pool,Wifi' } });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        '/listings/new',
        'POST',
        {
          title: 'Test House',
          address: {
            street: '123 Main St',
            city: 'Testville',
            postcode: '12345',
            country: 'Testland',
          },
          price: 100,
          thumbnail: '',
          metadata: {
            propertyType: 'Unit',
            bathrooms: 1,
            bedrooms: 2,
            amenities: ['Pool', 'Wifi'],
          },
        },
        'token123'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/hosted');
    });
  });

  test('shows error message when apiRequest fails', async () => {
    apiRequest.mockRejectedValueOnce(new Error('Failed to create listing'));

    render(
      <MemoryRouter>
        <CreateListing token="token123" />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Create'));

    expect(await screen.findByText('Failed to create listing')).toBeInTheDocument();
  });
});