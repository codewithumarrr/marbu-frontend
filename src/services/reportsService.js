import api from './api.js';

// Generate fuel usage report (GET)
export async function generateFuelUsageReport(params = {}) {
  const response = await api.get('/reports/fuel-usage', { params });
  return response.data;
}

// Get sites for reports
export async function getReportSites() {
  const response = await api.get('/reports/sites');
  return response.data;
}

// Get vehicle types for reports
export async function getReportVehicleTypes() {
  const response = await api.get('/reports/vehicle-types');
  return response.data;
}

// Export report data (GET)
export async function exportReportData(params = {}) {
  const response = await api.get('/reports/export', { params });
  return response.data;
}

// Get fuel efficiency analysis
export async function getEfficiencyAnalysis(params = {}) {
  const response = await api.get('/reports/efficiency-analysis', { params });
  return response.data;
}

 // Export report as PDF (GET, returns JSON data)
 export async function exportReportPdf(params = {}) {
   // Always expect JSON, not blob
   const response = await api.get('/reports/export-pdf', { params });
   return response.data;
 }

// Email report (POST)
export async function emailReport(data = {}) {
  const response = await api.post('/reports/email-report', data);
  return response.data;
}

