import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const HomePage = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.navLeft}>
            <span style={styles.logo}>📚</span>
            <h1 style={styles.navTitle}>Bennett University - UniEase</h1>
          </div>
          <div style={styles.navRight}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={styles.userDetails}>
                <p style={styles.userName}>Welcome, {user?.name}</p>
                <p style={styles.userRole}>{user?.roleName}</p>
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Welcome Header */}
        <div style={styles.welcomeSection}>
          <h2 style={styles.welcomeTitle}>Welcome to UniEase v2.0</h2>
          <p style={styles.welcomeSubtitle}>
            Bennett University's Enhanced Complaint Management System
          </p>
        </div>

        {/* Status Grid */}
        <div style={styles.statusGrid}>
          <div style={styles.statusCard}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>✅</span>
              <h3>Backend</h3>
            </div>
            <p style={styles.cardDescription}>Authentication & Database Setup</p>
            <span style={styles.badge}>Phase 1: Complete</span>
          </div>

          <div style={styles.statusCard}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>⚙️</span>
              <h3>Frontend</h3>
            </div>
            <p style={styles.cardDescription}>Component Architecture Ready</p>
            <span style={styles.badge}>Phase 2: In Progress</span>
          </div>

          <div style={styles.statusCard}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>📝</span>
              <h3>Complaints</h3>
            </div>
            <p style={styles.cardDescription}>Full Lifecycle Management</p>
            <span style={styles.badge}>Phase 2: Coming Soon</span>
          </div>

          <div style={styles.statusCard}>
            <div style={styles.cardHeader}>
              <span style={styles.cardIcon}>💬</span>
              <h3>Real-time Chat</h3>
            </div>
            <p style={styles.cardDescription}>Socket.IO Chat System</p>
            <span style={styles.badge}>Phase 3: Planned</span>
          </div>
        </div>

        {/* User Profile Card */}
        <div style={styles.profileSection}>
          <div style={styles.profileCard}>
            <h3 style={styles.profileTitle}>Your Profile</h3>
            <div style={styles.profileInfo}>
              <div style={styles.profileRow}>
                <span style={styles.profileLabel}>📧 Email:</span>
                <span style={styles.profileValue}>{user?.email}</span>
              </div>
              <div style={styles.profileRow}>
                <span style={styles.profileLabel}>👤 Role:</span>
                <span style={styles.profileValue}>{user?.roleName || 'Student'}</span>
              </div>
              <div style={styles.profileRow}>
                <span style={styles.profileLabel}>🆔 User ID:</span>
                <span style={styles.profileValue} style={{ fontSize: '11px' }}>
                  {user?.id?.substring(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <h3 style={styles.actionsTitle}>Quick Actions</h3>
          <div style={styles.actionsGrid}>
            <button style={styles.actionBtn} onClick={() => alert('Filing complaints - Coming in Phase 2!')}>
              📝 File New Complaint
            </button>
            <button style={styles.actionBtn} onClick={() => alert('View complaints - Coming in Phase 2!')}>
              📋 View My Complaints
            </button>
            <button style={styles.actionBtn} onClick={() => alert('Chat system - Coming in Phase 3!')}>
              💬 Live Chat Support
            </button>
            <button style={styles.actionBtn} onClick={() => alert('Analytics - Coming in Phase 4!')}>
              📊 View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 Bennett University. UniEase Complaint Management System v2.0</p>
        <p style={styles.footerLinks}>
          <a href="#" style={styles.footerLink}>Support</a>
          {' | '}
          <a href="#" style={styles.footerLink}>Documentation</a>
          {' | '}
          <a href="#" style={styles.footerLink}>Contact</a>
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

  // Navbar
  navbar: {
    backgroundColor: '#1a3a52',
    color: 'white',
    padding: '0',
    boxShadow: '0 4px 12px rgba(26, 58, 82, 0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },

  navContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },

  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  logo: {
    fontSize: '32px',
  },

  navTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },

  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },

  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#a0d8ff',
    color: '#1a3a52',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    border: '2px solid white',
  },

  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },

  userName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
  },

  userRole: {
    margin: 0,
    fontSize: '12px',
    opacity: 0.8,
  },

  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },

  // Main Content
  mainContent: {
    flex: 1,
    padding: '40px 32px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },

  welcomeSection: {
    textAlign: 'center',
    marginBottom: '48px',
  },

  welcomeTitle: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a3a52',
  },

  welcomeSubtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#666',
  },

  // Status Grid
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  },

  statusCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(26, 58, 82, 0.1)',
    border: '2px solid #e8f0fc',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },

  cardIcon: {
    fontSize: '28px',
  },

  cardDescription: {
    margin: '8px 0',
    fontSize: '14px',
    color: '#666',
  },

  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '20px',
    marginTop: '12px',
  },

  // Profile Section
  profileSection: {
    marginBottom: '48px',
  },

  profileCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '28px',
    boxShadow: '0 2px 8px rgba(26, 58, 82, 0.1)',
    maxWidth: '500px',
  },

  profileTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a3a52',
  },

  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  profileRow: {
    display: 'flex',
    gap: '12px',
  },

  profileLabel: {
    fontWeight: '600',
    color: '#1a3a52',
    minWidth: '80px',
  },

  profileValue: {
    color: '#666',
  },

  // Quick Actions
  quickActions: {
    marginBottom: '48px',
  },

  actionsTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a3a52',
  },

  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },

  actionBtn: {
    padding: '16px',
    backgroundColor: '#2c5aa0',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.2s',
  },

  // Footer
  footer: {
    backgroundColor: '#1a3a52',
    color: 'white',
    textAlign: 'center',
    padding: '28px 32px',
    marginTop: 'auto',
  },

  footerLinks: {
    fontSize: '13px',
    margin: '8px 0 0 0',
  },

  footerLink: {
    color: '#a0d8ff',
    textDecoration: 'none',
    transition: 'color 0.3s',
  },
};
