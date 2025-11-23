import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { apiRequest } from './api.js';

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
      .then((data) => {
        setListing(data.listing);
      })
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

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!listing) return <p>Loading listing…</p>;

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

  let displayPrice = `\$${price} per night`;
  if (searchDates && searchDates.start && searchDates.end) {
    const start = new Date(searchDates.start);
    const end = new Date(searchDates.end);
    const nights = (end - start) / (1000 * 60 * 60 * 24);
    displayPrice = `\$${price * nights} total stay (${nights} nights)`;
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
      .catch((err) => {
        setBookingMessage(err.message);
      });
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
    <div style={{ padding: '20px' }}>
      <h1>{title}</h1>

      <h3>Address</h3>
      <p>{addressString}</p>

      <h3>Price</h3>
      <p>{displayPrice}</p>

      <h3>Thumbnail</h3>
      <img src={thumbnail} alt="thumbnail" style={{ width: '200px', borderRadius: '8px' }} />

      <h3>Images</h3>
      {images.length > 0 ? images.map((img, idx) => (
        <img key={idx} src={img} alt="property" style={{ width: '200px', marginRight: '10px', borderRadius: '8px' }} />
      )) : <p>No images</p>}

      <h3>Property Type</h3>
      <p>{propertyType || 'Not specified'}</p>

      <h3>Details</h3>
      <ul>
        <li>Bedrooms: {bedrooms}</li>
        <li>Beds: {beds}</li>
        <li>Bathrooms: {bathrooms}</li>
      </ul>

      <h3>Amenities</h3>
      <p>{amenities.length > 0 ? amenities.join(', ') : 'None'}</p>

      <h3>Reviews</h3>
      <p>Average Rating: {avgRating}</p>
      {validReviews.length > 0 ? validReviews.map((r, i) => (
        <div key={i} style={{ marginBottom: '10px' }}>
          ⭐ {r.score}<br />
          <i>{r.comment}</i>
        </div>
      )) : <p>No reviews yet</p>}

      {token && (
        <>
          <h3>Make a Booking</h3>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ marginLeft: '10px' }} />
          <button onClick={handleBooking} style={{ marginLeft: '10px' }}>Book Now</button>
          {bookingMessage && <p>{bookingMessage}</p>}

          <h3>Your Booking Status</h3>
          {bookings.length === 0 ? <p>You haven't made a booking for this listing.</p> : bookings.map(b => (
            <p key={b.id}>Booking #{b.id}: <strong>{b.status}</strong></p>
          ))}

          {acceptedBookings.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Leave a Review</h3>
              <input
                type="number"
                placeholder="Score (1-5)"
                value={reviewScore}
                onChange={(e) => setReviewScore(e.target.value)}
              />
              <br />
              <textarea
                placeholder="Comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
              <br />
              <button onClick={handleSubmitReview}>Submit Review</button>
              {reviewMessage && <p>{reviewMessage}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
