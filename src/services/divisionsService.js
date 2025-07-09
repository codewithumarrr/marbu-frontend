// src/services/divisionsService.js

import api from './api.js';

// Get all divisions
export async function getAllDivisions() {
  const response = await api.get('/divisions');
  return response.data;
}

// Create division
export async function createDivision(data) {
  const response = await api.post('/divisions', data);
  return response.data;
}

// Update division
export async function updateDivision(id, data) {
  const response = await api.put(`/divisions/${id}`, data);
  return response.data;
}

// Delete division
export async function deleteDivision(id) {
  const response = await api.delete(`/divisions/${id}`);
  return response.data;
}