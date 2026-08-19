import React from 'react';

export default function ArtistDashboard({ user }) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Artist Dashboard</h1>
      <p style={styles.subtitle}>Welcome, Artist</p>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎵</div>
          <p style={styles.statValue}>0</p>
          <p style={styles.statLabel}>TOTAL SONGS</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <p style={styles.statValue}>0</p>
          <p style={styles.statLabel}>TOTAL FOLLOWERS</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>▶️</div>
          <p style={styles.statValue}>0</p>
          <p style={styles.statLabel}>TOTAL STREAMS</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <p style={styles.statValue}>$0</p>
          <p style={styles.statLabel}>TOTAL EARNINGS</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.actionsSection}>
        <h3 style={styles.sectionTitle}>⚡ Quick Actions</h3>
        <div style={styles.actionGrid}>
          <div style={styles.actionCard}>
            <div style={styles.actionIcon}>⬆️</div>
            <p style={styles.actionTitle}>Upload Song</p>
            <p style={styles.actionDesc}>Add new music track</p>
          </div>
          <div style={styles.actionCard}>
            <div style={styles.actionIcon}>🎬</div>
            <p style={styles.actionTitle}>Upload Video</p>
            <p style={styles.actionDesc}>Add new video</p>
          </div>
          <div style={styles.actionCard}>
            <div style={styles.actionIcon}>📹</div>
            <p style={styles.actionTitle}>Upload Shorts</p>
            <p style={styles.actionDesc}>Add short-form content</p>
          </div>
        </div>
      </div>

      {/* Recent Uploads */}
      <div style={styles.recentSection}>
        <h3 style={styles.sectionTitle}>📋 Recent Uploads</h3>
        <p style={styles.noData}>No uploads yet. Start by uploading your first song!</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '32px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#8b5cf6',
    margin: '8px 0',
  },
  statLabel: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  actionsSection: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  actionCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '20px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  actionIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  actionTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  actionDesc: {
    fontSize: '12px',
    color: '#888',
  },
  recentSection: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px',
  },
  noData: {
    fontSize: '14px',
    color: '#888',
  },
};
