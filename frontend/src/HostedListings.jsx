import { useState, useEffect } from 'react';
import { apiRequest } from './api.js';
import { useNavigate } from 'react-router-dom';

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

    apiRequest(`/listings`, 'GET', null, token)
      .then((data) => {
        setListings(data.listings || []);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  const handleDelete = (id) => {
    if (!token) return;

    apiRequest(`/listings/${id}`, 'DELETE', null, token)
      .then(() => {
        setListings((prev) => prev.filter((l) => l.id !== id));
      })
      .catch((err) => setError(err.message));
  };

  const handlePublish = (id) => {
    const input = prompt(
      'Enter availability ranges (format: YYYY-MM-DD:YYYY-MM-DD, separate multiple ranges with comma):'
    );
  
    if (!input) return;
  
    const availability = input.split(',').map((range) => {
      const [start, end] = range.split(':').map(s => s.trim());
      return { start, end };
    });
  
    apiRequest(`/listings/publish/${id}`, 'PUT', { availability }, token)
      .then(() => {
        alert('Listing is now live!');
      })
      .catch((err) => {
        alert('Failed to publish: ' + err.message);
      });
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

  return (
    <div>
      <h2>My Hosted Listings</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <button onClick={() => navigate('/hosted/create')}>Create New Listing</button>

      {listings.length === 0 ? (
        <p>You have no hosted listings.</p>
      ) : (
        <div className="listings-container">
          {listings.map((listing) => (
            <div key={listing.id} className="listing-card" style={{ border: "1px solid black" }}>
              <h3>{listing.title}</h3>

              {listing.thumbnail?.includes('youtube.com') ? (
                <iframe
                  width="250"
                  height="140"
                  src={`https://www.youtube.com/embed/${new URL(listing.thumbnail).searchParams.get('v')}`}
                  title={listing.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
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

              <button onClick={() => navigate(`/hosted/edit/${listing.id}`)}>Edit</button>
              <button onClick={() => setConfirmDeleteId(listing.id)}>
                Delete
              </button>
              {confirmDeleteId === listing.id && (
                <div style={{ border: '1px solid red', padding: 10, marginTop: 10 }}>
                  <p>Are you sure you want to delete this listing?</p>
                  <button onClick={() => handleDelete(listing.id)}>Yes, delete</button>
                  <button onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                </div>
              )}

              {listing.published ? (
                <button onClick={() => handleUnpublish(listing.id)}>
                  Remove (Unpublish)
                </button>
              ) : (
                <button onClick={() => setPublishingId(listing.id)}>
                  Go Live
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
