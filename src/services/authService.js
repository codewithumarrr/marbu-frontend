import api from './api.js';
import { useUserStore } from '../store/userStore.js';

// Login user
export async function login(credentials) {
  const { setAuth, setError } = useUserStore.getState();
  
  try {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.status === 'success') {
      setAuth({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.data?.user
      });
    }
    
    return response.data;
  } catch (error) {
    setError(error.response?.data?.message || error.message);
    throw error;
  }
}

// Register new user
export async function register(userData) {
  const { setError } = useUserStore.getState();
  
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    setError(error.response?.data?.message || error.message);
    throw error;
  }
}

// Get all roles for registration
export async function getAllRoles() {
  const response = await api.get('/roles');
  return response.data;
}

// Logout user
export async function logout() {
  const { clearAuth, getToken } = useUserStore.getState();
  
  try {
    const token = getToken();
    if (token) {
      // Call backend logout endpoint
      await api.post('/auth/logout');
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear auth state regardless of backend response
    clearAuth();
  }
}

// Get user profile
export async function getProfile() {
  const { setProfile, setError } = useUserStore.getState();
  
  try {
    const response = await api.get('/auth/profile');
    if (response.data.status === 'success') {
      setProfile(response.data.data.user);
    }
    return response.data;
  } catch (error) {
    setError(error.response?.data?.message || error.message);
    throw error;
  }
}

// Refresh access token
export async function refreshToken() {
  const { refreshToken: storedRefreshToken, updateToken, clearAuth } = useUserStore.getState();
  
  if (!storedRefreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await api.post('/auth/refresh-token', { 
      refreshToken: storedRefreshToken 
    });
    
    if (response.data.accessToken) {
      updateToken(response.data.accessToken);
    }
    
    return response.data;
  } catch (error) {
    // If refresh fails, clear auth
    clearAuth();
    throw error;
  }
}

// Check if user is authenticated
export function isAuthenticated() {
  const { isAuthenticated, accessToken } = useUserStore.getState();
  return isAuthenticated && !!accessToken;
}

// Get current access token
export function getAccessToken() {
  return useUserStore.getState().accessToken;
}

// Get current refresh token
export function getRefreshToken() {
  return useUserStore.getState().refreshToken;
}

// Get current user
export function getCurrentUser() {
  return useUserStore.getState().user;
}

// Get current profile
export function getCurrentProfile() {
  return useUserStore.getState().profile;
}

// User Management Functions

// Get all users
export async function getAllUsers() {
  const { setError } = useUserStore.getState();
  
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    setError(error.response?.data?.message || error.message);
    throw error;
  }
}

// Get user by ID
export async function getUserById(id) {
  const { setError } = useUserStore.getState();
  
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    setError(error.response?.data?.message || error.message);
    throw error;
  }
}

// Update user by ID
export async function updateUser(id, userData) {
  const { setError } = useUserStore.getState();
  
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    setError(error.response?.data?.message || error.message);
    throw error;
  }
}

// Delete user by ID
export async function deleteUser(id) {
  const { setError } = useUserStore.getState();
  
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    setError(error.response?.data?.message || error.message);
    throw error;
  }
}

// Get user by employee number
export async function getUserByEmployeeNumber(employeeNumber) {
  const { setError } = useUserStore.getState();
  
  try {
    const response = await api.get(`/users/employee/${employeeNumber}`);
    return response.data;
  } catch (error) {
    setError(error.response?.data?.message || error.message);
    throw error;
  }
}

// Generate authentication options
export async function generateAuthenticationOptions() {
  const { setError, getToken } = useUserStore.getState();
  try {
    const token = getToken();
    const response = await api.get('/auth/generate-authentication-options', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    setError(error.response?.data?.message || error.message);
    throw error;
  }
}

// Verify authentication response
export async function verifyAuthenticationResponse(data) {
  const { setError, getToken } = useUserStore.getState();
  try {
    const token = getToken();
    const response = await api.post('/auth/verify-authentication-response', data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    setError(error.response?.data?.message || error.message);
    throw error;
  }
}
