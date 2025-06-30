import React, { useEffect, useState, useCallback } from "react";
import "../styles/pages.css";
import DashboardCard from "../components/DashboardCard";
import TableComponent from "../components/TableComponent";
import {
  getStats,
  getRecentActivity,
  getAlerts,
  getTankStockLevels
} from "../services/dashboardService.js";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentActivity: [],
    alerts: [],
    tankStockLevels: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [stats, recentActivity, alerts, tankStockLevels] = await Promise.all([
        getStats(),
        getRecentActivity(),
        getAlerts(),
        getTankStockLevels()
      ]);
      setDashboardData({
        stats: stats?.data || {},
        recentActivity: recentActivity?.data || [],
        alerts: alerts?.data || [],
        tankStockLevels: tankStockLevels?.data || []
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  const activityHeaders = [
    "Date & Time",
    "Vehicle/Equipment",
    "Emp Role",
    "Emp Name",
    "Quantity (L)",
    "Job Number",
    "Status",
  ];    

  // Format dashboard stats for display
  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat().format(num);
  };

  const stats = dashboardData.stats || {};
  const recentActivity = dashboardData.recentActivity || [];
  const alerts = dashboardData.alerts || [];

  return (
    <div id="dashboard" className="content-panel active">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#015998', margin: 0, fontWeight: 700, fontSize: 27 }}>Dashboard Overview</h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading || refreshing}
          style={{
            background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: isLoading || refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            opacity: isLoading || refreshing ? 0.6 : 1,
          }}
        >
          <span style={{
            display: 'inline-block'
          }}>
            🔄
          </span>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !dashboardData ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #015998',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ color: '#666' }}>Loading dashboard data...</span>
        </div>
      ) : (
        <>
          {/* Dashboard Cards */}
          <div className="dashboard-cards">
            <DashboardCard
              icon="⛽"
              title="Total Fuel Received"
              value={`${formatNumber(stats.totalFuelReceived)} L`}
            />
            <DashboardCard
              icon="🚛"
              title="Total Consumed"
              value={`${formatNumber(stats.totalConsumed)} L`}
            />
            <DashboardCard
              icon="📊"
              title="Current Stock"
              value={`${formatNumber(stats.currentStock)} L`}
            />
            <DashboardCard
              icon="🏭"
              title="Active Jobs"
              value={formatNumber(stats.activeJobs)}
            />
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {alerts.map((alert, index) => (
                <div key={index} className="alert alert-warning" style={{ marginBottom: '8px' }}>
                  <span>⚠️</span>
                  <span>{alert.message || alert}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Activity Table */}
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#015998', marginBottom: '16px' }}>Recent Fuel Activities</h3>
            {recentActivity.length > 0 ? (
              <TableComponent
                headers={activityHeaders}
                data={recentActivity}
                renderRow={(row) => (
                  <>
                    <td>{row.date || row.consumption_datetime}</td>
                    <td>{row.vehicle || `${row.vehicleType} ${row.vehicleId}`}</td>
                    <td>{row.role || row.empRole || row.employeeRole || 'N/A'}</td>
                    <td>{row.employeeName || row.name || row.operatorName || 'N/A'}</td>
                    <td>{row.quantity || row.fuelUsed}</td>
                    <td>{row.job || row.jobNumber}</td>
                    <td>
                      <span className={`status-badge status-${(row.status || 'active').toLowerCase()}`}>
                        {row.status || 'Active'}
                      </span>
                    </td>
                  </>
                )}
              />
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666',
                background: '#f9f9f9',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📊</span>
                <p>No recent activity found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
