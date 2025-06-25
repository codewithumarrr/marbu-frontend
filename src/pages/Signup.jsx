import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, getAllRoles } from '../services/authService.js';
import { getReportSites } from '../services/reportsService.js';

const Signup = () => {
  const [name, setName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roles, setRoles] = useState([]);
  const [siteId, setSiteId] = useState('');
  const [sites, setSites] = useState([]);
  const [nameError, setNameError] = useState('');
  const [userError, setUserError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [roleError, setRoleError] = useState('');
  const [siteError, setSiteError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load sites for dropdown
    const fetchSites = async () => {
      try {
        const res = await getReportSites();
        setSites(res?.data || []);
      } catch (err) {
        // ignore for now
      }
    };
    fetchSites();
    // Load roles for dropdown
    const fetchRoles = async () => {
      try {
        const res = await getAllRoles();
        setRoles(res || []);
      } catch (err) {
        // ignore for now
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setApiError('');
    let valid = true;
    if (!name.trim()) {
      setNameError('Name is required');
      valid = false;
    } else {
      setNameError('');
    }
    if (!employeeNumber.trim()) {
      setUserError('Employee ID is required');
      valid = false;
    } else {
      setUserError('');
    }
    if (!mobileNumber.trim()) {
      setMobileError('Mobile number is required');
      valid = false;
    } else {
      setMobileError('');
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }
    if (!roleName.trim()) {
      setRoleError('Role is required');
      valid = false;
    } else {
      setRoleError('');
    }
    if (!siteId) {
      setSiteError('Site is required');
      valid = false;
    } else {
      setSiteError('');
    }
    if (!valid) return;

    setLoading(true);
    try {
      await register({
        employeeNumber: employeeNumber.trim(),
        name: name.trim(),
        mobile_number: mobileNumber.trim(),
        password,
        role: roleName.trim(),
        site_id: Number(siteId)
      });
      navigate('/login');
    } catch (error) {
      setApiError(error?.response?.data?.message || error.message || 'Signup failed');
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
        <div style={{ fontSize: 36, marginBottom: 6 }}>🛢️</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'rgb(1,89,152)', marginBottom: 2 }}>Create Account</div>
        <div style={{ color: '#666', marginBottom: 18, fontSize: 14 }}>Sign up for MARBU</div>
        <form style={{ width: '100%' }} onSubmit={handleSubmit} noValidate>
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
            <label className="form-label">NAME</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#aaa' }}>👤</span>
            </div>
            {submitted && nameError && (
              <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{nameError}</div>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Employee ID</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Enter your Employee ID"
                value={employeeNumber}
                onChange={e => setEmployeeNumber(e.target.value)}
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
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#aaa' }}>📱</span>
            </div>
            {submitted && mobileError && (
              <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{mobileError}</div>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Role</label>
            <div style={{ position: 'relative' }}>
              <select
                value={roleName}
                onChange={e => setRoleName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 15,
                  outline: 'none',
                  background: '#fff'
                }}
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.role_id} value={role.role_name}>
                    {role.role_name}
                  </option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#aaa' }}>🏷️</span>
            </div>
            {submitted && roleError && (
              <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{roleError}</div>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Site</label>
            <div style={{ position: 'relative' }}>
              <select
                value={siteId}
                onChange={e => setSiteId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 15,
                  outline: 'none',
                  background: '#fff'
                }}
              >
                <option value="">Select Site</option>
                {sites.map(site => (
                  <option key={site.site_id || site.id} value={site.site_id || site.id}>
                    {site.site_name || site.name}
                  </option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#aaa' }}>📍</span>
            </div>
            {submitted && siteError && (
              <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{siteError}</div>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">PASSWORD</label>
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
            background: loading ? '#ccc' : 'linear-gradient(90deg, #25b86f 0%, #015998 100%)',
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
            boxShadow: '0 2px 8px rgba(1,89,152,0.08)'
          }}>
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
                SIGNING UP...
              </>
            ) : (
              <>
                <span role="img" aria-label="rocket">🚀</span> SIGN UP
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
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#25b86f', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
