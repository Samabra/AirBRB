import { useState, useEffect } from 'react';
import { apiRequest } from './api.js';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, CardMedia, Grid } from '@mui/material';

export default function HostedListings({ token }) {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');
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
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

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
      .then(() => alert('Listing is now live!'))
      .catch((err) => alert('Failed to publish: ' + err.message));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 6, px: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        My Hosted Listings
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/hosted/create')}>
          Create New Listing
        </Button>
      </Box>

      {listings.length === 0 ? (
        <Typography align="center">You have no hosted listings.</Typography>
      ) : (
        <Grid container spacing={3}>
          {listings.map((listing) => {
            const isYouTube = listing.thumbnail?.includes('youtube.com');
            const thumbnailSrc = isYouTube
              ? `https://www.youtube.com/embed/${new URL(listing.thumbnail).searchParams.get('v')}`
              : listing.thumbnail || 'default_house.jpg';

            return (
              <Grid item xs={12} sm={6} md={4} key={listing.id}>
                <Card sx={{ height: '100%' }}>
                  {isYouTube ? (
                    <Box sx={{ position: 'relative', pt: '56.25%' }}>
                      <iframe
                        src={thumbnailSrc}
                        title={listing.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </Box>
                  ) : (
                    <CardMedia
                      component="img"
                      height="140"
                      image={thumbnailSrc}
                      alt={listing.title}
                    />
                  )}

                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {listing.title}
                    </Typography>
                    <Typography>Type: {listing.metadata?.propertyType || 'N/A'}</Typography>
                    <Typography>Bedrooms: {listing.metadata?.bedrooms || 'N/A'}</Typography>
                    <Typography>Bathrooms: {listing.metadata?.bathrooms || 'N/A'}</Typography>
                    <Typography>Total Reviews: {listing.reviews?.length || 0}</Typography>
                    <Typography>Price: ${listing.price} / night</Typography>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/hosted/edit/${listing.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(listing.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handlePublish(listing.id)}
                      >
                        Go Live
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
