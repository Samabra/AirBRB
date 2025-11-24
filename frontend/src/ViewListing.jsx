import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { apiRequest } from './api';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  TextField,
  Button,
  Paper,
  Divider
} from '@mui/material';

export default function ViewListing({ token }) {
  const { listingId } = useParams();
  const location = useLocation();

  const searchDates = location.state?.searchDates || null;

  const [listing, setListing] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const [reviewScore, setReviewScore] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    apiRequest(`/listings/${listingId}`, 'GET')
      .then((data) => setListing(data.listing))
      .catch((err) => setError(err.message));

    if (token) {
      apiRequest('/bookings', 'GET', null, token)
        .then((data) => {
          const userBookings = data.bookings.filter(
            (b) => b.listingId.toString() === listingId
          );
          setBookings(userBookings);
        })
        .catch(() => {});
    }
  }, [listingId, token]);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!listing) return <Typography>Loading listing…</Typography>;

  const {
    title = '',
    address = {},
    price = '',
    thumbnail = '',
    metadata = {},
    reviews = [],
  } = listing;

  const addressString = `${address.street || ''}, ${address.city || ''}, ${address.postcode || ''}, ${address.country || ''}`;

  const {
    amenities = [],
    images = [],
    propertyType = '',
    bathrooms = 0,
    bedrooms = 0,
    beds = 0,
  } = metadata;

  const validReviews = reviews.filter(r => r && r.score !== undefined);
  const avgRating =
    validReviews.length > 0
      ? (validReviews.reduce((a, b) => a + b.score, 0) / validReviews.length).toFixed(1)
      : 'No ratings yet';

  let displayPrice = `$${price} per night`;
  if (searchDates?.start && searchDates?.end) {
    const start = new Date(searchDates.start);
    const end = new Date(searchDates.end);
    const nights = (end - start) / (1000 * 60 * 60 * 24);
    displayPrice = `$${price * nights} total stay (${nights} nights)`;
  }

  const acceptedBookings = bookings.filter(b => b.status === 'accepted');

  const handleBooking = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = (end - start) / (1000 * 60 * 60 * 24);

    const bookingData = {
      dateRange: { start: startDate, end: endDate },
      totalPrice: price * nights
    };

    apiRequest(`/bookings/new/${listingId}`, 'POST', bookingData, token)
      .then((res) => {
        setBookingMessage(`Booking confirmed for ${nights} nights! Total: $${bookingData.totalPrice}`);
        setBookings([...bookings, { ...bookingData, id: res.id, status: 'pending' }]);
        setStartDate('');
        setEndDate('');
      })
      .catch((err) => setBookingMessage(err.message));
  };

  const handleSubmitReview = () => {
    if (!reviewScore || !reviewComment) return;
    if (acceptedBookings.length === 0) {
      setReviewMessage('You must have an accepted booking to leave a review.');
      return;
    }

    const bookingId = acceptedBookings[0].id;

    const reviewData = {
      bookingId,
      score: Number(reviewScore),
      comment: reviewComment
    };

    apiRequest('/reviews', 'POST', reviewData, token)
      .then(() => {
        setListing({
          ...listing,
          reviews: [...listing.reviews, reviewData]
        });
        setReviewScore('');
        setReviewComment('');
        setReviewMessage('Review posted!');
      })
      .catch((err) => setReviewMessage(err.message));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom>{title}</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Address</Typography>
        <Typography>{addressString}</Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>Price</Typography>
        <Typography>{displayPrice}</Typography>
      </Paper>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={thumbnail}
              alt={title}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h6">Property Type</Typography>
          <Typography>{propertyType || 'Not specified'}</Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>Details</Typography>
          <Typography>Bedrooms: {bedrooms}</Typography>
          <Typography>Beds: {beds}</Typography>
          <Typography>Bathrooms: {bathrooms}</Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>Amenities</Typography>
          <Typography>{amenities.length ? amenities.join(', ') : 'None'}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="h5" gutterBottom>Reviews (Avg: {avgRating})</Typography>
      {validReviews.length ? validReviews.map((r, i) => (
        <Paper key={i} sx={{ p: 2, mb: 1 }}>
          <Typography>⭐ {r.score}</Typography>
          <Typography fontStyle="italic">{r.comment}</Typography>
        </Paper>
      )) : <Typography>No reviews yet</Typography>}

      {token && (
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Make a Booking</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="contained" onClick={handleBooking}>Book Now</Button>
            </Box>
            {bookingMessage && <Typography color="primary">{bookingMessage}</Typography>}
          </Paper>

          {acceptedBookings.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Leave a Review</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Score (1-5)"
                  type="number"
                  value={reviewScore}
                  onChange={e => setReviewScore(e.target.value)}
                />
                <TextField
                  label="Comment"
                  multiline
                  minRows={3}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                />
                <Button variant="contained" onClick={handleSubmitReview}>Submit Review</Button>
                {reviewMessage && <Typography color="primary">{reviewMessage}</Typography>}
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}
