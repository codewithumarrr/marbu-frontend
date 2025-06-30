import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../services/authService.js';

const Login = () => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [userError, setUserError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (apiError) setApiError('');
  }, [employeeNumber, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Clear previous errors
    setUserError('');
    setPasswordError('');
    setApiError('');

    // Validate form
    let valid = true;
    if (!employeeNumber.trim()) {
      setUserError('Employee ID is required');
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    try {
      await login({
        employee_number: employeeNumber.trim(),
        password: password
      });
      navigate('/');
    } catch (error) {
      setApiError(error?.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
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
        <div style={{ fontSize: 36, marginBottom: 6 }}><img src="https://i.ibb.co/YFHXfVz4/logo.png" alt="MARBU Logo" style={{ width: 130, objectFit: 'contain' }} /></div>
        
        <div style={{ color: '#666', marginBottom: 20, fontSize: 15 }}>Welcome to MARBU PMV</div>
        <form style={{ width: '100%' }} onSubmit={handleSubmit} noValidate>
          {/* API Error Display */}
          {apiError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: 13,
              marginBottom: 16,
              textAlign: 'center'
            }}>
              {apiError}
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600, color: '#888', fontSize: 13, marginBottom: 4, display: 'block' }}>Employee ID</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Enter your Employee ID"
                value={employeeNumber}
                onChange={e => setEmployeeNumber(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 15,
                  outline: 'none',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'text',
                }}
              />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#aaa' }}>👤</span>
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
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 15,
                  outline: 'none',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'text',
                }}
              />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#aaa' }}>🔒</span>
            </div>
            {submitted && passwordError && (
              <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{passwordError}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading
                ? '#ccc'
                : 'linear-gradient(90deg, #25b86f 0%, #015998 100%)',
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
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(1,89,152,0.08)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 16,
                  height: 16,
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                LOGGING IN...
              </>
            ) : (
              <>
                <span role="img" aria-label="rocket">🚀</span> LOGIN
              </>
            )}
          </button>
        </form>

        {/* Add CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ marginTop: 6, color: '#888', fontSize: 13 }}>
          {/* Removed signup link */}
        </div>
      </div>
    </div>
  );
};

export default Login;
