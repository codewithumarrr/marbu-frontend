import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [userError, setUserError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    let valid = true;
    if (!user.trim()) {
      setUserError('Username is required');
      valid = false;
    } else {
      setUserError('');
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }
    if (!valid) return;
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/');
  };

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(120deg, #25b86f 0%, #015998 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        padding: '24px 16px',
        width: 340,
        maxWidth: '90vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🛢️</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'rgb(1,89,152)', marginBottom: 2 }}>Welcome</div>
        <div style={{ color: '#666', marginBottom: 20, fontSize: 15 }}>Welcome to MARBU</div>
        <form style={{ width: '100%' }} onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600, color: '#888', fontSize: 13, marginBottom: 4, display: 'block' }}>Employee ID</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Enter your Employee ID"
                value={user}
                onChange={e => setUser(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#aaa' }}>✉️</span>
            </div>
            {submitted && userError && (
              <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{userError}</div>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, color: '#888', fontSize: 13, marginBottom: 4, display: 'block' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#aaa' }}>🔒</span>
            </div>
            {submitted && passwordError && (
              <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{passwordError}</div>
            )}
          </div>
          <button type="submit" style={{
            width: '100%',
            background: 'linear-gradient(90deg, #25b86f 0%, #015998 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 17,
            border: 'none',
            borderRadius: 8,
            padding: '10px 0',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(1,89,152,0.08)'
          }}>
            <span role="img" aria-label="rocket">🚀</span> LOGIN
          </button>
        </form>
        <div style={{ marginTop: 6, color: '#888', fontSize: 13 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#25b86f', fontWeight: 600, textDecoration: 'none' }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 