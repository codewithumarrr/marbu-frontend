import React from "react";
import "../styles/components.css";
import logo from "../assets/logo.jpg";
import userPlaceholder from "../assets/user-placeholder.png";

function Header() {
  return (
    <div className="header">
      <div className="upper-header">
        <div className="logo">
          <img src={logo} alt="MARBU Logo" />
        </div>
        <h1>🛢️ Diesel Management Module</h1>
      </div>
      <div className="user-info">
        <div className="user-badge">
          <div className="user-img">
            <img src={userPlaceholder} alt="User" />
          </div>
          <div className="user-details">
            <div className="user-name">Fareed Khan</div>
            <div className="user-designation">Site Manager</div>
          </div>
        </div>
        <div style={{ color: '#666' }}>
          <b>Last Login:</b> 2025-06-17 09:30 AM
        </div>
      </div>
    </div>
  );
}

export default Header;
