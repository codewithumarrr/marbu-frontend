import api from './api.js';

// Get all audit log entries
export async function getAllAuditLogs(params = {}) {
  const response = await api.get('/audit-log', { params });
  return response.data;
}

// Get filtered audit logs
export async function getFilteredAuditLogs(filters = {}) {
  const response = await api.get('/audit-log/filtered', { params: filters });
  return response.data;
}

// Get audit log entry by ID
export async function getAuditLogById(id) {
  const response = await api.get(`/audit-log/${id}`);
  return response.data;
}

// Create a new audit log entry
export async function createAuditLog(data) {
  const response = await api.post('/audit-log', data);
  return response.data;
}

// Update audit log entry by ID
export async function updateAuditLog(id, data) {
  const response = await api.put(`/audit-log/${id}`, data);
  return response.data;
}

// Delete audit log entry by ID
export async function deleteAuditLog(id) {
  const response = await api.delete(`/audit-log/${id}`);
  return response.data;
}

// Get users for audit filter
export async function getAuditLogUsers() {
  const response = await api.get('/audit-log/users');
  return response.data;
}

// Get record types for audit filter
export async function getAuditLogRecordTypes() {
  const response = await api.get('/audit-log/record-types');
  return response.data;
}
