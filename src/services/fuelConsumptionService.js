import api from './api.js';

// Get all diesel consumption records
export async function getAllDieselConsumption(params = {}) {
  const response = await api.get('/diesel-consumption', { params });
  return response.data;
}

// Get diesel consumption record by ID
export async function getDieselConsumptionById(id) {
  const response = await api.get(`/diesel-consumption/${id}`);
  return response.data;
}

// Create a new diesel consumption record
export async function createDieselConsumption(data) {
  const response = await api.post('/diesel-consumption/create', data);
  return response.data;
}

// Update diesel consumption record by ID
export async function updateDieselConsumption(id, data) {
  const response = await api.put(`/diesel-consumption/${id}`, data);
  return response.data;
}

// Delete diesel consumption record by ID
export async function deleteDieselConsumption(id) {
  const response = await api.delete(`/diesel-consumption/${id}`);
  return response.data;
}

// Get vehicle/equipment types
export async function getVehicleEquipmentTypes() {
  const response = await api.get('/diesel-consumption/vehicle-types');
  return response.data;
}

// Get vehicles by type
export async function getVehiclesByType(type) {
  const response = await api.get(`/diesel-consumption/vehicles/${type}`);
  return response.data;
}

// Get active jobs
export async function getActiveJobs() {
  const response = await api.get('/diesel-consumption/jobs/active');
  return response.data;
}

// Get operator employees
export async function getOperatorEmployees() {
  const response = await api.get('/diesel-consumption/employees/operators');
  return response.data;
}

// Save thumbprint data
export async function saveThumbprint(consumptionId, thumbprintData) {
  const response = await api.post('/diesel-consumption/thumbprint', { consumptionId, thumbprintData });
  return response.data;
}
