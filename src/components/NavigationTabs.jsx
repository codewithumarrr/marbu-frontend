import React from "react";
import "../styles/components.css";
import { NavLink } from "react-router-dom";

const navItems = [
  { id: 'dashboard', iconClass: 'fas fa-tachometer-alt', label: 'Dashboard', path: '/' },
  { id: 'receiving', iconClass: 'fas fa-truck-loading', label: 'Fuel Receiving', path: '/receiving' },
  { id: 'consumption', iconClass: 'fas fa-gas-pump', label: 'Fuel Consumption', path: '/consumption' },
  { id: 'reports', iconClass: 'fas fa-chart-line', label: 'Reports', path: '/reports' },
  { id: 'invoices', iconClass: 'fas fa-file-invoice-dollar', label: 'Invoices', path: '/invoices' },
  { id: 'audit', iconClass: 'fas fa-clipboard-list', label: 'Audit Trail', path: '/audit' },
];

const NavigationTabs = () => {
  return (
    <div className="nav-tabs">
      {navItems.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.path}
          end={tab.path === "/"}
          className={({ isActive }) =>
            `nav-tab${isActive ? " active" : ""}`
          }
        >
          <i className={tab.iconClass} style={{ marginRight: 8 }}></i>{tab.label}
        </NavLink>
      ))}
    </div>
  );
}

export default NavigationTabs;
