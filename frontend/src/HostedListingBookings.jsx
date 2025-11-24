import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from './api.js';

export default function HostedListingBookings({ token }) {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError('');
    setMessage('');

    Promise.all([
      apiRequest(`/listings/${listingId}`, 'GET', null, token),
      apiRequest(`/bookings`, 'GET', null, token),
    ])
      .then(([listingData, bookingData]) => {
        const l = listingData.listing;
        const allBookings = bookingData.bookings || [];

        const forThisListing = allBookings.filter(
          (b) => String(b.listingId) === String(listingId)
        );

        setListing(l);
        setBookings(forThisListing);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [listingId, token]);

  const acceptBooking = (bookingId) => {
    setError('');
    setMessage('');

    apiRequest(`/bookings/accept/${bookingId}`, 'PUT', {}, token)
      .then(() => {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: 'accepted' } : b
          )
        );
        setMessage('Booking accepted.');
      })
      .catch((err) => setError(err.message));
  };

  const declineBooking = (bookingId) => {
    setError('');
    setMessage('');

    apiRequest(`/bookings/decline/${bookingId}`, 'PUT', {}, token)
      .then(() => {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: 'declined' } : b
          )
        );
        setMessage('Booking declined.');
      })
      .catch((err) => setError(err.message));
  };

  
