import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from './api.js';

export default function HostedListings({ token }) {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    apiRequest('/listings', 'GET', null, token)
      .then((data) => {
        setListings(data.listings || []);
      })
      .catch((err) => console.error(err));
  }, [token]);

  const handleDelete = (id) => {
    apiRequest(`/listings/${id}`, 'DELETE', {}, token)
      .then(() => {
        setListings(listings.filter(listing => listing.id !== id));
      })
      .catch(err => console.error(err));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>My Hosted Listings</h1>
      <Link to="/hosted/create">
        <button>Create New Listing</button>
      </Link>
      <div style={{ marginTop: '20px' }}>
        {listings.map(listing => (
          <div key={listing.id} style={{ border: '1px solid gray', marginBottom: '10px', padding: '10px' }}>
            <h2>{listing.title}</h2>
            <p>Type: {listing.address.propertyType}</p>
            <p>Beds: {listing.beds}</p>
            <p>Bathrooms: {listing.bathrooms}</p>
            <img src={listing.thumbnail || '/default_house.jpg'} alt={listing.title} width={150} />
            <p>Rating: {listing.rating} ⭐</p>
            <p>Reviews: {listing.totalReviews}</p>
            <p>Price per night: ${listing.price}</p>
            <Link to={`/hosted/edit/${listing.id}`}>
              <button>Edit</button>
            </Link>
            <button onClick={() => handleDelete(listing.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

