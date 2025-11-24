import { useState } from 'react';
import { apiRequest } from './api';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider
} from '@mui/material';

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

  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');

    const finalThumbnail = thumbnail.trim() !== '' ? thumbnail.trim() : youtubeLink.trim();

    const listing = {
      title,
      address: { street, city, postcode, country },
      price: Number(price),
      thumbnail: finalThumbnail,
      metadata: {
        propertyType,
        bathrooms: Number(bathrooms),
        bedrooms: Number(bedrooms),
        amenities: amenities
          .split(',')
          .map(a => a.trim())
          .filter(a => a.length > 0)
      }
    };

    if (token) {
      apiRequest('/listings/new', 'POST', listing, token)
        .then(() => {
          alert('Listing created!');
          navigate('/hosted');
        })
        .catch((err) => setError(err.message));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>Create New Listing</Typography>

      {error && <Typography color="error">{error}</Typography>}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={onSubmit}>
          <TextField
            fullWidth
            label="Listing Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }}>Address</Divider>
          <TextField
            fullWidth
            label="Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Price Per Night"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Thumbnail (URL or base64)"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="YouTube embed URL (optional)"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }}>Metadata</Divider>
          <TextField
            fullWidth
            label="Property Type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Number of Bathrooms"
            type="number"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Number of Bedrooms"
            type="number"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Amenities (comma separated)"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button type="submit" variant="contained" color="primary">Create Listing</Button>
        </form>
      </Paper>
    </Box>
  );
}
