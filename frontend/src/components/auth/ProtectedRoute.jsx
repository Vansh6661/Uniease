import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>Access Denied</h1>
          <p>You must be logged in to access this page.</p>
          <a href="/login" style={styles.link}>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (requiredRoles && !requiredRoles.includes(user?.roleName)) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>Unauthorized</h1>
          <p>You don't have permission to access this page.</p>
          <a href="/" style={styles.link}>
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  link: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
  },
};
