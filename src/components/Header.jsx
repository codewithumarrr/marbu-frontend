import React, { useState, useRef, useEffect } from 'react';
import '../styles/components.css';
import { useUserStore } from '../store/userStore.js';
import { logout, getProfile } from '../services/authService.js';
import { FiLogOut } from "react-icons/fi";
import userPlaceholder from "../assets/user-placeholder.png";

const userRoles = {
  "diesel-manager": "Diesel Manager",
  "admin": "Admin",
  "driver": "Driver",
  "site-incharge": "Site Incharge",
  "operator": "Operator",
}

const Header = () => {
  const { user, profile: storeProfile } = useUserStore();
  const [profile, setProfile] = useState(storeProfile || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    getProfile().then(res => {
      setProfile(res?.data?.user || null);
    });
  }, []);

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

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logout();
      // Redirect will be handled by the auth service
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      // Force redirect even if logout fails
      window.location.href = '/login';
    }
  };

  // Get display name for user
  const getDisplayName = () => {
    const currentUser = profile || user;
    return currentUser?.name || 'Fareed Khan'; // Fallback to hardcoded name
  };

  // Get user role
  const getUserRole = () => {
    const currentUser = profile || user;
    return currentUser?.role || 'Site Manager'; // Fallback to hardcoded role
  };

  return (
    <div className="header" style={{ padding: '10px' }}>
      <div className="upper-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
        {/* Logo and App Name horizontally aligned */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <img src="https://i.ibb.co/YFHXfVz4/logo.png" alt="MARBU Logo" style={{ width: 150, objectFit: 'contain' }} />
            <span style={{ background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 'bold', fontSize: '2em', fontFamily: 'inherit' }}>
            PMV
          </span>
        </div>
        {/* User Info on the right */}
        <div className="user-info" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none', position: 'relative' }} ref={profileRef}>
          <div className="user-badge" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
            <div className="user-img">
              <img
                src={profile?.user_picture || userPlaceholder}
                alt="User"
                onError={e => { e.target.onerror = null; e.target.src = userPlaceholder; }}
              />
            </div>
            <div className="user-details">
              <div className="user-name">{getDisplayName()}</div>
              <div className="user-designation">{userRoles[getUserRole()]}</div>
            </div>
          </div>
          {/* Dropdown menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '50%',
              transform: 'translateX(50%)',
              marginTop: 5,
              background: 'rgb(255, 255, 255)',
              borderRadius: 10,
              boxShadow: 'rgba(37, 99, 235, 0.18) 0px 8px 32px 0px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              fontWeight: 500,
            }}>
              <button onClick={handleLogout} style={{
                background: 'none',
                border: 'none',
                color: 'rgb(220, 38, 38)',
                fontSize: 14,
                padding: '12px 24px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                justifyContent: 'center',
                flexGrow: 0,
              }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ marginRight: 8, display: 'inline-flex', alignItems: 'center' }}>
                  <FiLogOut size={20} />
                </span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
