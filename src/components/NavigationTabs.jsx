import React from "react";
import "../styles/components.css";
import { NavLink } from "react-router-dom";
import { useUserStore } from "../store/userStore.js";

const allNavItems = [
  { id: 'dashboard', iconClass: 'fas fa-tachometer-alt', label: 'Dashboard', path: '/', roles: ['diesel-manager', 'site-incharge', 'admin'] },
  { id: 'receiving', iconClass: 'fas fa-truck-loading', label: 'Fuel Receiving', path: '/receiving', roles: ['diesel-manager', 'admin'] },
  { id: 'consumption', iconClass: 'fas fa-gas-pump', label: 'Fuel Consumption', path: '/consumption', roles: ['diesel-manager', 'driver', 'site-incharge', 'admin'] },
  { id: 'reports', iconClass: 'fas fa-chart-line', label: 'Reports', path: '/reports', roles: ['diesel-manager', 'admin'] },
  { id: 'invoices', iconClass: 'fas fa-file-invoice-dollar', label: 'Invoices', path: '/invoices', roles: ['diesel-manager', 'admin'] },
  { id: 'audit', iconClass: 'fas fa-clipboard-list', label: 'Audit Trail', path: '/audit', roles: ['diesel-manager', 'admin'] },
  { id: 'user-management', iconClass: 'fas fa-users-cog', label: 'User Management', path: '/user-management', roles: ['admin'] },
];

const NavigationTabs = () => {
  const { user, profile } = useUserStore();
  
  // Get current user role
  const getCurrentUserRole = () => {
    const currentUser = profile || user;
    return currentUser?.role || 'Guest';
  };

  // Filter navigation items based on user role
  const getVisibleNavItems = () => {
    const userRole = getCurrentUserRole();
    return allNavItems.filter(item => item.roles.includes(userRole?.toLowerCase()));
  };

  const visibleNavItems = getVisibleNavItems();

  return (
    <div className="nav-tabs">
      {visibleNavItems.map((tab) => (
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
