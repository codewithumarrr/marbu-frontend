import React, { useState, useEffect } from 'react';
import { getAllRoles, register, getAllUsers, updateUser, deleteUser, getUserByEmployeeNumber } from '../services/authService.js';
import { getReportSites } from '../services/reportsService.js';
import { FaEdit, FaTrash } from 'react-icons/fa';

const UserManagement = () => {
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
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Load initial data
    const fetchInitialData = async () => {
      try {
        const [sitesRes, rolesRes, usersRes] = await Promise.all([
          getReportSites(),
          getAllRoles(),
          getAllUsers()
        ]);
        setSites(sitesRes?.data || []);
        setRoles(rolesRes || []);
        setUsers(usersRes?.data || []);
      } catch (err) {
        setApiError('Failed to load initial data');
      }
    };
    fetchInitialData();
  }, []);

  // Load users from API
  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response?.data || []);
    } catch (err) {
      setApiError('Failed to load users');
    }
  };

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
    if (!password.trim() && editUserId === null) {
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
      // Get role_id from role name
      const selectedRole = roles.find(r => r.role_name === roleName);
      const role_id = selectedRole?.role_id;
      
      if (!role_id) {
        setApiError('Invalid role selected');
        setLoading(false);
        return;
      }

      if (editUserId !== null) {
        // Update existing user - use database field names
        const updateData = {
          employee_number: employeeNumber,
          employee_name: name,
          mobile_number: mobileNumber,
          role_id: role_id,
          site_id: parseInt(siteId),
          ...(password && { password })
        };
        await updateUser(editUserId, updateData);
        setEditUserId(null);
        setShowUpdateModal(true);
      } else {
        // Create new user using registration API - use registration schema field names
        const createData = {
          employeeNumber: employeeNumber,  // registration API expects this format
          name: name,                      // registration API expects this format
          role: roleName,                  // registration API expects role name, not ID
          mobile_number: mobileNumber,     // this is correct
          site_id: parseInt(siteId),       // this is correct
          password: password               // this is correct
        };
        await register(createData);
        setShowCreateModal(true);
      }

      // Reset form
      setName('');
      setEmployeeNumber('');
      setMobileNumber('');
      setPassword('');
      setRoleName('');
      setSiteId('');
      setSubmitted(false);
      
      // Reload users list
      await loadUsers();
      
    } catch (err) {
      setApiError(err?.response?.data?.message || err.message || 'Error saving user');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setName(user.employee_name);
    setEmployeeNumber(user.employee_number);
    setMobileNumber(user.mobile_number);
    setPassword(''); // Do not prefill password for security
    setRoleName(user.role_name);
    setSiteId(user.site_id);
    setEditUserId(user.employee_id);
    setSubmitted(false);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.employee_name}?`)) {
      try {
        await deleteUser(user.employee_id);
        setShowDeleteModal(true);
        await loadUsers(); // Reload users list
      } catch (err) {
        setApiError(err?.response?.data?.message || err.message || 'Error deleting user');
      }
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      background: '#f4fafd',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '40px 0',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        padding: '32px 40px',
        width: '100%',
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}><i className="fas fa-users-cog"></i></div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'rgb(1,89,152)', marginBottom: 2 }}>User Management</div>
        <div style={{ color: '#666', marginBottom: 18, fontSize: 14 }}>Add or manage users</div>
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
          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            marginBottom: 18,
          }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 16, fontWeight: 600 }}>NAME</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Enter name"
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
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 16, fontWeight: 600 }}>Employee Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Enter Employee Number"
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
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 16, fontWeight: 600 }}>Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
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
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 16, fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="Enter password"
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
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 16, fontWeight: 600 }}>Role</label>
              <select
                value={roleName}
                onChange={e => setRoleName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 15,
                  outline: 'none',
                }}
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.role_id || role} value={role.role_name || role}>{role.role_name || role}</option>
                ))}
              </select>
              {submitted && roleError && (
                <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{roleError}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 16, fontWeight: 600 }}>Site</label>
              <select
                value={siteId}
                onChange={e => setSiteId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  fontSize: 15,
                  outline: 'none',
                }}
              >
                <option value="">Select Site</option>
                {sites.map(site => (
                  <option key={site.site_id || site} value={site.site_id || site}>{site.site_name || site}</option>
                ))}
              </select>
              {submitted && siteError && (
                <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{siteError}</div>
              )}
            </div>
          </div>
          <button type="submit" style={{
            width: '100%',
            background: 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            borderRadius: 8,
            padding: '14px 0',
            marginTop: 8,
            boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
            letterSpacing: 1,
            cursor: 'pointer',
            transition: 'background 0.2s',
            opacity: loading ? 0.7 : 1
          }} disabled={loading}>
            {loading ? 'Saving...' : (editUserId !== null ? 'Update User' : 'Create User')}
          </button>
        </form>
        {/* Recent Users Table */}
        {users.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            marginTop: 48,
            padding: 0,
            overflow: 'hidden',
            width: '100%',
            maxWidth: 1100,
            alignSelf: 'center',
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 20,
              padding: '12px 24px',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}>
              Recent Users
            </div>
            <div style={{ padding: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #25b86f 0%, #2563eb 100%)' }}>
                    <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Name</th>
                    <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Employee Number</th>
                    <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Mobile</th>
                    <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Role</th>
                    <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Site</th>
                    <th style={{ color: '#fff', fontWeight: 700, padding: '12px 8px', border: 'none' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user.employee_id || idx} style={{ background: idx % 2 === 0 ? '#f8fafc' : '#fff' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 500 }}>{user.employee_name}</td>
                      <td style={{ padding: '10px 8px' }}>{user.employee_number}</td>
                      <td style={{ padding: '10px 8px' }}>{user.mobile_number}</td>
                      <td style={{ padding: '10px 8px' }}>{user.role_name}</td>
                      <td style={{ padding: '10px 8px' }}>{user.site_name}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <button onClick={() => handleEdit(user)} style={{
                          background: 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: 'pointer',
                          marginRight: 8,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}><FaEdit style={{ fontSize: 14 }} /> Edit</button>
                        <button onClick={() => handleDelete(user)} style={{
                          background: '#dc2626',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}><FaTrash style={{ fontSize: 14 }} /> Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Delete Success Modal */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              padding: '32px 40px',
              minWidth: 320,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18
            }}>
              <div style={{ fontSize: 32, color: '#25b86f', marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 600, fontSize: 20, color: '#23476a' }}>User deleted successfully</div>
              <button onClick={() => setShowDeleteModal(false)} style={{
                marginTop: 10,
                background: 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 32px',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
                letterSpacing: 1
              }}>OK</button>
            </div>
          </div>
        )}
        {/* Update Success Modal */}
        {showUpdateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              padding: '32px 40px',
              minWidth: 320,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18
            }}>
              <div style={{ fontSize: 32, color: '#25b86f', marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 600, fontSize: 20, color: '#23476a' }}>User updated successfully</div>
              <button onClick={() => setShowUpdateModal(false)} style={{
                marginTop: 10,
                background: 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 32px',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
                letterSpacing: 1
              }}>OK</button>
            </div>
          </div>
        )}
        {/* Create Success Modal */}
        {showCreateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              padding: '32px 40px',
              minWidth: 320,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18
            }}>
              <div style={{ fontSize: 32, color: '#25b86f', marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 600, fontSize: 20, color: '#23476a' }}>User created successfully</div>
              <button onClick={() => setShowCreateModal(false)} style={{
                marginTop: 10,
                background: 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 32px',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
                letterSpacing: 1
              }}>OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
