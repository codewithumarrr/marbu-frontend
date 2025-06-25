import api from './api.js';

// Get all diesel receiving records
export async function getAllDieselReceiving(params = {}) {
  const response = await api.get('/diesel-receiving', { params });
  return response.data;
}

// Get diesel receiving record by ID
export async function getDieselReceivingById(id) {
  const response = await api.get(`/diesel-receiving/${id}`);
  return response.data;
}

// Create a new diesel receiving record
export async function createDieselReceiving(data) {
  const response = await api.post('/diesel-receiving/create', data);
  return response.data;
}

// Update diesel receiving record by ID
export async function updateDieselReceiving(id, data) {
  const response = await api.put(`/diesel-receiving/${id}`, data);
  return response.data;
}

// Delete diesel receiving record by ID
export async function deleteDieselReceiving(id) {
  const response = await api.delete(`/diesel-receiving/${id}`);
  return response.data;
}

// Get next receipt number
export async function getNextReceiptNumber() {
  const response = await api.get('/diesel-receiving/next-receipt-number');
  return response.data;
}

// Generate invoice from receiving
export async function generateInvoiceFromReceiving(data) {
 const response = await api.post('/diesel-receiving/generate-invoice', data);
 return response.data;
}

// Get tanks by site (optional siteId)
export async function getTanksBySite(siteId) {
  const response = await api.get(`/diesel-receiving/tanks/${siteId}`);
  return response.data;
}

// Get tank in-charge employees
export async function getTankInchargeEmployees() {
  const response = await api.get('/diesel-receiving/employees/tank-incharge');
  return response.data;
}

// Get active suppliers
export async function getActiveSuppliers() {
  const response = await api.get('/diesel-receiving/suppliers/active');
  return response.data;
}
