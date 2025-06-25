import React from "react";
import "../styles/components.css";

function DashboardCard({ icon, title, value }) {
  return (
    <div className="dashboard-card">
      <span className="card-icon">{icon}</span>
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
    </div>
  );
}

export default DashboardCard;
