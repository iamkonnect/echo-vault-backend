import React from 'react';

export default function Dashboard({ user }) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Platform Control</h1>
      <p style={styles.subtitle}>Welcome, Super Admin - Super Admin</p>

      {/* Metrics Cards */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>👥</div>
          <p style={styles.metricValue}>0%</p>
          <p style={styles.metricLabel}>TOTAL USERS</p>
          <p style={styles.metricNumber}>0</p>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>⚡</div>
          <p style={styles.metricValue}>0%</p>
          <p style={styles.metricLabel}>ACTIVE ARTISTS</p>
          <p style={styles.metricNumber}>0</p>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>🎯</div>
          <p style={styles.metricValue}>0</p>
          <p style={styles.metricLabel}>PENDING PAYOUTS</p>
          <p style={styles.metricNumber}></p>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>📊</div>
          <p style={styles.metricValue}>0</p>
          <p style={styles.metricLabel}>ACTIVE REPORTS</p>
          <p style={styles.metricNumber}></p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.actionsSection}>
        <h3 style={styles.sectionTitle}>⚡ Quick Actions</h3>
        <div style={styles.actionGrid}>
          <div style={styles.actionCard}>
            <div style={styles.actionIcon}>🔍</div>
            <p style={styles.actionTitle}>User Directory</p>
            <p style={styles.actionDesc}>View all accounts</p>
          </div>
          <div style={styles.actionCard}>
            <div style={styles.actionIcon}>➕</div>
            <p style={styles.actionTitle}>Add Admin</p>
            <p style={styles.actionDesc}>Grant admin access</p>
          </div>
          <div style={styles.actionCard}>
            <div style={styles.actionIcon}>💳</div>
            <p style={styles.actionTitle}>Review Payouts</p>
            <p style={styles.actionDesc}>Approve withdrawals</p>
          </div>
        </div>
      </div>

      {/* Recent Withdrawals */}
      <div style={styles.withdrawalsSection}>
        <h3 style={styles.sectionTitle}>📋 Recent Withdrawals</h3>
        <p style={styles.noData}>No pending withdrawals.</p>
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
    color: '#10b981',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '32px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  metricIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  metricValue: {
    fontSize: '18px',
    color: '#10b981',
    fontWeight: 'bold',
    margin: '8px 0',
  },
  metricLabel: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '8px 0',
  },
  metricNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
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
  withdrawalsSection: {
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
