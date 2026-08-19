import React from 'react';
const PageTemplate = ({ title, description }) => (
  <div>
    <h1 style={{ fontSize: '32px', color: '#10b981', marginBottom: '20px' }}>{title}</h1>
    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '8px' }}>
      <p>{description}</p>
    </div>
  </div>
);

export const ArtistVerification = () => <PageTemplate title="Artist Verification" description="Verify and manage artist accounts" />;
export const MusicManagement = () => <PageTemplate title="Music Management" description="Manage platform music tracks" />;
export const VideoManagement = () => <PageTemplate title="Video Management" description="Manage platform videos" />;
export const ShortsManagement = () => <PageTemplate title="Shorts Management" description="Manage short-form videos" />;
export const AdsManagement = () => <PageTemplate title="Ads Management" description="Configure advertisements" />;
export const SliderManagement = () => <PageTemplate title="Slider Management" description="Manage homepage sliders" />;
export const ArtistPortal = () => <PageTemplate title="Artist Portal" description="Artist dashboard and management" />;
export const Payouts = () => <PageTemplate title="Payouts" description="Manage artist payouts and withdrawals" />;
