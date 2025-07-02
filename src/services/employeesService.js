// src/services/employeesService.js

import api from './api.js';

// Get all employees (users)
export async function getAllEmployees() {
  const response = await api.get('/users');
  return response.data;
}