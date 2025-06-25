import React from 'react';
import '../styles/components.css';
  //import logo from '../assets/logo.jpg';
import userPlaceholder from '../assets/user-placeholder.png';

const Header = () => {
  return (
    <div className="header" style={{ padding: '10px' }}>
      <div className="upper-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo and App Name horizontally aligned */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <img src="https://i.ibb.co/YFHXfVz4/logo.png" alt="MARBU Logo" style={{ width: 130, height: 130, objectFit: 'contain' }} />
          <span style={{ background: 'linear-gradient(45deg, #25b86f, #015998)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 'bold', fontSize: '2em', letterSpacing: '2px', fontFamily: 'inherit' }}>
            Diesel Log App
          </span>
        </div>
        {/* User Info on the right */}
        <div className="user-info" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <div className="user-badge">
            <div className="user-img">
              <img src="https://picsum.photos/200" alt="User" />
            </div>
            <div className="user-details">
              <div className="user-name">Fareed Khan</div>
              <div className="user-designation">Site Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;