import api from './api.js';

// Get all invoices
export async function getAllInvoices(params = {}) {
  const response = await api.get('/invoices', { params });
  return response.data;
}

// Get filtered invoices
export async function getFilteredInvoices(filters = {}) {
  const response = await api.get('/invoices/filtered', { params: filters });
  return response.data;
}

// Get invoice by ID
export async function getInvoiceById(id) {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
}

// Create a new invoice
export async function createInvoice(data) {
  const response = await api.post('/invoices', data);
  return response.data;
}

// Update invoice by ID
export async function updateInvoice(id, data) {
  const response = await api.put(`/invoices/${id}`, data);
  return response.data;
}

// Delete invoice by ID
export async function deleteInvoice(id) {
  const response = await api.delete(`/invoices/${id}`);
  return response.data;
}

// Generate invoice from consumption
export async function generateInvoiceFromConsumption(data) {
 const response = await api.post('/invoices/generate-from-consumption', data);
 return response.data;
}
