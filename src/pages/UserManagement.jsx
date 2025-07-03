import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { getAllRoles, register, getAllUsers, updateUser, deleteUser, getUserByEmployeeNumber } from '../services/authService.js';
import { getReportSites } from '../services/reportsService.js';
import { FaEdit, FaTrash, FaIdBadge } from 'react-icons/fa';

const USERS_PER_PAGE = 5;

const UserManagement = () => {
  const [name, setName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roles, setRoles] = useState([]);
  const [siteId, setSiteId] = useState('');
  const [sites, setSites] = useState([]);
  const [qatarIdNumber, setQatarIdNumber] = useState('');
  const [profession, setProfession] = useState('');
  const [userPicture, setUserPicture] = useState(null);
  const [userPicturePreview, setUserPicturePreview] = useState(null);
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
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = users.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);
  const editFormRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    // Load initial data
    const fetchInitialData = async () => {
      try {
        // Backend integration: API call to get all users
        const [sitesRes, rolesRes, usersRes] = await Promise.all([
          getReportSites(),
          getAllRoles(),
          getAllUsers()
        ]);
        setSites(sitesRes?.data || []);
        setRoles(rolesRes || []);
        setUsers(usersRes?.data || []);
        if ((usersRes?.data || []).length > 0) {
          console.log('First user object:', usersRes.data[0]);
        }
      } catch (err) {
        setApiError('Failed to load initial data');
      }
    };
    fetchInitialData();
  }, []);

  // Load users from API
  const loadUsers = async () => {
    try {
      // Backend integration: API call to get all users
      const response = await getAllUsers();
      setUsers(response?.data || []);
      if ((response?.data || []).length > 0) {
        console.log('First user object:', response.data[0]);
      }
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

      const formData = new FormData();
      if (editUserId !== null) {
        // Update: use snake_case for backend
        formData.append('employee_number', employeeNumber);
        formData.append('employee_name', name);
        formData.append('mobile_number', mobileNumber);
        formData.append('role_id', role_id);
        formData.append('site_id', siteId);
        formData.append('qatar_id_number', qatarIdNumber);
        formData.append('profession', profession);
        if (password) formData.append('password', password);
        if (userPicture) formData.append('user_picture', userPicture);

        // Backend integration: API call to update user
        await updateUser(editUserId, formData, true); // true for multipart
        setEditUserId(null);
        setShowUpdateModal(true);
        setUserPicture(null);
        setUserPicturePreview(null);
      } else {
        // Create: use camelCase for registration endpoint, send all fields as FormData
        formData.append('employeeNumber', employeeNumber);
        formData.append('name', name);
        formData.append('role', roleName);
        formData.append('mobile_number', mobileNumber);
        formData.append('site_id', siteId);
        formData.append('qatar_id_number', qatarIdNumber);
        formData.append('profession', profession);
        if (password) formData.append('password', password);
        if (userPicture) formData.append('user_picture', userPicture);

        // Backend integration: API call to register user
        await register(formData, true); // true for multipart
        setShowCreateModal(true);
        // Restore: reload users from backend instead of unshifting
        await loadUsers();
      }

      // Reset form and file input
      setName('');
      setEmployeeNumber('');
      setMobileNumber('');
      setPassword('');
      setRoleName('');
      setSiteId('');
      setQatarIdNumber('');
      setProfession('');
      setUserPicture(null);
      setUserPicturePreview(null);
      // Reset file input value so it can be picked again
      const fileInput = document.getElementById('user-picture-upload');
      if (fileInput) fileInput.value = '';
      setSubmitted(false);

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
    setQatarIdNumber(user.qatar_id_number || '');
    setProfession(user.profession || '');
    setUserPicture(null);
    setUserPicturePreview(user.user_picture || null);
    setEditUserId(user.user_id || user.employee_id);
    setTimeout(() => {
      if (editFormRef.current) {
        editFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 0);
  };

  // Show custom confirm modal
  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirmModal(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const id = userToDelete.user_id || userToDelete.employee_number || userToDelete.employee_id;
      // Backend integration: API call to delete user
      await deleteUser(id);
      setShowDeleteModal(true);
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
      await loadUsers(); // Reload users list
    } catch (err) {
      setApiError(err?.response?.data?.message || err.message || 'Error deleting user');
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setUserToDelete(null);
  };

  return (
    <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '30px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      width: "100%"
    }}>
      <div style={{
       width: "100%"
      }}>

        <div style={{ color: '#015998', marginBottom: 20, fontWeight: 700, fontSize: 27 }}>User Management</div>

        <form
          ref={editFormRef}
          style={{ width: '100%' }}
          onSubmit={handleSubmit}
          noValidate
          encType="multipart/form-data"
        >
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label htmlFor="user-picture-upload" style={{ cursor: 'pointer' }}>
                <div
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    background: '#f3f4f6',
                    border: '3px solid #25b86f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: 8,
                  }}
                >
                  {userPicturePreview ? (
                    <img
                      src={userPicturePreview}
                      alt="User Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    (() => {
                      let userPicUrl = null;
                      if (editUserId !== null) {
                        const userObj = users.find(
                          u =>
                            (u.user_id === editUserId || u.employee_id === editUserId) &&
                            u.user_picture &&
                            typeof u.user_picture === 'string' &&
                            u.user_picture.trim() !== ''
                        );
                        if (userObj) userPicUrl = userObj.user_picture;
                      }
                      return userPicUrl ? (
                        <img
                          src={userPicUrl}
                          alt="Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ color: '#bbb', fontSize: 48 }}>+</span>
                      );
                    })()
                  )}
                </div>
                <input
                  id="user-picture-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files[0];
                    setUserPicture(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setUserPicturePreview(reader.result);
                      reader.readAsDataURL(file);
                    } else {
                      setUserPicturePreview(null);
                    }
                  }}
                />
              </label>
              <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Upload Picture</div>
            </div>
          </div>
          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            marginBottom: 18,
          }}>
             <div className="form-group">
              <label className="form-label" >Employee Number</label>
              
                <input
                  ref={firstInputRef}
                  type="text"
                  className='form-input'
                  placeholder="Enter Employee Number"
                  value={employeeNumber}
                  onChange={e => setEmployeeNumber(e.target.value)}
                  style={{
                    width: '100%',
                 
                  }}
                />
              
              
              {submitted && userError && (
                <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{userError}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">NAME</label>
              
                <input
                  type="text"
                  className='form-input'
                  placeholder="Enter name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%',
                   
                  }}
                />
              
              
              {submitted && nameError && (
                <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{nameError}</div>
              )}
            </div>
           
            <div className="form-group">
              <label className="form-label" >Mobile Number</label>
              
                <input
                  type="tel"
                  className='form-input'
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  style={{
                    width: '100%',
                   
                  }}
                />
                
              
              {submitted && mobileError && (
                <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{mobileError}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" >Password</label>
              
                <input
                  type="password"
                  className='form-input'
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                   
                  }}
                />
                
              
              {submitted && passwordError && (
                <div style={{ color: '#dc2626', fontSize: 12, marginTop: 3 }}>{passwordError}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" >Role</label>
              <select
                value={roleName}
                className='form-select'
                onChange={e => setRoleName(e.target.value)}
                style={{
                  width: '100%',
                 
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
            <label className="form-label">Site</label>
              <select
                value={siteId}
                className='form-select'
                onChange={e => setSiteId(e.target.value)}
                style={{
                  width: '100%',
                 
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
          <div className="form-group">
            <label className="form-label">Qatar ID Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Qatar ID Number"
              value={qatarIdNumber}
              onChange={e => setQatarIdNumber(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Profession</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Profession"
              value={profession}
              onChange={e => setProfession(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          </div>
          <button type="submit" style={{
            width: 'auto',
            background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            marginTop: 8,
            boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
            letterSpacing: 1,
            cursor: 'pointer',
            transition: 'background 0.2s',
            opacity: loading ? 0.7 : 1
          }} disabled={loading}>
            {loading ? 'Saving...' : (editUserId !== null ? 'Update User' : 'Create User')}
          </button>
          {editUserId !== null && (
            <button
              type="button"
              style={{
                width: 'auto',
                background: '#e5e7eb',
                color: '#374151',
                fontWeight: 700,
                fontSize: 16,
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                marginTop: 8,
                marginLeft: 12,
                boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
                letterSpacing: 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              disabled={loading}
              onClick={() => {
                setEditUserId(null);
                setName('');
                setEmployeeNumber('');
                setMobileNumber('');
                setPassword('');
                setRoleName('');
                setSiteId('');
                setQatarIdNumber('');
                setProfession('');
                setUserPicture(null);
                setUserPicturePreview(null);
                setNameError('');
                setUserError('');
                setMobileError('');
                setPasswordError('');
                setRoleError('');
                setSiteError('');
                setSubmitted(false);
                setApiError('');
              }}
            >
              Cancel
            </button>
          )}
        </form>
        {/* Recent Users Table */}
        {users.length > 0 && (
          <div style={{
            marginTop: 40,
            width: "100%",
            position: 'relative',
          }}>
            {/* Delete Success Modal (table top) */}
            {showDeleteModal && (
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '-70px',
                margin: '0 auto',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
              }}>
                <div style={{
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                  padding: '24px 32px',
                  minWidth: 320,
                  maxWidth: '90vw',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 18,
                }}>
                  <div style={{ fontSize: 32, color: '#25b86f', marginBottom: 8 }}>✅</div>
                  <div style={{ fontWeight: 600, fontSize: 20, color: '#23476a' }}>User deleted successfully</div>
                  <button onClick={() => setShowDeleteModal(false)} style={{
                    marginTop: 10,
                    background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
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
            <div>
              <div style={{
                fontWeight: 600,
                fontSize: 24,
                color: '#015998',
              }}>
                Recent Users
              </div>
            </div>
            <div style={{
              width: '100%',
              height: 5,
              background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
              borderRadius: 8,
              margin: '10px 0 18px 0',
            }} />
            <div className="table-container" style={{ overflowX: 'auto', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'transparent' }}>
                <thead style={{ background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)' }}>
                  <tr>
                    <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: 'nowrap' }}>Employee Number</th>
                    <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: 'nowrap' }}>Mobile</th>
                    <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: 'nowrap' }}>Role</th>
                    <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: 'nowrap' }}>Site</th>
                    <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{
                        padding: '40px 24px',
                        textAlign: 'center',
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user, idx) => (
                      <tr key={user.employee_id || idx} style={{
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        borderRadius: 10,
                        marginTop: 8,
                        marginBottom: 8,
                        height: 60,
                      }}>
                        <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', fontWeight: 500, textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)', whiteSpace: 'nowrap' }}>{user.employee_name}</td>
                        <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)', whiteSpace: 'nowrap' }}>{user.employee_number}</td>
                        <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)', whiteSpace: 'nowrap' }}>{user.mobile_number}</td>
                        <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)', whiteSpace: 'nowrap' }}>{user.role_name}</td>
                        <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)', whiteSpace: 'nowrap' }}>{user.site_name}</td>
                        <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)' }}>
                          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={() => handleEdit(user)}
                              style={{
                                background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '6px 16px',
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: 'pointer',
                                letterSpacing: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                              }}
                            >
                              <span style={{ fontSize: 18, marginRight: 4 }}><i className="fa fa-pencil" aria-hidden="true"></i></span>
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              style={{
                                background: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '6px 16px',
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: 'pointer',
                                letterSpacing: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                                transition: 'background 0.2s',
                              }}
                            >
                              <span style={{ fontSize: 18, marginRight: 4 }}><i className="fa fa-trash" aria-hidden="true"></i></span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ paddingBottom: 20,  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      background: currentPage === 1 ? '#e5e7eb' : 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
                      color: currentPage === 1 ? '#9ca3af' : '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontWeight: 600,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: 14
                    }}
                  >
                    ← Previous
                  </button>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          background: currentPage === page ? 'linear-gradient(135deg, #25b86f 0%, #015998 100%)' : '#fff',
                          color: currentPage === page ? '#fff' : '#374151',
                          border: currentPage === page ? 'none' : '1px solid #d1d5db',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontWeight: currentPage === page ? 700 : 500,
                          cursor: 'pointer',
                          fontSize: 14,
                          minWidth: 40
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      background: currentPage === totalPages ? '#e5e7eb' : 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
                      color: currentPage === totalPages ? '#9ca3af' : '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontWeight: 600,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: 14
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Delete Confirm Modal */}
        {showDeleteConfirmModal && userToDelete && (
          ReactDOM.createPortal(
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.7)',
              zIndex: 2147483647,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                background: '#fff',
                padding: 20,
                borderRadius: 8,
                textAlign: 'center',
                boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 320,
                maxWidth: '90vw'
              }}>
                <div style={{ fontSize: 32, color: '#dc2626', marginBottom: 8 }}>⚠️</div>
                <div style={{ fontWeight: 600, fontSize: 20, color: '#23476a', marginBottom: 8 }}>
                  Are you sure you want to delete user <span style={{ color: '#dc2626' }}>{userToDelete.employee_name}</span>?
                </div>
                <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
                  <button onClick={confirmDelete} style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 32px',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
                    letterSpacing: 1
                  }}>Delete</button>
                  <button onClick={cancelDelete} style={{
                    background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 32px',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
                    letterSpacing: 1
                  }}>Cancel</button>
                </div>
              </div>
            </div>,
            document.body
          )
        )}
        {/* Update Success Modal */}
        {showUpdateModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
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
              maxWidth: '90vw',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              <div style={{ fontSize: 32, color: '#25b86f', marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 600, fontSize: 20, color: '#23476a' }}>User updated successfully</div>
              <button onClick={() => setShowUpdateModal(false)} style={{
                marginTop: 10,
                background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
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
                background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
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
