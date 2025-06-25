import React from "react";
import "../styles/components.css";
import { NavLink } from "react-router-dom";

const tabs = [
  { id: "dashboard", icon: "📊", name: "Dashboard", path: "/" },
  { id: "receiving", icon: "⬇️", name: "Fuel Receiving", path: "/receiving" },
  { id: "consumption", icon: "⬆️", name: "Fuel Consumption", path: "/consumption" },
  { id: "reports", icon: "📋", name: "Reports", path: "/reports" },
  { id: "invoices", icon: "📋", name: "Invoices", path: "/invoices" },
  { id: "audit", icon: "🔍", name: "Audit Trail", path: "/audit" },
];

function NavigationTabs() {
  return (
    <div className="nav-tabs">
      {tabs.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.path}
          end={tab.path === "/"}
          className={({ isActive }) =>
            `nav-tab${isActive ? " active" : ""}`
          }
        >
          {tab.icon} {tab.name}
        </NavLink>
      ))}
    </div>
  );
}

export default NavigationTabs;
