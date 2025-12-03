import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from './api.js';
import { Box, Typography, TextField, Button } from '@mui/material';

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
    const updatedListing = {
      title,
      address: { street, city, postcode, country },
      price: Number(price),
      thumbnail,
      metadata: {
        propertyType,
        bathrooms: Number(bathrooms),
        bedrooms: Number(bedrooms),
        amenities: amenities.split(',').map(a => a.trim()).filter(a => a.length > 0),
        images
      }
    };

    apiRequest(`/listings/${listingId}`, 'PUT', updatedListing, token)
      .then(() => {
        alert('Listing updated!');
        navigate('/hosted');
      })
      .catch((err) => setError(err.message));
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 6,
        p: 4,
        border: '1px solid #ccc',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h4" gutterBottom align="center">
        Edit Listing
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Typography variant="h6" gutterBottom>
        Address
      </Typography>

      <TextField
        label="Street"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={street}
        onChange={(e) => setStreet(e.target.value)}
      />
      <TextField
        label="City"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <TextField
        label="Postcode"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={postcode}
        onChange={(e) => setPostcode(e.target.value)}
      />
      <TextField
        label="Country"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />

      <TextField
        label="Price per night"
        type="number"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <TextField
        label="Thumbnail URL/Base64"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={thumbnail}
        onChange={(e) => setThumbnail(e.target.value)}
      />

      <TextField
        label="Property Type"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
      />

      <TextField
        label="Bathrooms"
        type="number"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={bathrooms}
        onChange={(e) => setBathrooms(e.target.value)}
      />
      <TextField
        label="Bedrooms"
        type="number"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={bedrooms}
        onChange={(e) => setBedrooms(e.target.value)}
      />

      <TextField
        label="Amenities (comma separated)"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={amenities}
        onChange={(e) => setAmenities(e.target.value)}
      />

      <TextField
        label="Images (comma separated URLs)"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={images.join(', ')}
        onChange={(e) => setImages(e.target.value.split(',').map(i => i.trim()))}
      />

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="primary" onClick={onSave}>
          Save
        </Button>
      </Box>
    </Box>
  );
}
