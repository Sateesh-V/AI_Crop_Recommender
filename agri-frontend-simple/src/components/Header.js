import React from 'react';
import { FaLeaf } from 'react-icons/fa';

const styles = {
  header: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  nav: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  iconWrapper: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    padding: '0.6rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
  },
  logoText: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    background: 'rgba(16, 185, 129, 0.3)',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    backdropFilter: 'blur(10px)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  }
};

// --- MODIFIED: Add onNavWeather and weatherAvailable props ---
const Header = ({ onNavHome, onNavResults, onNavWeather, resultsAvailable, weatherAvailable }) => {
  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <div style={styles.logoContainer}>
          <div style={styles.iconWrapper}>
            <FaLeaf size={24} color="#ffffff" />
          </div>
          <span style={styles.logoText}>AgriPredict</span>
        </div>

        {/* --- MODIFIED: Added Weather Button --- */}
        <div className="nav-buttons">
          <button className="nav-btn" onClick={onNavHome}>
            Home
          </button>
          <button 
            className="nav-btn" 
            onClick={onNavResults} 
            disabled={!resultsAvailable}
          >
            Results
          </button>
          {/* --- NEW BUTTON --- */}
          <button 
            className="nav-btn" 
            onClick={onNavWeather} 
            disabled={!weatherAvailable}
          >
            Weather
          </button>
        </div>
        {/* --- END OF MODIFICATION --- */}
        
        <div style={styles.badge}>AI-Powered</div>
      </nav>
    </header>
  );
};

export default Header;