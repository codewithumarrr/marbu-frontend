import React from "react";
import "../styles/pages.css";
import FilterGroup from "../components/FilterGroup";
import TableComponent from "../components/TableComponent";

function Reports() {
  const reportHeaders = [
    "Date",
    "Site",
    "Vehicle/Equipment",
    "Operator",
    "Fuel Used (L)",
    "Efficiency",
    "Actions",
  ];
  const reportData = [
    {
      date: "2025-06-21",
      site: "Site A",
      vehicle: "Excavator EX-001",
      operator: "John Doe",
      fuelUsed: 85,
      efficiency: "Good",
    },
    {
      date: "2025-06-21",
      site: "Site B",
      vehicle: "Truck TR-045",
      operator: "Mike Smith",
      fuelUsed: 120,
      efficiency: "Average",
    },
    {
      date: "2025-06-20",
      site: "Site C",
      vehicle: "Dozer DZ-002",
      operator: "Sarah Wilson",
      fuelUsed: 95,
      efficiency: "Good",
    },
  ];

  const handleGenerateReport = () => {
    // Add logic to filter and generate report
  };

  return (
    <div id="reports" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998' }}>Fuel Usage Reports</h2>
      <FilterGroup onSubmit={handleGenerateReport}>
        <div className="form-group">
          <label className="form-label">Report Type</label>
          <select className="form-select">
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date From</label>
          <input type="date" className="form-input" defaultValue="2025-06-01" />
        </div>
        <div className="form-group">
          <label className="form-label">Date To</label>
          <input type="date" className="form-input" defaultValue="2025-06-21" />
        </div>
        <div className="form-group">
          <label className="form-label">Site</label>
          <select className="form-select">
            <option value="">All Sites</option>
            <option value="site-a">Site A</option>
            <option value="site-b">Site B</option>
            <option value="site-c">Site C</option>
          </select>
        </div>
        <div className="form-group" style={{ alignSelf: 'end' }}>
          <button type="submit" className="btn btn-primary">🔍 Generate Report</button>
        </div>
      </FilterGroup>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button className="btn btn-success">📊 Export to Excel</button>
        <button className="btn btn-secondary">📄 Export to PDF</button>
        <button className="btn btn-secondary">📧 Email Report</button>
      </div>
      <TableComponent
        headers={reportHeaders}
        data={reportData}
        renderRow={(row) => (
          <>
            <td>{row.date}</td>
            <td>{row.site}</td>
            <td>{row.vehicle}</td>
            <td>{row.operator}</td>
            <td>{row.fuelUsed}</td>
            <td>{row.efficiency}</td>
            <td>
              <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                👁️ View
              </button>
            </td>
          </>
        )}
      />
    </div>
  );
}

export default Reports;
