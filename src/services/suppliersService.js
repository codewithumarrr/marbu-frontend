// src/services/suppliersService.js

import api from './api.js';

// Get all suppliers
export async function getAllSuppliers() {
  const response = await api.get('/suppliers');
  return response.data;
}