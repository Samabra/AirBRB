export default function Landing({ go }) {
    return (
      <main className="landing">
        <header className="landing__header">
          <h1 className="landing__logo">Airbrb</h1>
          <div className="landing__header-actions">
            <button onClick={() => go('login')}>
              Login
            </button>
            <button onClick={() => go('register')}>
              Sign up
            </button>
          </div>
        </header>
  
        <section className="landing__hero">
          <div className="landing__hero-text">
            <h2>Book unique places to stay.</h2>
            <p>
              Browse stays, become a host, and manage bookings – all in your browser.
            </p>
  
            <div className="landing__hero-actions">
              <button onClick={() => go('register')}>
                Get started
              </button>
              <button onClick={() => go('listings')}>
                Explore all listings
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }