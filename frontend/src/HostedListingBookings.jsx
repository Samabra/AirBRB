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
  const stats = (() => {
    if (!listing) return { daysOnline: 0, daysBookedThisYear: 0, profitThisYear: 0 };

    const price = listing.price || 0;

    const now = new Date();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const liveSinceRaw = listing.postedOn;
    const liveSince = liveSinceRaw ? new Date(liveSinceRaw) : null;

    const daysOnline = liveSince
      ? Math.ceil((now - liveSince) / (1000 * 60 * 60 * 24))
      : 0;

    let daysBookedThisYear = 0;
    let profitThisYear = 0;

    bookings
      .filter((b) => b.status === 'accepted')
      .forEach((b) => {
        const start = new Date(b.dateRange.start);
        const end = new Date(b.dateRange.end);
        const clampedStart = start < startOfYear ? startOfYear : start;
        const clampedEnd = end > endOfYear ? endOfYear : end;

        if (clampedEnd > clampedStart) {
          const nights = (clampedEnd - clampedStart) / (1000 * 60 * 60 * 24);
          daysBookedThisYear += nights;
          profitThisYear += nights * price;
        }
      });

    return { daysOnline, daysBookedThisYear, profitThisYear };
  })();

  if (loading) return <p>Loading booking data...</p>;

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/hosted')}>Back</button>
      </div>
    );
  }

  const pending = bookings.filter((b) => b.status === 'pending');

  return (
    <div style={{ padding: 20 }}>
      <h2>Booking Requests & History</h2>

      <h3>{listing.title}</h3>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      <div style={{ border: '1px solid #ddd', padding: 12, margin: '12px 0' }}>
        <p><strong>Days online:</strong> {stats.daysOnline}</p>
        <p><strong>Days booked this year:</strong> {stats.daysBookedThisYear}</p>
        <p><strong>Profit this year:</strong> ${stats.profitThisYear}</p>
      </div>

      <h3>Pending Requests</h3>
      {pending.length === 0 ? (
        <p>No pending booking requests.</p>
      ) : (
        pending.map((b) => (
          <div
            key={b.id}
            style={{ border: '1px solid #999', padding: 10, marginBottom: 10 }}
          >
            <p><strong>Guest:</strong> {b.email}</p>
            <p><strong>Dates:</strong> {b.dateRange.start} → {b.dateRange.end}</p>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => acceptBooking(b.id)}>Accept</button>
              <button onClick={() => declineBooking(b.id)}>Decline</button>
            </div>
          </div>
        ))
      )}
      <h3>History</h3>
      {bookings.map((b) => (
        <div key={b.id} style={{ padding: 6 }}>
          {b.email} — {b.dateRange.start} → {b.dateRange.end} ({b.status})
        </div>
      ))}

      <button style={{ marginTop: 16 }} onClick={() => navigate('/hosted')}>
        Back to Hosted Listings
      </button>
    </div>
  );
}