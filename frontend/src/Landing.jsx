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
  }, [token, email]);

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
  let content = null;


