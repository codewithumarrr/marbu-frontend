import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import NavigationTabs from "./components/NavigationTabs";
import Dashboard from "./pages/Dashboard";
import FuelReceiving from "./pages/FuelReceiving";
import FuelUsage from "./pages/FuelUsage.jsx";
import Reports from "./pages/Reports";
import Invoices from "./pages/Invoices";
import AuditTrail from "./pages/AuditTrail";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import InvoiceView from './pages/InvoiceView';
import { isAuthenticated, initializeServices } from "./services/index.js";
import { useUserStore } from "./store/userStore.js";
import "./styles/App.css";

function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, profile } = useUserStore();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If no specific roles required, just check authentication
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  const currentUser = profile || user;
  console.log("Current User:", currentUser);
  const userRole = currentUser?.role;
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; // Redirect to dashboard if no access
  }

  return children;
}

function App() {
  const location = useLocation();
  const hideHeaderNav = location.pathname === '/login';

  return (
    <div className="container">
      {!hideHeaderNav && <Header />}
      {!hideHeaderNav && <NavigationTabs />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute allowedRoles={['diesel-manager', 'site-incharge', 'admin', 'driver', 'operator']}><Dashboard /></PrivateRoute>} />
        <Route path="/receiving" element={<PrivateRoute allowedRoles={['diesel-manager', 'admin']}><FuelReceiving /></PrivateRoute>} />
        <Route path="/usage" element={<PrivateRoute allowedRoles={['diesel-manager', 'driver', 'site-incharge', 'admin']}><FuelUsage /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute allowedRoles={['diesel-manager', 'admin']}><Reports /></PrivateRoute>} />
        <Route path="/invoices" element={<PrivateRoute allowedRoles={['diesel-manager', 'admin']}><Invoices /></PrivateRoute>} />
        <Route path="/invoice/:id" element={<InvoiceView />} />
        <Route path="/audit" element={<PrivateRoute allowedRoles={['diesel-manager', 'admin']}><AuditTrail /></PrivateRoute>} />
        <Route path="/user-management" element={<PrivateRoute allowedRoles={['admin']}><UserManagement /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
