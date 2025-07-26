import React from 'react';

function login() {
    const handleLogin = () => {
        window.location.href = 'http://localhost:5000/login'; // Update later
    };

    return (
    <div style={{
      backgroundColor: '#121212',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      flexDirection: 'column'
    }}>
      <h1 style={{ color: '#1DB954' }}>Music Mood Dashboard</h1>
      <button
        onClick={handleLogin}
        style={{
          marginTop: '20px',
          backgroundColor: '#1DB954',
          color: 'white',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Login with Spotify
      </button>
    </div>
  );
}

export default login;