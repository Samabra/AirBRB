import { useState, useEffect } from 'react';
import { apiRequest } from './api.js';


export default function Landing({ go, token, email }) {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [bedMin, setBedMin] = useState('');
  const [bedMax, setBedMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [ratingOrder, setRatingOrder] = useState('none');

  const refreshListings = () => {
    setLoading(true);
    setError('');

    apiRequest('/listings', 'GET')
      .then((data) => {
        const ids = data.listings.map((l) => l.id);

        // 2. GET /listings/:id for each listing
        return Promise.all(
          ids.map((id) =>
            apiRequest(`/listings/${id}`, 'GET').then((meta) => ({
              id,
              ...meta,
            }))
          )
        );
      })
      .then((all) => {
        const onlyPublished = all.filter((l) => l.published === true);
        setListings(onlyPublished);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };
  useEffect(() => {
    refreshListings();
  }, []);

  let filtered = listings.slice();

  if (search.trim() !== '') {
    const term = search.toLowerCase();
    filtered = filtered.filter((l) => {
      const title = l.title.toLowerCase();
      const city = (l.address?.city || '').toLowerCase();
      return title.includes(term) || city.includes(term);
    });
  }
  if (bedMin !== '' && bedMax !== '') {
    filtered = filtered.filter((l) => {
      const beds = l.metadata?.beds || 0;
      return beds >= parseInt(bedMin) && beds <= parseInt(bedMax);
    });
  }
  if (ratingOrder !== 'none') {
    filtered.sort((a, b) => {
      const aRating = average(a.reviews);
      const bRating = average(b.reviews);
      if (ratingOrder === 'high') return bRating - aRating;
      if (ratingOrder === 'low') return aRating - bRating;
      return 0;
    });
  }

  if (loading) return <p>Loading listings...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (filtered.length === 0) {
    return (
      <div>
        <h2>No listings match your filters.</h2>
        <button onClick={refreshListings}>Reset</button>
      </div>
    );
  }
  if (loading) return <p>Loading listings...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (filtered.length === 0) {
    return (
      <div>
        <h2>No listings match your filters.</h2>
        <button onClick={refreshListings}>Reset</button>
      </div>
    );
  }




}