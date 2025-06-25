import React, { useState } from "react";
import "../styles/pages.css";

function FuelReceiving() {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const generateInvoice = () => {
    alert("Generating receiving invoice... (Placeholder)");
  };

  const resetForm = () => {
    // In a real app, reset form state here
  };

  return (
    <div id="receiving" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998' }}>Fuel Receiving Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Receipt Number</label>
            <input type="text" className="form-input" value="RCP-2025-001234" readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">Date & Time</label>
            <input type="datetime-local" className="form-input" defaultValue="2025-06-21T10:30" />
          </div>
          <div className="form-group">
            <label className="form-label">Quantity (Liters)</label>
            <input type="number" className="form-input" placeholder="Enter quantity" min="0" step="0.1" required />
          </div>
          <div className="form-group">
            <label className="form-label">Tank</label>
            <select className="form-select" required>
              <option value="">Select Tank</option>
              <option value="garage-43">Tank Garage-43 (20,000L) - Momin</option>
              <option value="seliya">Tank Seliya (20,000L) - Tanul</option>
              <option value="um-salal">Tank Um Salal (80,000L) - Abdullah</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Received By</label>
            <select className="form-select" required>
              <option value="">Select Employee</option>
              <option value="momin">Momin (Tank In-charge)</option>
              <option value="tanul">Tanul (Tank In-charge)</option>
              <option value="abdullah">Abdullah (Tank In-charge)</option>
              <option value="emp-001">John Doe (ID: EMP-001)</option>
              <option value="emp-002">Jane Smith (ID: EMP-002)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Supplier Name</label>
            <select className="form-select" required>
              <option value="">Select Supplier</option>
              <option value="sup-001">Qatar Fuel Company</option>
              <option value="sup-002">Gulf Energy Ltd.</option>
              <option value="sup-003">Doha Petroleum</option>
              <option value="sup-004">Al Rayyan Fuel Supply</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input type="tel" className="form-input" placeholder="+974 XXXX XXXX" pattern="\+974 [0-9]{4} [0-9]{4}" />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <input type="text" className="form-input" placeholder="Additional notes" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary">
            💾 Save Receipt
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
      {showSuccessAlert && (
        <div className="alert alert-success" style={{ marginTop: '20px' }}>
          <span>✅</span>
          <span>Fuel receipt recorded successfully!</span>
        </div>
      )}
    </div>
  );
}

export default FuelReceiving;
