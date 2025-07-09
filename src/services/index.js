// Main services export file
// This file provides a centralized way to import all services

// Core services
export { default as api } from './api.js';

// Authentication (function-based)
export * from './authService.js';

// Module-specific services (function-based)
export * from './dashboardService.js';
export * from './fuelReceivingService.js';
export * from './fuelConsumptionService.js';
export * from './invoicesService.js';
export * from './reportsService.js';
export * from './auditTrailService.js';
export * from './divisionsService.js';
export * from './suppliersService.js';

// Utility functions (if needed)
export const initializeServices = () => {
  // Optionally add global error handling here
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.response?.status === 401) {
      // Handle global authentication errors
      // You may want to clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
  });
  // Add other global initializations if needed
};
