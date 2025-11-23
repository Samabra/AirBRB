import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from './api';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest('/listings', 'GET')
      .then((data) => setListings(data.listings))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to Airbrb!</h1>
      <p>Select an option below:</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/hosted">
          <button>View My Hosted Listings</button>
        </Link>
        <Link to="/home">
          <button style={{ marginLeft: '10px' }}>Back to Home</button>
        </Link>
      </div>

      <h1>All Listings</h1>

      {listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {listings.map((listing) => (
            <div
              key={listing.id}
              style={{
                width: '250px',
                border: '1px solid #ccc',
                padding: '10px',
                margin: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/listing/${listing.id}`)}
            >
              <img
                src={listing.thumbnail}
                alt="thumbnail"
                style={{ width: '100%', borderRadius: '6px' }}
              />
              <h3>{listing.title}</h3>
              <p>Price: ${listing.price}/night</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
