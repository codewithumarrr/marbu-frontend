import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import NavigationTabs from "./components/NavigationTabs";
import Dashboard from "./pages/Dashboard";
import FuelReceiving from "./pages/FuelReceiving";
import FuelConsumption from "./pages/FuelConsumption";
import Reports from "./pages/Reports";
import Invoices from "./pages/Invoices";
import AuditTrail from "./pages/AuditTrail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./styles/App.css";

function isAuthenticated() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  const location = useLocation();
  const hideHeaderNav = location.pathname === '/login' || location.pathname === '/signup';
  return (
    <div className="container">
      {!hideHeaderNav && <Header />}
      {!hideHeaderNav && <NavigationTabs />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/receiving" element={<PrivateRoute><FuelReceiving /></PrivateRoute>} />
        <Route path="/consumption" element={<PrivateRoute><FuelConsumption /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/invoices" element={<PrivateRoute><Invoices /></PrivateRoute>} />
        <Route path="/audit" element={<PrivateRoute><AuditTrail /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
