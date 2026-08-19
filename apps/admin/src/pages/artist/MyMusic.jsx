import React from 'react';

export default function MyMusic() {
  return (
    <div>
      <h1 style={{ fontSize: '32px', color: '#8b5cf6', marginBottom: '8px' }}>
        🎵 My Music
      </h1>
      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '32px' }}>
        Manage your uploaded songs
      </p>
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', color: '#888' }}>No songs uploaded yet</p>
      </div>
    </div>
  );
}
