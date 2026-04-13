import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Validation
    if (!email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (password.length < 4) {
      setLocalError('Password must be at least 4 characters');
      return;
    }

    // Attempt login
    const result = await login(email, password);

    if (result.success) {
      // Redirect to home page on successful login
      window.location.href = '/';
    } else {
      setLocalError(result.error || 'Login failed');
    }
  };

  const displayError = localError || error;

  return (
    <div style={styles.container}>
      {/* Bennett University Top Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerContent}>
          <h1 style={styles.universityName}>Bennett University</h1>
          <p style={styles.bannerSubtitle}>Student Portal</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.logoCircle}>
              <span style={styles.logo}>📚</span>
            </div>
            <h2 style={styles.title}>UniEase Complaint System</h2>
            <p style={styles.subtitle}>v2.0 - Enhanced Management Platform</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {displayError && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>⚠️</span>
                <div>
                  <strong>Error:</strong> {displayError}
                </div>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Bennett Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@bennett.edu.in"
                style={styles.input}
                disabled={isLoading}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={styles.input}
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
              disabled={isLoading}
            >
              {isLoading ? '🔄 Logging in...' : '✓ Login'}
            </button>

            <div style={styles.infoSection}>
              <p style={styles.infoText}>
                <strong>Demo Mode:</strong> Any Bennett email + 4+ character password
              </p>
              <p style={styles.subtext}>
                First time? Auto-registration enabled on first login.
              </p>
            </div>
          </form>
        </div>

        {/* Features Section */}
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>📝</span>
            <h3>Easy Filing</h3>
            <p>File complaints quickly and track status</p>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>⚡</span>
            <h3>Real-time Updates</h3>
            <p>Instant notifications on complaint changes</p>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>💬</span>
            <h3>Live Chat Support</h3>
            <p>Direct communication with admin staff</p>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>📊</span>
            <h3>Analytics</h3>
            <p>Track resolution times and trends</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 Bennett University. All rights reserved.</p>
        <p style={styles.footerLinks}>
          <a href="#" style={styles.link}>Privacy Policy</a>
          {' | '}
          <a href="#" style={styles.link}>Contact Support</a>
        </p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif",
  },

  // Top Banner
  banner: {
    background: 'linear-gradient(135deg, #1a3a52 0%, #2c5aa0 50%, #1a3a52 100%)',
    color: 'white',
    padding: '30px 20px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(26, 58, 82, 0.3)',
  },
  bannerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  universityName: {
    marginTop: 0,
    marginBottom: '8px',
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  bannerSubtitle: {
    margin: 0,
    fontSize: '16px',
    opacity: 0.9,
    fontWeight: '300',
  },

  // Main Content
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },

  // Login Card
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(26, 58, 82, 0.15)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    marginBottom: '40px',
  },

  cardHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },

  logoCircle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#e8f0fc',
    marginBottom: '16px',
    border: '3px solid #2c5aa0',
  },

  logo: {
    fontSize: '36px',
  },

  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a3a52',
  },

  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#666',
    fontWeight: '400',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a3a52',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  input: {
    padding: '12px 14px',
    fontSize: '14px',
    border: '1.5px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    backgroundColor: '#fafbfc',
  },

  button: {
    padding: '14px 16px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#2c5aa0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '8px',
  },

  errorBox: {
    padding: '14px 16px',
    backgroundColor: '#fee2e2',
    border: '1.5px solid #fca5a5',
    borderLeft: '4px solid #dc2626',
    color: '#991b1b',
    fontSize: '14px',
    borderRadius: '6px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },

  errorIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },

  infoSection: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bfdbfe',
    padding: '16px',
    borderRadius: '6px',
    textAlign: 'center',
  },

  infoText: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    color: '#1e40af',
  },

  subtext: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
  },

  // Features Grid
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    width: '100%',
    maxWidth: '1000px',
    marginTop: '20px',
  },

  featureCard: {
    backgroundColor: 'white',
    padding: '24px 20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(26, 58, 82, 0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },

  featureIcon: {
    fontSize: '32px',
    marginBottom: '12px',
    display: 'block',
  },

  // Footer
  footer: {
    backgroundColor: '#1a3a52',
    color: 'white',
    textAlign: 'center',
    padding: '30px 20px',
    marginTop: 'auto',
  },

  footerLinks: {
    fontSize: '13px',
    margin: '8px 0 0 0',
  },

  link: {
    color: '#a0d8ff',
    textDecoration: 'none',
    transition: 'color 0.3s',
  },
};
