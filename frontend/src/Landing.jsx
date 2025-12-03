import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <main className="landing">
      <header className="landing__header">
        <h1 className="landing__logo">Airbrb</h1>
        <div className="landing__header-actions">
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/register">
            <button>Sign up</button>
          </Link>
        </div>
      </header>

      <section className="landing__hero">
        <div className="landing__hero-text">
          <h2>Book unique places to stay.</h2>
          <p>
            Browse stays, become a host, and manage bookings – all in your browser.
          </p>

          <div className="landing__hero-actions">
            <Link to="/register">
              <button>Get started</button>
            </Link>
            <Link to="/listings">
              <button>Explore all listings</button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
