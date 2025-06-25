import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import NavigationTabs from "./components/NavigationTabs";
import Dashboard from "./pages/Dashboard";
import FuelReceiving from "./pages/FuelReceiving";
import FuelConsumption from "./pages/FuelConsumption";
import Reports from "./pages/Reports";
import Invoices from "./pages/Invoices";
import AuditTrail from "./pages/AuditTrail";
import "./styles/App.css";

function App() {
  return (
    <div className="container">
      <Header />
      <NavigationTabs />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/receiving" element={<FuelReceiving />} />
        <Route path="/consumption" element={<FuelConsumption />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/audit" element={<AuditTrail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
