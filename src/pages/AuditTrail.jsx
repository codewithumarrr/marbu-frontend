import React, { useState, useEffect } from "react";
import "../styles/pages.css";
import FilterGroup from "../components/FilterGroup";
import TableComponent from "../components/TableComponent";
import {
  getAllAuditLogs,
  getFilteredAuditLogs,
  getAuditLogUsers,
  getAuditLogRecordTypes
} from "../services/auditTrailService.js";

function AuditTrail() {
  const auditHeaders = [
    "Timestamp",
    "User",
    "Action",
    "Record Type",
    "Record ID",
    "Details",
  ];
  const [auditData, setAuditData] = useState([]);
  const [users, setUsers] = useState([]);
  const [recordTypes, setRecordTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    loadFilters();
    loadAuditLogs();
    // eslint-disable-next-line
  }, []);

  const loadFilters = async () => {
    setLoading(true);
    setApiError('');
    try {
      const [usersRes, recordTypesRes] = await Promise.all([
        getAuditLogUsers(),
        getAuditLogRecordTypes()
      ]);
      setUsers(usersRes?.data || []);
      setRecordTypes(recordTypesRes?.data || []);
    } catch (err) {
      setApiError(err?.response?.data?.message || err.message || 'Failed to load audit filters');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async (filters = {}) => {
    setLoading(true);
    setApiError('');
    try {
      let data;
      if (Object.keys(filters).length > 0) {
        data = await getFilteredAuditLogs(filters);
        // If paginated, use data.auditLogs
        setAuditData(data?.data?.auditLogs || []);
      } else {
        data = await getAllAuditLogs();
        setAuditData(data?.data || []);
      }
    } catch (err) {
      setApiError(err?.response?.data?.message || err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterAudit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const filters = {
      actionType: form.actionType.value,
      userId: form.userId.value,
      dateFrom: form.dateFrom.value,
      recordType: form.recordType.value
    };
    loadAuditLogs(filters);
  };

  return (
    <div id="audit" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998',fontSize:27,fontWeight:700 }}>Audit Trail</h2>
      <FilterGroup onSubmit={handleFilterAudit}>
        <div className="form-group">
          <label className="form-label">Action Type</label>
          <select className="form-select" name="actionType">
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">User</label>
          <select className="form-select" name="userId">
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name || user.username}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Record Type</label>
          <select className="form-select" name="recordType">
            <option value="">All Types</option>
            {recordTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date From</label>
          <input type="date" className="form-input" name="dateFrom" defaultValue="2025-06-01" />
        </div>
        <div className="form-group" style={{ alignSelf: 'end' }}>
          <button type="submit" className="btn btn-primary">🔍 Filter</button>
        </div>
      </FilterGroup>
      {apiError && (
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
          <span>{apiError}</span>
        </div>
      )}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #015998',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      )}
      <TableComponent
        headers={auditHeaders}
        data={auditData}
        renderRow={(row) => (
          <>
            <td>{row.timestamp}</td>
            <td>{row.user}</td>
            <td>
              <span className={`status-badge status-${row.action?.toLowerCase()}`}>{row.action}</span>
            </td>
            <td>{row.recordType}</td>
            <td>{row.recordId}</td>
            <td>{typeof row.details === "string" ? row.details : JSON.stringify(row.details)}</td>
          </>
        )}
      />
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

export default AuditTrail;
