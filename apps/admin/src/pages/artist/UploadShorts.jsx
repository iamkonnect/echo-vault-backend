import React from 'react';

export default function UploadShorts() {
  return (
    <div>
      <h1 style={{ fontSize: '32px', color: '#8b5cf6', marginBottom: '8px' }}>
        📹 Upload Shorts
      </h1>
      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '32px' }}>
        Add a new short-form video (max 60 seconds)
      </p>
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎥</div>
        <p style={{ fontSize: '16px', marginBottom: '10px' }}>Drag and drop your short video here</p>
        <p style={{ fontSize: '12px', color: '#888' }}>or click to select from your computer</p>
        <p style={{ fontSize: '11px', color: '#666', marginTop: '20px' }}>Maximum duration: 60 seconds | Recommended: 9:16 aspect ratio</p>
      </div>
    </div>
  );
}
