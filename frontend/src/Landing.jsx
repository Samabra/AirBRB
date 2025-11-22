import { useState, useEffect } from 'react';
import { apiRequest } from './api.js';


export default function LandingPage({ go, token, email }) {
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
      })
  }
}