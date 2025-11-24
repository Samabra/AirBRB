import { useState } from 'react';
import { apiRequest } from './api.js';
import { useNavigate } from 'react-router-dom';

export default function CreateListing({ token }) {
  const [title, setTitle] = useState('');

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('');

  const [propertyType, setPropertyType] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [amenities, setAmenities] = useState('');

  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [jsonFileError, setJsonFileError] = useState('');

  const navigate = useNavigate();

  const validateListingJSON = (obj) => {
    if (!obj || typeof obj !== 'object') return 'JSON is not an object';

    if (typeof obj.title !== 'string' || obj.title.trim() === '')
      return 'Missing/invalid title';

    if (!obj.address || typeof obj.address !== 'object')
      return 'Missing address object';

    const addrFields = ['street', 'city', 'postcode', 'country'];
    for (const f of addrFields) {
      if (typeof obj.address[f] !== 'string') return `Address.${f} missing/invalid`;
    }

    if (typeof obj.price !== 'number' || obj.price < 0)
      return 'Missing/invalid price';

    if (!obj.metadata || typeof obj.metadata !== 'object')
      return 'Missing metadata object';

    if (typeof obj.metadata.propertyType !== 'string')
      return 'Missing/invalid metadata.propertyType';

    if (typeof obj.metadata.bathrooms !== 'number')
      return 'Missing/invalid metadata.bathrooms';

    if (typeof obj.metadata.bedrooms !== 'number')
      return 'Missing/invalid metadata.bedrooms';

    if (!Array.isArray(obj.metadata.amenities))
      return 'metadata.amenities must be an array';

    return null;
  };

  const handleJsonUpload = (file) => {
    setJsonFileError('');
    setMessage('');
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const err = validateListingJSON(parsed);
        if (err) {
          setJsonFileError(err);
          return;
        }
        setTitle(parsed.title);
        setStreet(parsed.address.street);
        setCity(parsed.address.city);
        setPostcode(parsed.address.postcode);
        setCountry(parsed.address.country);
        setPrice(String(parsed.price));

        setThumbnail(parsed.thumbnail || '');
        setYoutubeLink(parsed.youtubeLink || '');

        setPropertyType(parsed.metadata.propertyType);
        setBathrooms(String(parsed.metadata.bathrooms));
        setBedrooms(String(parsed.metadata.bedrooms));
        setAmenities((parsed.metadata.amenities || []).join(', '));

        setMessage('JSON loaded into form successfully!');
      } catch {
        setJsonFileError('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const finalThumbnail =
      thumbnail.trim() !== '' ? thumbnail.trim() : youtubeLink.trim();

    const listing = {
      title,
      address: {
        street,
        city,
        postcode,
        country,
      },
      price: Number(price),
      thumbnail: finalThumbnail,
      metadata: {
        propertyType,
        bathrooms: Number(bathrooms),
        bedrooms: Number(bedrooms),
        amenities: amenities
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a.length > 0),
      },
    };

    if (!token) {
      setError('You must be logged in to create a listing.');
      return;
    }

    apiRequest('/listings/new', 'POST', listing, token)
      .then(() => {
        setMessage('Listing created successfully!');
        setTimeout(() => navigate('/hosted'), 600);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create New Listing</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {jsonFileError && <p style={{ color: 'red' }}>{jsonFileError}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <form onSubmit={onSubmit}>

        <h3>Upload listing JSON (Advanced)</h3>
        <input
          type="file"
          accept=".json"
          onChange={(e) => handleJsonUpload(e.target.files[0])}
        />

        <hr style={{ margin: '16px 0' }} />

        <input
          placeholder="Listing Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <h3>Address</h3>
        <input
          placeholder="Street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          placeholder="Postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
        />
        <input
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        <input
          placeholder="Price Per Night"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Thumbnail (base64 or URL)"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
        />

        <input
          placeholder="YouTube embed URL (optional)"
          value={youtubeLink}
          onChange={(e) => setYoutubeLink(e.target.value)}
        />

        <h3>Metadata</h3>
        <input
          placeholder="Property Type"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
        />

        <input
          placeholder="Number of Bathrooms"
          type="number"
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
        />

        <input
          placeholder="Number of Bedrooms"
          type="number"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
        />

        <input
          placeholder="Amenities (comma separated)"
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
        />

        <button type="submit">Create</button>
      </form>
    </div>
  );
}