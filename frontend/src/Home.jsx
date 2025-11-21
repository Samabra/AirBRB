import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to Airbrb!</h1>
      <p>Select an option below:</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/hosted">
          <button>View My Hosted Listings</button>
        </Link>
        <Link to="/home">
          <button style={{ marginLeft: '10px' }}>Back to Home</button>
        </Link>
      </div>
    </div>
  );
}
