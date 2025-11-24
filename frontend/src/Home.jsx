import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from './api';
import { Button, Typography, Box, Card, CardContent, CardMedia, Grid } from '@mui/material';

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
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 2 }}>
        Welcome to Airbrb!
      </Typography>
      <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 4 }}>
        Browse listings or manage your hosted properties.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 6 }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/hosted')} sx={{ px: 4, py: 1.5 }}>
          View My Hosted Listings
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/home')} sx={{ px: 4, py: 1.5 }}>
          Back to Home
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        All Listings
      </Typography>

      {listings.length === 0 ? (
        <Typography sx={{ textAlign: 'center' }}>No listings found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {listings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={listing.id}>
              <Card
                onClick={() => navigate(`/listing/${listing.id}`)}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 6,
                  },
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={listing.thumbnail || 'https://via.placeholder.com/300x180?text=No+Image'}
                  alt={listing.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {listing.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Price: ${listing.price}/night
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
