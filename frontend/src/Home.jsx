
export default function Home({ go }) {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Welcome to Airbrb!</h1>
    
            <p>Select an option below:</p>
    
            <div style={{ marginTop: '20px' }}>
                <button onClick={() => go('listings')}>
                    View All Listings
                </button>
        
                <button onClick={() => go('mylistings')} style={{ marginLeft: '10px' }}>
                    View My Hosted Listings
                </button>
            </div>
        </div>
    );
}