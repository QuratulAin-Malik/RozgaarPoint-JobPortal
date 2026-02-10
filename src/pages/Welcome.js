import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      
      {/* --- Navbar --- */}
      <nav style={styles.navbar}>
        <h1 style={styles.brandTitle}>Rozgaar Point</h1>
        <div>
          <button 
            onClick={() => navigate('/login')} 
            style={styles.loginBtn}
            onMouseOver={(e) => e.target.style.color = '#1e3a8a'}
            onMouseOut={(e) => e.target.style.color = '#1d4ed8'}
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')} 
            style={styles.registerBtn}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Register
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main style={styles.heroSection}>
        <div style={styles.contentWrapper}>
          <span style={styles.badge}>
            For Employers & Organizations
          </span>
          
          <h1 style={styles.heading}>
            Find the perfect <span style={{ color: '#2563eb' }}>Daily Staff</span> <br/> for your needs.
          </h1>
          
          <p style={styles.subText}>
            From drivers and chefs to office staff and construction helpers. 
            Rozgaar Point connects you with verified daily-wage workers instantly. 
            Post a job today and hire with confidence.
          </p>

          {/* Action Buttons */}
          <div style={styles.btnGroup}>
            <button 
              onClick={() => navigate('/register')}
              style={styles.primaryBtn}
              onMouseOver={(e) => {
                 e.target.style.transform = 'scale(1.05)';
                 e.target.style.backgroundColor = '#1d4ed8';
              }}
              onMouseOut={(e) => {
                 e.target.style.transform = 'scale(1)';
                 e.target.style.backgroundColor = '#2563eb';
              }}
            >
              Post a Job - It's Free
            </button>
            <button 
              onClick={() => navigate('/login')}
              style={styles.secondaryBtn}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
            >
              Login to Dashboard
            </button>
          </div>
        </div>

        {/* --- Trust Badges --- */}
        <div style={styles.badgeGrid}>
          <div style={styles.badgeItem}>
            <span style={styles.statNumber}>100%</span>
            <span style={styles.statLabel}>Verified Workers</span>
          </div>
          <div style={styles.badgeItem}>
            <span style={styles.statNumber}>Instant</span>
            <span style={styles.statLabel}>Hiring Process</span>
          </div>
          <div style={styles.badgeItem}>
            <span style={styles.statNumber}>Secure</span>
            <span style={styles.statLabel}>Identity Checks</span>
          </div>
        </div>
      </main>

      {/* --- Footer --- */}
      <footer style={styles.footer}>
        © 2025 Rozgaar Point. All rights reserved.
      </footer>
    </div>
  );
};

// --- INLINE STYLES OBJECT ---
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #eff6ff, #ffffff)', // Light blue to white
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  navbar: {
    width: '100%',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  brandTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1d4ed8', // Blue-700
    letterSpacing: '0.025em',
    margin: 0,
  },
  loginBtn: {
    color: '#1d4ed8',
    fontWeight: '600',
    marginRight: '24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'color 0.2s',
  },
  registerBtn: {
    backgroundColor: '#2563eb', // Blue-600
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '9999px', // Rounded full
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.2s',
  },
  heroSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 16px',
  },
  contentWrapper: {
    maxWidth: '48rem', // max-w-3xl
    animation: 'fadeInUp 0.8s ease-out',
  },
  badge: {
    backgroundColor: '#dbeafe', // Blue-100
    color: '#1e40af', // Blue-800
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '4px 12px',
    borderRadius: '9999px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  heading: {
    fontSize: '3rem', // text-5xl
    fontWeight: '800', // extrabold
    color: '#111827', // gray-900
    marginTop: '24px',
    lineHeight: '1.1',
  },
  subText: {
    marginTop: '24px',
    fontSize: '1.125rem', // text-lg
    color: '#4b5563', // gray-600
    maxWidth: '42rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: '1.6',
  },
  btnGroup: {
    marginTop: '40px',
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '1.125rem',
    padding: '16px 32px',
    borderRadius: '8px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, background-color 0.2s',
  },
  secondaryBtn: {
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '1.125rem',
    padding: '16px 32px',
    borderRadius: '8px',
    fontWeight: 'bold',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.2s',
  },
  badgeGrid: {
    marginTop: '64px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
    color: '#9ca3af', // gray-400
  },
  badgeItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: '1.875rem', // 3xl
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
  },
  statLabel: {
    fontSize: '0.875rem', // sm
  },
  footer: {
    padding: '24px 0',
    textAlign: 'center',
    color: '#6b7280', // gray-500
    fontSize: '0.875rem',
  },
};

export default Welcome;