import React from "react";
import "../styles/pages.css";
import DashboardCard from "../components/DashboardCard";
import TableComponent from "../components/TableComponent";

function Dashboard() {
  const activityHeaders = [
    "Date & Time",
    "Vehicle/Equipment",
    "Operator",
    "Mobile",
    "Quantity (L)",
    "Job Number",
    "Status",
  ];
  const activityData = [
    {
      date: "2025-06-21 10:30",
      vehicle: "Excavator EX-001",
      operator: "John Doe",
      mobile: "+974 5555 1234",
      quantity: 85,
      job: "JOB-2025-001",
      status: "Active",
    },
    {
      date: "2025-06-21 09:15",
      vehicle: "Truck TR-045",
      operator: "Mike Smith",
      mobile: "+974 5555 5678",
      quantity: 120,
      job: "JOB-2025-002",
      status: "Active",
    },
    {
      date: "2025-06-20 16:45",
      vehicle: "Dozer DZ-002",
      operator: "Sarah Wilson",
      mobile: "+974 5555 9012",
      quantity: 95,
      job: "JOB-2025-003",
      status: "Pending",
    },
  ];

  return (
    <div id="dashboard" className="content-panel active">
      <h2 style={{ marginBottom: '20px', color: '#015998' }}>Dashboard Overview</h2>
      <div className="dashboard-cards">
        <DashboardCard icon="⛽" title="Total Fuel Received" value="95,250 L" />
        <DashboardCard icon="🚛" title="Total Consumed" value="82,060 L" />
        <DashboardCard icon="📊" title="Current Stock" value="86,190 L" />
        <DashboardCard icon="🏭" title="Active Jobs" value="24" />
      </div>
      <div className="alert alert-warning">
        <span>⚠️</span>
        <span>Low fuel alert: Tank Seliya is below 50% capacity</span>
      </div>
      <TableComponent
        headers={activityHeaders}
        data={activityData}
        renderRow={(row) => (
          <>
            <td>{row.date}</td>
            <td>{row.vehicle}</td>
            <td>{row.operator}</td>
            <td>{row.mobile}</td>
            <td>{row.quantity}</td>
            <td>{row.job}</td>
            <td>
              <span className={`status-badge status-${row.status.toLowerCase()}`}>{row.status}</span>
            </td>
          </>
        )}
      />
    </div>
  );
}

export default Dashboard;
