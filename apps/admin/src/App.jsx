import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'https://api.echovaultz.com/api';

// Create axios instance with default headers
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [userType, setUserType] = useState(null);  // 'admin' or 'artist' or null
  const [currentPage, setCurrentPage] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    const userTypeStored = localStorage.getItem('userType');
    
    if (token && userTypeStored) {
      try {
        const endpoint = userTypeStored === 'admin' 
          ? '/admin/dashboard'
          : '/artist/dashboard';
        
        const response = await api.get(endpoint);
        
        setDashboard(response.data);
        setUserType(userTypeStored);
        setCurrentPage('dashboard');
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userType');
        setUserType(null);
        setCurrentPage('login');
      }
    }
  };

  const handleLogin = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = type === 'admin'
        ? '/auth/login-dashboard'
        : '/auth/login-artist';

      // Login request (no token needed yet)
      const loginResponse = await api.post(endpoint, {
        email,
        password,
      });

      if (loginResponse.data.token) {
        // Save token to localStorage
        localStorage.setItem('adminToken', loginResponse.data.token);
        localStorage.setItem('userType', type);

        // Now make the dashboard request with the token
        const dashboardEndpoint = type === 'admin'
          ? '/admin/dashboard'
          : '/artist/dashboard';

        const dashboardResponse = await api.get(dashboardEndpoint);

        setDashboard(dashboardResponse.data);
        setEmail('');
        setPassword('');
        setUserType(type);
        setCurrentPage('dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userType');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userType');
    setUserType(null);
    setCurrentPage('login');
    setDashboard(null);
    setUser(null);
    setEmail('');
    setPassword('');
  };

  // Login Page
  if (currentPage === 'login') {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginWrapper}>
          <h1 style={styles.mainTitle}>EchoVault</h1>
          
          <div style={styles.loginGrid}>
            {/* Admin Login */}
            <div style={styles.loginBox}>
              <h2 style={styles.title}>Admin Dashboard</h2>
              <p style={styles.subtitle}>Platform Management</p>
              
              <form onSubmit={(e) => handleLogin(e, 'admin')} style={styles.form}>
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
                
                <button type="submit" style={styles.adminButton} disabled={loading}>
                  {loading ? 'Logging in...' : 'Admin Control'}
                </button>
              </form>
            </div>

            {/* Artist Login */}
            <div style={styles.loginBox}>
              <h2 style={styles.title}>Artist Dashboard</h2>
              <p style={styles.subtitle}>Manage Your Music</p>
              
              <form onSubmit={(e) => handleLogin(e, 'artist')} style={styles.form}>
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
                
                <button type="submit" style={styles.artistButton} disabled={loading}>
                  {loading ? 'Logging in...' : 'Artist Control'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Page
  if (currentPage === 'dashboard' && userType) {
    return (
      <div style={styles.dashboardContainer}>
        <nav style={styles.navbar}>
          <h1 style={styles.navTitle}>
            EchoVault {userType === 'admin' ? 'Admin' : 'Artist'} Central
          </h1>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </nav>

        <main style={styles.main}>
          <h2 style={styles.heading}>
            {userType === 'admin' ? 'Platform Overview' : 'Your Statistics'}
          </h2>
          
          {dashboard && (
            <div style={styles.metricsGrid}>
              {userType === 'admin' ? (
                <>
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
                  <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Total Tracks</p>
                    <p style={styles.metricValue}>{dashboard.trackCount || 0}</p>
                  </div>
                  <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Total Streams</p>
                    <p style={styles.metricValue}>{dashboard.totalStreams || 0}</p>
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>My Tracks</p>
                    <p style={styles.metricValue}>{dashboard.trackCount || 0}</p>
                  </div>
                  <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Total Streams</p>
                    <p style={styles.metricValue}>{dashboard.totalStreams || 0}</p>
                  </div>
                  <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Total Revenue</p>
                    <p style={styles.metricValue}>${(dashboard.totalRevenue || 0).toFixed(2)}</p>
                  </div>
                  <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Followers</p>
                    <p style={styles.metricValue}>{dashboard.followers || 0}</p>
                  </div>
                  <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Pending Payout</p>
                    <p style={styles.metricValue}>${(dashboard.pendingPayout || 0).toFixed(2)}</p>
                  </div>
                  <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Account Status</p>
                    <p style={styles.metricValue}>{dashboard.verified ? 'Verified' : 'Pending'}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {!dashboard && (
            <div style={styles.loading}>Loading dashboard...</div>
          )}

          <div style={styles.sectionsContainer}>
            <h3 style={styles.sectionTitle}>
              {userType === 'admin' ? 'Admin Sections' : 'Artist Sections'}
            </h3>
            
            {userType === 'admin' ? (
              <div style={styles.sectionsGrid}>
                <div style={styles.section}>
                  <h4>User Directory</h4>
                  <p>Manage all users</p>
                </div>
                <div style={styles.section}>
                  <h4>Artist Verification</h4>
                  <p>Verify artist accounts</p>
                </div>
                <div style={styles.section}>
                  <h4>Music Management</h4>
                  <p>Manage platform music</p>
                </div>
                <div style={styles.section}>
                  <h4>Video Management</h4>
                  <p>Manage platform videos</p>
                </div>
                <div style={styles.section}>
                  <h4>Gifts Management</h4>
                  <p>Configure gift system</p>
                </div>
                <div style={styles.section}>
                  <h4>Payouts</h4>
                  <p>Manage artist payouts</p>
                </div>
                <div style={styles.section}>
                  <h4>Reports</h4>
                  <p>View platform reports</p>
                </div>
                <div style={styles.section}>
                  <h4>Ads Management</h4>
                  <p>Manage advertisements</p>
                </div>
              </div>
            ) : (
              <div style={styles.sectionsGrid}>
                <div style={styles.section}>
                  <h4>Upload Music</h4>
                  <p>Add new tracks</p>
                </div>
                <div style={styles.section}>
                  <h4>My Music</h4>
                  <p>Manage your tracks</p>
                </div>
                <div style={styles.section}>
                  <h4>Upload Videos</h4>
                  <p>Add new videos</p>
                </div>
                <div style={styles.section}>
                  <h4>Upload Shorts</h4>
                  <p>Create short videos</p>
                </div>
                <div style={styles.section}>
                  <h4>Revenue</h4>
                  <p>Track earnings</p>
                </div>
                <div style={styles.section}>
                  <h4>Insights</h4>
                  <p>View statistics</p>
                </div>
                <div style={styles.section}>
                  <h4>Live Insights</h4>
                  <p>Real-time analytics</p>
                </div>
                <div style={styles.section}>
                  <h4>Profile</h4>
                  <p>Manage your profile</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return null;
}

const styles = {
  loginContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  loginWrapper: {
    width: '100%',
  },
  mainTitle: {
    fontSize: '48px',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: '60px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  loginGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '40px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  loginBox: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1.5rem',
    padding: '40px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '900',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '24px',
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
  adminButton: {
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
  artistButton: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '60px',
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '10px',
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#10b981',
  },
  sectionsContainer: {
    marginTop: '40px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '24px',
  },
  sectionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  section: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  loading: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '16px',
    marginTop: '20px',
  },
};

export default App;
