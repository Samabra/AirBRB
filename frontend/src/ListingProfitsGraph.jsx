import { useEffect, useState } from "react";
import { apiRequest } from "./api.js";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function ListingProfitsGraph({ token, email }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !email) return;

    setLoading(true);
    setError("");

    apiRequest("/listings", "GET")
      .then((lData) => {
        const ids = (lData.listings || []).map(l => l.id);
        return Promise.all(
          ids.map(id =>
            apiRequest(`/listings/${id}`, "GET")
              .then(meta => ({ id, ...meta.listing }))
              .catch(() => null)
          )
        );
      })
      .then((fullListings) => {
        const myListings = fullListings.filter(Boolean).filter(l => l.owner === email);

        const priceByListing = new Map(
          myListings.map(l => [String(l.id), Number(l.price || 0)])
        );
        return apiRequest("/bookings", "GET", null, token)
          .then((bData) => ({ priceByListing, bookings: bData.bookings || [] }));
      })
      .then(({ priceByListing, bookings }) => {
        const now = new Date();
        const msDay = 1000 * 60 * 60 * 24;

        const points = Array.from({ length: 31 }, (_, i) => ({
          dayAgo: i,
          profit: 0,
        }));
        const windowStart = new Date(now.getTime() - 30 * msDay);

        bookings
          .filter(b => b.status === "accepted")
          .filter(b => priceByListing.has(String(b.listingId)))
          .forEach(b => {
            const price = priceByListing.get(String(b.listingId)) || 0;

            const start = new Date(b.dateRange.start);
            const end = new Date(b.dateRange.end);

            const clampedStart = start < windowStart ? windowStart : start;
            const clampedEnd = end > now ? now : end;
            for (
              let d = new Date(clampedStart);
              d < clampedEnd;
              d = new Date(d.getTime() + msDay)
            ) {
              const dayAgo = Math.floor((now - d) / msDay);
              if (dayAgo >= 0 && dayAgo <= 30) {
                points[dayAgo].profit += price;
              }
            }
          });

        setData(points);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, email]);

  if (!token) return null;
  if (loading) return <p>Loading profit graph...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Profit (last 30 days)</h3>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dayAgo" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="profit" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontSize: 12, color: "#666" }}>
        X = days ago (0 = today), Y = total dollars earned that day.
      </p>
    </div>
  );
}
