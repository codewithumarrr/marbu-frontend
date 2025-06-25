import React from "react";
import "../styles/pages.css";
import FilterGroup from "../components/FilterGroup";
import TableComponent from "../components/TableComponent";

function AuditTrail() {
  const auditHeaders = [
    "Timestamp",
    "User",
    "Action",
    "Record Type",
    "Record ID",
    "Details",
  ];
  const auditData = [
    {
      timestamp: "2025-06-21 10:30:15",
      user: "John Doe",
      action: "CREATE",
      recordType: "Fuel Receipt",
      recordId: "RCP-2025-001234",
      details: "Added new fuel receipt - 500L",
    },
    {
      timestamp: "2025-06-21 09:15:42",
      user: "Mike Smith",
      action: "UPDATE",
      recordType: "Consumption",
      recordId: "CON-2025-000856",
      details: "Updated fuel consumption record",
    },
    {
      timestamp: "2025-06-21 08:45:30",
      user: "Jane Smith",
      action: "VIEW",
      recordType: "Report",
      recordId: "RPT-2025-000123",
      details: "Generated monthly fuel report",
    },
  ];

  const handleFilterAudit = () => {
    // Add logic to filter audit trail
  };

  return (
    <div id="audit" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998' }}>Audit Trail</h2>
      <FilterGroup onSubmit={handleFilterAudit}>
        <div className="form-group">
          <label className="form-label">Action Type</label>
          <select className="form-select">
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">User</label>
          <select className="form-select">
            <option value="">All Users</option>
            <option value="user-001">John Doe</option>
            <option value="user-002">Jane Smith</option>
            <option value="user-003">Mike Johnson</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date From</label>
          <input type="date" className="form-input" defaultValue="2025-06-01" />
        </div>
        <div className="form-group" style={{ alignSelf: 'end' }}>
          <button type="submit" className="btn btn-primary">🔍 Filter</button>
        </div>
      </FilterGroup>
      <TableComponent
        headers={auditHeaders}
        data={auditData}
        renderRow={(row) => (
          <>
            <td>{row.timestamp}</td>
            <td>{row.user}</td>
            <td>
              <span className={`status-badge status-${row.action.toLowerCase()}`}>{row.action}</span>
            </td>
            <td>{row.recordType}</td>
            <td>{row.recordId}</td>
            <td>{row.details}</td>
          </>
        )}
      />
    </div>
  );
}

export default AuditTrail;
