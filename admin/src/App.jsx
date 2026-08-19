import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = window.location.origin;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const response = await axios.get(`${API_BASE}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboard(response.data);
        setIsLoggedIn(true);
      } catch (err) {
        localStorage.removeItem('adminToken');
        setIsLoggedIn(false);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/login-dashboard`,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        setEmail('');
        setPassword('');
        setIsLoggedIn(true);
        checkAuth();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setDashboard(null);
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <h1 style={styles.title}>EchoVault Admin</h1>
          <p style={styles.subtitle}>Platform Management</p>
          
          <form onSubmit={handleLogin} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Logging in...' : 'Admin Control'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <nav style={styles.navbar}>
        <h1 style={styles.navTitle}>EchoVault Admin Central</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </nav>

      <main style={styles.main}>
        <h2 style={styles.heading}>Platform Overview</h2>
        
        {dashboard && (
          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <p style={styles.metricLabel}>Total Users</p>
              <p style={styles.metricValue}>{dashboard.userCount || 0}</p>
            </div>
            <div style={styles.metricCard}>
              <p style={styles.metricLabel}>Active Artists</p>
              <p style={styles.metricValue}>{dashboard.artistCount || 0}</p>
              </div>
            <div style={styles.metricCard}>
              <p style={styles.metricLabel}>Platform Revenue</p>
              <p style={styles.metricValue}>${(dashboard.revenue || 0).toFixed(2)}</p>
            </div>
            <div style={styles.metricCard}>
              <p style={styles.metricLabel}>Pending Payouts</p>
              <p style={styles.metricValue}>{dashboard.withdrawals?.length || 0}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  loginContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  loginBox: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1.5rem',
    padding: '40px',
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    fontSize: '32px',
    fontWeight: '900',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  button: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    color: '#fca5a5',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    marginBottom: '8px',
  },
  dashboardContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    background: 'rgba(15, 12, 41, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: '24px',
    fontWeight: '900',
  },
  logoutBtn: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  main: {
    flex: 1,
    padding: '40px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '32px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
  },
  metricValue: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#10b981',
  },
};

export default App;
