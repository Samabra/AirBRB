import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from './api.js';


export default function Landing ({ token, email }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [bedMin, setBedMin] = useState('');
  const [bedMax, setBedMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [ratingOrder, setRatingOrder] = useState('none');
  const [priorityIds, setPriorityIds] = useState(new Set());

  const refreshListings = () => {
    setLoading(true);
    setError('');

    apiRequest('/listings', 'GET')
      .then((data) => {
        const ids = data.listings.map((l) => l.id);
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
        if (token && email) {
          apiRequest('/bookings', 'GET', undefined, token)
            .then((bdata) => {
              const ids = (bdata.bookings || [])
                .filter((b) =>
                  b.email === email &&
                  (b.status === 'accepted' || b.status === 'pending')
                )
                .map((b) => b.listingId);

              setPriorityIds(new Set(ids));
            })
            .catch(() => {
              setPriorityIds(new Set());
            })
            .finally(() => setLoading(false));
        } else {
          setPriorityIds(new Set());
          setLoading(false);
        }
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

  if (priceMin !== '' && priceMax !== '') {
    const min = parseInt(priceMin);
    const max = parseInt(priceMax);
    filtered = filtered.filter((l) => {
      const price = l.price || 0;
      return price >= min && price <= max;
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
  if (token && email) {
    const priority = [];
    const others = [];
    filtered.forEach((l) => {
      if (priorityIds.has(l.id)) priority.push(l);
      else others.push(l);
    });
    others.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  
    filtered = [...priority, ...others];
  } else {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
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

function average(reviews) {
  if (!reviews || reviews.length === 0) return 0;
  const t = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return t / reviews.length;
}