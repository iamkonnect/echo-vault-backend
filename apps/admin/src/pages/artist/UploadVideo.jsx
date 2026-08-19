import React from 'react';

export default function UploadVideo() {
  return (
    <div>
      <h1 style={{ fontSize: '32px', color: '#8b5cf6', marginBottom: '8px' }}>
        🎬 Upload Video
      </h1>
      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '32px' }}>
        Add a new video to your gallery
      </p>
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📹</div>
        <p style={{ fontSize: '16px', marginBottom: '10px' }}>Drag and drop your video file here</p>
        <p style={{ fontSize: '12px', color: '#888' }}>or click to select from your computer</p>
        <p style={{ fontSize: '11px', color: '#666', marginTop: '20px' }}>Supported formats: MP4, MKV, AVI (Max 500MB)</p>
      </div>
    </div>
  );
}
