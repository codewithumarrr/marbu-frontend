import React, { useState, useRef, useEffect } from 'react';
import '../styles/components.css';
  //import logo from '../assets/logo.jpg';
import userPlaceholder from '../assets/user-placeholder.png';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleProfileClick = () => {
    setDropdownOpen((open) => !open);
  };

  const handleLogout = () => {
    // Add your logout logic here
    setDropdownOpen(false);
    // For now, just alert
    alert('Logged out!');
  };

  const handleChangePhoto = () => {
    // Add your change photo logic here
    setDropdownOpen(false);
    alert('Change photo clicked!');
  };

  return (
    <div className="header" style={{ padding: '10px', paddingBottom: '30px' }}>
      <div className="upper-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',marginTop:'10px' }}>
        {/* Logo and App Name horizontally aligned */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <img src="https://i.ibb.co/YFHXfVz4/logo.png" alt="MARBU Logo" style={{ width: 130, height: 130, objectFit: 'contain' }} />
          <span style={{ background: 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 'bold', fontSize: '2em', letterSpacing: '2px', fontFamily: 'inherit' }}>
            Diesel Log App
          </span>
        </div>
        {/* User Info on the right */}
        <div className="user-info" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none', position: 'relative' }} ref={profileRef}>
          <div className="user-badge" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
            <div className="user-img">
              <img src="https://picsum.photos/200" alt="User" />
            </div>
            <div className="user-details">
              <div className="user-name">Fareed Khan</div>
              <div className="user-designation">Site Manager</div>
            </div>
          </div>
          {/* Dropdown menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 12,
              background: '#fff',
              borderRadius: 10,
              boxShadow: '0 8px 32px 0 rgba(37,99,235,0.18)',
              minWidth: 180,
              zIndex: 100,
              padding: '8px 0',
              display: 'flex',
              flexDirection: 'column',
              fontWeight: 500,
            }}>
              <button onClick={handleLogout} style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                fontSize: 16,
                padding: '12px 24px',
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
                transition: 'background 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ marginRight: 8 }}>🚪</span>Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;