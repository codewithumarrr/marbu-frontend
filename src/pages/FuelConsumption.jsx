import React, { useState } from "react";
import "../styles/pages.css";

function FuelConsumption() {
  const [thumbprintStatus, setThumbprintStatus] = useState("👆 Touch here to capture thumbprint");
  const [isThumbprintCaptured, setIsThumbprintCaptured] = useState(false);

  const captureThumbprint = () => {
    setIsThumbprintCaptured(true);
    setThumbprintStatus("✅ Thumbprint Captured!");
    setTimeout(() => {
      setIsThumbprintCaptured(false);
      setThumbprintStatus("👆 Touch here to capture thumbprint");
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to record consumption
  };

  const generateInvoice = () => {
    alert("Generating consumption invoice... (Placeholder)");
  };

  const resetForm = () => {
    setIsThumbprintCaptured(false);
    setThumbprintStatus("👆 Touch here to capture thumbprint");
    // In a real app, reset form state here
  };

  return (
    <div id="consumption" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998' }}>Fuel Consumption Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Vehicle/Equipment Type</label>
            <select className="form-select" required>
              <option value="">Select Type</option>
              <option value="excavator">Excavator</option>
              <option value="truck">Truck</option>
              <option value="dozer">Dozer</option>
              <option value="loader">Loader</option>
              <option value="crane">Crane</option>
              <option value="generator">Generator</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Plate Number / Machine ID</label>
            <input type="text" className="form-input" placeholder="Enter ID/Plate" required />
          </div>
          <div className="form-group">
            <label className="form-label">Date & Time</label>
            <input type="datetime-local" className="form-input" defaultValue="2025-06-21T10:30" required />
          </div>
          <div className="form-group">
            <label className="form-label">Job Number</label>
            <input type="text" className="form-input" placeholder="Enter job number" required />
          </div>
          <div className="form-group">
            <label className="form-label">Operator/Driver Name</label>
            <input type="text" className="form-input" placeholder="Enter operator name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Operator Mobile Number</label>
            <input type="tel" className="form-input" placeholder="+974 XXXX XXXX" pattern="\+974 [0-9]{4} [0-9]{4}" required />
          </div>
          <div className="form-group">
            <label className="form-label">Employee Number</label>
            <input type="text" className="form-input" placeholder="Employee ID" required />
          </div>
          <div className="form-group">
            <label className="form-label">Tank Source</label>
            <select className="form-select" required>
              <option value="">Select Tank</option>
              <option value="garage-43">Tank Garage-43 - Momin</option>
              <option value="seliya">Tank Seliya - Tanul</option>
              <option value="um-salal">Tank Um Salal - Abdullah</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity (Liters)</label>
            <input type="number" className="form-input" placeholder="Fuel consumed" min="0" step="0.1" required />
          </div>
          <div className="form-group">
            <label className="form-label">Odometer (Km) / Equipment Hours</label>
            <input type="number" className="form-input" placeholder="Current reading" min="0" required />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">Operator Thumbprint Authentication</label>
          <div
            className={`thumbprint-pad${isThumbprintCaptured ? " thumbprint-captured" : ""}`}
            onClick={captureThumbprint}
          >
            <span>{thumbprintStatus}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary">
            💾 Record Consumption
          </button>
          <button
            type="button"
            className="btn btn-invoice"
            onClick={generateInvoice}
          >
            📄 Generate Invoice
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetForm}
          >
            🔄 Reset Form
          </button>
        </div>
      </form>
    </div>
  );
}

export default FuelConsumption;
