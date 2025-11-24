import React from 'react';

const styles = {
  footer: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    marginTop: '4rem',
    boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.1)',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    textAlign: 'center',
  },
  text: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.95rem',
    fontWeight: '500',
    margin: 0,
  },
  highlight: {
    color: '#ffffff',
    fontWeight: '600',
  }
};

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p style={styles.text}>
          &copy; {new Date().getFullYear()} <span style={styles.highlight}>AgriPredict</span>. 
          Empowering farmers with intelligent crop recommendations.
        </p>
      </div>
    </footer>
  );
};

export default Footer;