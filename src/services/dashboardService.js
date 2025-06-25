import api from './api.js';

// Get dashboard statistics
export async function getStats() {
  const response = await api.get('/dashboard/stats');
  return response.data;
}

// Get recent fuel activities
export async function getRecentActivity(limit = 10) {
  const response = await api.get('/dashboard/recent-activity', { params: { limit } });
  return response.data;
}

// Get fuel level alerts
export async function getAlerts() {
  const response = await api.get('/dashboard/alerts');
  return response.data;
}

// Get tank stock levels
export async function getTankStockLevels() {
  const response = await api.get('/dashboard/tank-stock-levels');
  return response.data;
}

// Get all dashboard data at once (parallel)
export async function getDashboardData() {
  const [stats, recentActivity, alerts, tankStockLevels] = await Promise.all([
    getStats(),
    getRecentActivity(),
    getAlerts(),
    getTankStockLevels(),
  ]);
  return {
    stats,
    recentActivity,
    alerts,
    tankStockLevels,
  };
}
