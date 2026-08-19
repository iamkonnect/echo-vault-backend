import React from 'react';

const PageTemplate = ({ title, icon, description, children }) => (
  <div>
    <h1 style={{ fontSize: '32px', color: '#8b5cf6', marginBottom: '8px' }}>
      {icon} {title}
    </h1>
    <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '32px' }}>
      {description}
    </p>
    {children}
  </div>
);

export default function UploadSong() {
  return (
    <PageTemplate
      title="Upload Song"
      icon="🎵"
      description="Add a new song to your catalog"
    >
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📤</div>
        <p style={{ fontSize: '16px', marginBottom: '10px' }}>Drag and drop your audio file here</p>
        <p style={{ fontSize: '12px', color: '#888' }}>or click to select from your computer</p>
        <p style={{ fontSize: '11px', color: '#666', marginTop: '20px' }}>Supported formats: MP3, WAV, FLAC</p>
      </div>
    </PageTemplate>
  );
}
