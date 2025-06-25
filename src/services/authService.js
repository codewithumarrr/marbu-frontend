import api from './api.js';

// Login user
export async function login(credentials) {
  const response = await api.post('/auth/login', credentials);
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }
  if (response.data.refreshToken) {
    localStorage.setItem('refreshToken', response.data.refreshToken);
  }
  localStorage.setItem('isLoggedIn', 'true');
  return response.data;
}

// Register new user
export async function register(userData) {
  const response = await api.post('/auth/register', userData);
  return response.data;
}

// Logout user
export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('isLoggedIn');
}

// Get user profile
export async function getProfile() {
  const response = await api.get('/auth/profile');
  return response.data;
}

// Refresh access token
export async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token available');
  const response = await api.post('/auth/refresh-token', { refreshToken });
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }
  return response.data;
}

// Check if user is authenticated
export function isAuthenticated() {
  const token = localStorage.getItem('accessToken');
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  return !!(token && isLoggedIn === 'true');
}

// Get current access token
export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

// Get current refresh token
export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}
