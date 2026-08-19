import { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import UserDirectory from './pages/UserDirectory';
import ArtistVerification from './pages/ArtistVerification';
import MusicManagement from './pages/MusicManagement';
import VideoManagement from './pages/VideoManagement';
import ShortsManagement from './pages/ShortsManagement';
import AdsManagement from './pages/AdsManagement';
import SliderManagement from './pages/SliderManagement';
import Payouts from './pages/Payouts';
// Artist pages
import ArtistDashboard from './pages/artist/ArtistDashboard';
import UploadSong from './pages/artist/UploadSong';
import MyMusic from './pages/artist/MyMusic';
import UploadVideo from './pages/artist/UploadVideo';
import UploadShorts from './pages/artist/UploadShorts';
import ArtistRevenue from './pages/artist/ArtistRevenue';
import ArtistInsights from './pages/artist/ArtistInsights';
import ArtistLiveInsights from './pages/artist/ArtistLiveInsights';

const API_BASE = 'https://api.echovaultz.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        setUser(response.data);
        setUserType(userTypeStored);
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userType');
        setUserType(null);
        setIsLoggedIn(false);
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

      const loginResponse = await api.post(endpoint, {
        email,
        password,
      });

      if (loginResponse.data.token) {
        localStorage.setItem('adminToken', loginResponse.data.token);
        localStorage.setItem('userType', type);

        const dashboardEndpoint = type === 'admin'
          ? '/admin/dashboard'
          : '/artist/dashboard';

        const dashboardResponse = await api.get(dashboardEndpoint);

        setUser(dashboardResponse.data);
        setEmail('');
        setPassword('');
        setUserType(type);
        setIsLoggedIn(true);
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
    setIsLoggedIn(false);
    setCurrentPage('login');
    setUser(null);
    setEmail('');
    setPassword('');
  };

  // Login Page
  if (currentPage === 'login') {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginWrapper}>
          <div style={styles.loginGrid}>
            {/* Artist Login */}
            <div style={styles.loginBox}>
              <p style={styles.loginLabel}>ECHOVAULT ARTIST</p>
              <h2 style={styles.loginTitle}>ARTIST PORTAL</h2>
              
              <form onSubmit={(e) => handleLogin(e, 'artist')} style={styles.form}>
                {error && <div style={styles.error}>{error}</div>}
                
                <input
                  type="email"
                  placeholder="artist@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
                
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                />
                
                <button type="submit" style={styles.artistButton} disabled={loading}>
                  {loading ? 'Logging in...' : 'ENTER ARTIST VIEW'}
                </button>
              </form>
              {error && <p style={styles.invalidCreds}>Invalid credentials</p>}
            </div>

            {/* Admin Login */}
            <div style={styles.loginBox}>
              <p style={styles.loginLabel}>ECHOVAULT ADMIN</p>
              <h2 style={styles.loginTitle}>ADMIN CENTRAL</h2>
              
              <form onSubmit={(e) => handleLogin(e, 'admin')} style={styles.form}>
                {error && <div style={styles.error}>{error}</div>}
                
                <input
                  type="email"
                  placeholder="akwera@echovaultz.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
                
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                />
                
                <button type="submit" style={styles.adminButton} disabled={loading}>
                  {loading ? 'Logging in...' : 'ACCESS ADMIN DASHBOARD'}
                </button>
              </form>
              {error && <p style={styles.invalidCreds}>Invalid credentials</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Page with Sidebar
  if (isLoggedIn && userType) {
    const isAdmin = userType === 'admin';

    const adminNavigation = [
      { label: 'OVERVIEW', section: 'Dashboard', icon: '📊' },
      { label: 'USER MANAGEMENT', items: [
        { label: 'User Directory', page: 'userDirectory', icon: '👥' },
        { label: 'Artist Verification', page: 'artistVerification', icon: '⭐' },
        { label: 'Add Admin', page: 'addAdmin', icon: '➕' },
      ]},
      { label: 'CONTENT MANAGEMENT', items: [
        { label: 'Music Management', page: 'musicManagement', icon: '🎵' },
        { label: 'Video Management', page: 'videoManagement', icon: '🎬' },
        { label: 'Shorts Management', page: 'shortsManagement', icon: '📹' },
        { label: 'Ads Management', page: 'adsManagement', icon: '📢' },
        { label: 'Slider Management', page: 'sliderManagement', icon: '🎠' },
      ]},
      { label: 'MANAGEMENT', items: [
        { label: 'Artist Verification', page: 'artistVerification', icon: '✓' },
        { label: 'Add Admin', page: 'addAdmin', icon: '🔐' },
        { label: 'Payouts', page: 'payouts', icon: '💰' },
      ]},
    ];

    const artistNavigation = [
      { label: 'OVERVIEW', section: 'artistDashboard', icon: '📊' },
      { label: 'MUSIC', items: [
        { label: 'Upload Song', page: 'uploadSong', icon: '⬆️' },
        { label: 'My Music', page: 'myMusic', icon: '🎵' },
      ]},
      { label: 'CONTENT', items: [
        { label: 'Upload Video', page: 'uploadVideo', icon: '🎬' },
        { label: 'Upload Shorts', page: 'uploadShorts', icon: '📹' },
      ]},
      { label: 'ANALYTICS', items: [
        { label: 'Revenue', page: 'artistRevenue', icon: '💰' },
        { label: 'Insights', page: 'artistInsights', icon: '📈' },
        { label: 'Live Insights', page: 'artistLiveInsights', icon: '📊' },
      ]},
    ];

    const navigation = isAdmin ? adminNavigation : artistNavigation;

    return (
      <div style={styles.dashboardContainer}>
        {/* Sidebar */}
        <div style={{...styles.sidebar, width: sidebarOpen ? '250px' : '0'}}>
          <div style={styles.sidebarHeader}>
            <div style={styles.logo}>{isAdmin ? '🔐' : '🎵'}</div>
            <div style={styles.logoText}>
              <div style={styles.logoTitle}>{isAdmin ? 'ADMIN' : 'ARTIST'}</div>
              <div style={styles.logoSubtitle}>{isAdmin ? 'CENTRAL' : 'PORTAL'}</div>
            </div>
          </div>

          {navigation.map((section, idx) => (
            <div key={idx}>
              {section.items ? (
                <>
                  <div style={styles.sectionLabel}>{section.label}</div>
                  {section.items.map((item) => (
                    <button
                      key={item.page}
                      style={{...styles.navItem, backgroundColor: currentPage === item.page ? 'rgba(16, 185, 129, 0.2)' : 'transparent'}}
                      onClick={() => setCurrentPage(item.page)}
                    >
                      <span style={styles.navIcon}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <div style={styles.sectionLabel}>{section.label}</div>
                  <button
                    style={{...styles.navItem, backgroundColor: currentPage === section.section ? 'rgba(16, 185, 129, 0.2)' : 'transparent'}}
                    onClick={() => setCurrentPage(section.section)}
                  >
                    <span style={styles.navIcon}>{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Top Bar */}
          <div style={styles.topBar}>
            <button style={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <div style={styles.topBarRight}>
              <span style={styles.userInfo}>{isAdmin ? 'Platform Revenue: $0' : 'Your Revenue: $0'}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div style={styles.pageContent}>
            {isAdmin ? (
              <>
                {currentPage === 'dashboard' && <Dashboard user={user} />}
                {currentPage === 'userDirectory' && <UserDirectory />}
                {currentPage === 'artistVerification' && <ArtistVerification />}
                {currentPage === 'musicManagement' && <MusicManagement />}
                {currentPage === 'videoManagement' && <VideoManagement />}
                {currentPage === 'shortsManagement' && <ShortsManagement />}
                {currentPage === 'adsManagement' && <AdsManagement />}
                {currentPage === 'sliderManagement' && <SliderManagement />}
                {currentPage === 'payouts' && <Payouts />}
              </>
            ) : (
              <>
                {currentPage === 'artistDashboard' && <ArtistDashboard user={user} />}
                {currentPage === 'uploadSong' && <UploadSong />}
                {currentPage === 'myMusic' && <MyMusic />}
                {currentPage === 'uploadVideo' && <UploadVideo />}
                {currentPage === 'uploadShorts' && <UploadShorts />}
                {currentPage === 'artistRevenue' && <ArtistRevenue />}
                {currentPage === 'artistInsights' && <ArtistInsights />}
                {currentPage === 'artistLiveInsights' && <ArtistLiveInsights />}
              </>
            )}
          </div>
        </div>
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
    background: 'linear-gradient(135deg, #f5f5f5 50%, #1a1a1a 50%)',
  },
  loginWrapper: {
    width: '100%',
  },
  loginGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    height: '100vh',
  },
  loginBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
  },
  loginLabel: {
    fontSize: '12px',
    color: '#888',
    letterSpacing: '2px',
    marginBottom: '10px',
    textTransform: 'uppercase',
  },
  loginTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '40px',
    letterSpacing: '2px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '300px',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
  },
  artistButton: {
    padding: '12px 16px',
    background: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  adminButton: {
    padding: '12px 16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  invalidCreds: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '10px',
    textAlign: 'center',
  },
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f0c29',
    color: 'white',
  },
  sidebar: {
    background: '#1a1540',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'auto',
    transition: 'width 0.3s ease',
    paddingTop: '20px',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 16px 32px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '20px',
  },
  logo: {
    fontSize: '28px',
    background: '#10b981',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    flex: 1,
  },
  logoTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#10b981',
  },
  logoSubtitle: {
    fontSize: '12px',
    color: '#888',
  },
  sectionLabel: {
    fontSize: '11px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    padding: '0 16px 12px',
    marginTop: '20px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    color: 'white',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  navIcon: {
    fontSize: '16px',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(15, 12, 41, 0.8)',
  },
  sidebarToggle: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userInfo: {
    fontSize: '14px',
    color: '#10b981',
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  pageContent: {
    flex: 1,
    overflow: 'auto',
    padding: '40px',
  },
};

export default App;
