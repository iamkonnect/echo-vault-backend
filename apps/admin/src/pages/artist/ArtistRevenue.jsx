import React from 'react';

export default function ArtistRevenue() {
  return (
    <div>
      <h1 style={{ fontSize: '32px', color: '#8b5cf6', marginBottom: '8px' }}>
        💰 Revenue
      </h1>
      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '32px' }}>
        Track your earnings and withdrawals
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Earnings</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6' }}>$0.00</p>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Payout</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#fbbf24' }}>$0.00</p>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Withdrawn</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>$0.00</p>
        </div>
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>Revenue History</h3>
        <p style={{ fontSize: '14px', color: '#888' }}>No revenue data available yet</p>
      </div>
    </div>
  );
}
