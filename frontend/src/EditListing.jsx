import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from './api.js';

export default function EditListing({ token }) {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [amenities, setAmenities] = useState('');
  const [images, setImages] = useState([]);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiRequest(`/listings/${listingId}`, 'GET', null, token)
      .then((data) => {
        const listing = data.listing;

        setTitle(listing.title || '');
        setStreet(listing.address?.street || '');
        setCity(listing.address?.city || '');
        setPostcode(listing.address?.postcode || '');
        setCountry(listing.address?.country || '');

        setPrice(listing.price ?? '');
        setThumbnail(listing.thumbnail || '');

        setPropertyType(listing.metadata?.propertyType || '');
        setBathrooms(listing.metadata?.bathrooms ?? '');
        setBedrooms(listing.metadata?.bedrooms ?? '');
        setAmenities((listing.metadata?.amenities || []).join(', '));
        setImages(listing.metadata?.images || []);
      })
      .catch((err) => setError(err.message));
  }, [listingId, token]);

  const onSave = () => {
    setError('');
    setMessage('');

    const updatedListing = {
      title,
      address: { street, city, postcode, country },
      price: Number(price),
      thumbnail,
      metadata: {
        propertyType,
        bathrooms: Number(bathrooms),
        bedrooms: Number(bedrooms),
        amenities: amenities
          .split(',')
          .map(a => a.trim())
          .filter(a => a.length > 0),
        images
      }
    };

    apiRequest(`/listings/${listingId}`, 'PUT', updatedListing, token)
      .then(() => {
        setMessage('Listing updated successfully.');
        setTimeout(() => navigate('/hosted'), 600);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Edit Listing</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />

      <h3>Address</h3>
      <input placeholder="Street" value={street} onChange={e => setStreet(e.target.value)} />
      <input placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
      <input placeholder="Postcode" value={postcode} onChange={e => setPostcode(e.target.value)} />
      <input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />

      <input
        placeholder="Price per night"
        type="number"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />

      <input placeholder="Thumbnail" value={thumbnail} onChange={e => setThumbnail(e.target.value)} />

      <input
        placeholder="Property Type"
        value={propertyType}
        onChange={e => setPropertyType(e.target.value)}
      />

      <input
        placeholder="Bathrooms"
        type="number"
        value={bathrooms}
        onChange={e => setBathrooms(e.target.value)}
      />

      <input
        placeholder="Bedrooms"
        type="number"
        value={bedrooms}
        onChange={e => setBedrooms(e.target.value)}
      />

      <input
        placeholder="Amenities (comma separated)"
        value={amenities}
        onChange={e => setAmenities(e.target.value)}
      />

      <input
        placeholder="Images (comma separated URLs)"
        value={images.join(', ')}
        onChange={e => setImages(e.target.value.split(',').map(i => i.trim()))}
      />

      <button onClick={onSave}>Save</button>
    </div>
  );
}