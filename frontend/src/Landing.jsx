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

  return (
    <div style={{ padding: 20 }}>
      <h1>Published Listings</h1>
      
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Search by title or city"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div>
          <input
            placeholder="Min beds"
            value={bedMin}
            onChange={(e) => setBedMin(e.target.value)}
          />
          <input
            placeholder="Max beds"
            value={bedMax}
            onChange={(e) => setBedMax(e.target.value)}
          />
        </div>

        <div>
          <input
            placeholder="Min price"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
          <input
            placeholder="Max price"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>

        <select onChange={(e) => setRatingOrder(e.target.value)}>
          <option value="none">Rating: none</option>
          <option value="high">Rating: high → low</option>
          <option value="low">Rating: low → high</option>
        </select>

        <button onClick={refreshListings}>Search</button>
      </div>

      {filtered.map((l) => (
        <div
          key={l.id}
          onClick={() => go(`listing_${l.id}`)}
          style={{
            border: '1px solid #ddd',
            padding: 12,
            marginBottom: 12,
            cursor: 'pointer',
          }}
        >
          <h2>{l.title}</h2>
          <p>{l.address?.city}</p>
          <p>${l.price} / night</p>
          <p>{(l.reviews || []).length} reviews</p>

          {l.thumbnail && (
            <img
              src={l.thumbnail}
              style={{ width: 160, height: 100, objectFit: 'cover' }}
            />
          )}
        </div>
      ))}
    </div> 
  );
}