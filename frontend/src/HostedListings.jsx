import { useState, useEffect } from 'react';
import { apiRequest } from './api.js';
import { useNavigate } from 'react-router-dom';
import ListingProfitsGraph from './ListingProfitsGraph.jsx';

export default function HostedListings({ token }) {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [publishingId, setPublishingId] = useState(null);
  const [availabilityInput, setAvailabilityInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    setError('');
    apiRequest('/listings', 'GET', null, token)
      .then((data) => setListings(data.listings || []))
      .catch((err) => setError(err.message));
  }, [token]);

  const handleDelete = (id) => {
    if (!token) return;
    setError('');
    setMessage('');

    apiRequest(`/listings/${id}`, 'DELETE', null, token)
      .then(() => {
        setListings((prev) => prev.filter((l) => l.id !== id));
        setConfirmDeleteId(null);
        setMessage('Listing deleted.');
      })
      .catch((err) => setError(err.message));
  };

  const handlePublish = (id, availability) => {
    if (!token) return;
    setError('');
    setMessage('');

    apiRequest(`/listings/publish/${id}`, 'PUT', { availability }, token)
      .then(() => {
        setListings(prev =>
          prev.map(l => l.id === id ? { ...l, published: true } : l)
        );
        setMessage('Listing is now live!');
      })
      .catch((err) => setError('Failed to publish: ' + err.message));
  };

  const handleUnpublish = (id) => {
    if (!token) return;

    setError('');
    setMessage('');

    apiRequest(`/listings/unpublish/${id}`, 'PUT', {}, token)
      .then(() => {
        setListings(prev =>
          prev.map(l => l.id === id ? { ...l, published: false } : l)
        );
        setMessage('Listing removed from public view.');
      })
      .catch((err) => setError(err.message));
  };

  const parseAvailability = (input) => {
    return input
      .split(',')
      .map(r => r.trim())
      .filter(Boolean)
      .map(range => {
        const [start, end] = range.split(':').map(s => s.trim());
        return { start, end };
      });
  };
  return (
    <div style={{ padding: 20 }}>
      <ListingProfitsGraph token={token} email={localStorage.getItem("email")} />
      <h2>My Hosted Listings</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <button onClick={() => navigate('/hosted/create')}>
        Create New Listing
      </button>

      {listings.length === 0 ? (
        <p>You have no hosted listings.</p>
      ) : (
        <div>
          {listings.map((listing) => (
            <div
              key={listing.id}
              style={{
                border: "1px solid black",
                padding: 12,
                marginTop: 12,
                maxWidth: 300,
              }}
            >
              <h3>{listing.title}</h3>

              {listing.thumbnail?.includes('youtube.com') ? (
                <iframe
                  width="250"
                  height="140"
                  src={`https://www.youtube.com/embed/${new URL(listing.thumbnail).searchParams.get('v')}`}
                  title={listing.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={listing.thumbnail || 'default_house.jpg'}
                  alt={listing.title}
                  width={250}
                  height={140}
                />
              )}

              <p>Type: {listing.metadata?.propertyType || 'N/A'}</p>
              <p>Bedrooms: {listing.metadata?.bedrooms || 'N/A'}</p>
              <p>Bathrooms: {listing.metadata?.bathrooms || 'N/A'}</p>
              <p>Total Reviews: {listing.reviews?.length || 0}</p>
              <p>Price: ${listing.price} / night</p>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => navigate(`/hosted/edit/${listing.id}`)}>
                  Edit
                </button>

                <button onClick={() => setConfirmDeleteId(listing.id)}>
                  Delete
                </button>

                {listing.published ? (
                  <button onClick={() => handleUnpublish(listing.id)}>
                    Remove (Unpublish)
                  </button>
                ) : (
                  <button onClick={() => setPublishingId(listing.id)}>
                    Go Live
                  </button>
                )}
                <button onClick={() => navigate(`/hosted/${listing.id}/bookings`)}>
                  View Booking Requests
                </button>
              </div>
              {confirmDeleteId === listing.id && (
                <div style={{ border: '1px solid red', padding: 10, marginTop: 10 }}>
                  <p>Are you sure you want to delete this listing?</p>
                  <button onClick={() => handleDelete(listing.id)}>
                    Yes, delete
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)}>
                    Cancel
                  </button>
                </div>
              )}
              {publishingId === listing.id && !listing.published && (
                <div style={{ border: '1px solid blue', padding: 10, marginTop: 10 }}>
                  <p>Enter availability ranges:</p>
                  <p style={{ fontSize: 12 }}>
                    Format: YYYY-MM-DD:YYYY-MM-DD, separate multiple with commas
                  </p>

                  <input
                    value={availabilityInput}
                    onChange={(e) => setAvailabilityInput(e.target.value)}
                    placeholder="2025-01-01:2025-01-05, 2025-02-10:2025-02-12"
                    style={{ width: '95%' }}
                  />

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => {
                        const availability = parseAvailability(availabilityInput);
                        if (availability.length === 0) {
                          setError('Please enter at least one valid availability range.');
                          return;
                        }
                        handlePublish(listing.id, availability);
                        setPublishingId(null);
                        setAvailabilityInput('');
                      }}
                    >
                      Publish Listing
                    </button>

                    <button
                      onClick={() => {
                        setPublishingId(null);
                        setAvailabilityInput('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}