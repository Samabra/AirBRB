import { useEffect, useRef, useState } from "react";
import { apiRequest } from "./api.js";
import styles from "./NotificationBell.module.css";

const storageKey = (email) => `airbrb_notifs_seen_${email}`;

export default function NotificationBell({ token, email }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  const prevSnapshotRef = useRef({
    bookingStatusById: new Map(),
    knownBookingIds: new Set(),
    ownedListingIds: new Set(),
  });

  useEffect(() => {
    if (!token || !email) return;

    let alive = true;
    setError("");

    const loadOwnedListingsOnce = () => {
      return apiRequest("/listings", "GET")
        .then((lData) => {
          const ids = (lData.listings || []).map(l => l.id);
          return Promise.all(
            ids.map(id =>
              apiRequest(`/listings/${id}`, "GET")
                .then(meta => meta.listing)
                .catch(() => null)
            )
          );
        })
        .then((full) => {
          const mine = full.filter(Boolean).filter(l => l.owner === email);
          const ownedIds = new Set(mine.map(l => l.id));
          prevSnapshotRef.current.ownedListingIds = ownedIds;
        });
    };

    const poll = () => {
      if (!alive) return;

      apiRequest("/bookings", "GET", null, token)
        .then((bData) => {
          if (!alive) return;
          const bookings = bData.bookings || [];

          const {
            bookingStatusById,
            knownBookingIds,
            ownedListingIds,
          } = prevSnapshotRef.current;

          const freshNotifs = [];

          bookings.forEach((b) => {
            const id = b.id;
            const status = b.status;
            const listingId = b.listingId;
            const guestEmail = b.email;

            if (
              ownedListingIds.has(listingId) &&
              !knownBookingIds.has(id) &&
              status === "pending"
            ) {
              freshNotifs.push({
                id: `host-${id}`,
                ts: Date.now(),
                type: "host",
                text: `New booking request for listing ${listingId}.`,
              });
              knownBookingIds.add(id);
            }

            if (guestEmail === email) {
              const prevStatus = bookingStatusById.get(id);
              if (prevStatus && prevStatus !== status) {
                if (status === "accepted" || status === "declined") {
                  freshNotifs.push({
                    id: `guest-${id}-${status}`,
                    ts: Date.now(),
                    type: "guest",
                    text: `Your booking for listing ${listingId} was ${status}.`,
                  });
                }
              }
              bookingStatusById.set(id, status);
            }
          });

          if (freshNotifs.length > 0) {
            setNotifs((prev) => [...freshNotifs, ...prev].slice(0, 50));
          }
        })
        .catch((err) => {
          if (!alive) return;
          setError(err.message);
        });
    };

    loadOwnedListingsOnce()
      .then(() => apiRequest("/bookings", "GET", null, token))
      .then((bData) => {
        if (!alive) return;

        const bookings = bData.bookings || [];
        const snap = prevSnapshotRef.current;

        bookings.forEach((b) => {
          snap.knownBookingIds.add(b.id);
          if (b.email === email) {
            snap.bookingStatusById.set(b.id, b.status);
          }
        });

        poll();
      });

    const interval = setInterval(poll, 5000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [token, email]);

  useEffect(() => {
    if (!email) return;

    const seenRaw = localStorage.getItem(storageKey(email));
    const seenTs = seenRaw ? Number(seenRaw) : 0;

    const unread = notifs.filter((n) => n.ts > seenTs).length;
    setUnreadCount(unread);
  }, [notifs, email]);

  const markAllSeen = () => {
    if (!email) return;
    localStorage.setItem(storageKey(email), String(Date.now()));
    setUnreadCount(0);
  };

  const toggleOpen = () => {
    setOpen((o) => {
      const next = !o;
      if (next) markAllSeen();
      return next;
    });
  };

  if (!token || !email) return null;

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.bellButton}
        onClick={toggleOpen}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {open && (
        <div
          className={styles.panel}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.panelHeader}>
            <strong>Notifications</strong>

            <div style={{ display: "flex", gap: "8px" }}>
              {/* CLEAR button */}
              <button
                className={styles.clearBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setNotifs([]);
                  markAllSeen();
                }}
              >
                Clear
              </button>

              {/* CLOSE button */}
              <button
                className={styles.clearBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
              >
                Close
              </button>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {notifs.length === 0 ? (
            <div className={styles.empty}>No notifications yet.</div>
          ) : (
            <ul className={styles.list}>
              {notifs.map((n) => (
                <li key={n.id} className={styles.item}>
                  <div className={styles.itemType}>
                    {n.type === "host" ? "Host" : "Guest"}
                  </div>
                  <div>{n.text}</div>
                  <div className={styles.time}>
                    {new Date(n.ts).toLocaleTimeString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}