import React, { useState, useEffect } from "react";
import "../styles/pages.css";
import {
  getAllDieselReceiving,
  getDieselReceivingById,
  createDieselReceiving,
  updateDieselReceiving,
  deleteDieselReceiving,
  getNextReceiptNumber,
  getTanksBySite,
  getTankInchargeEmployees,
  getActiveSuppliers,
  generateInvoiceFromReceiving
} from "../services/fuelReceivingService.js";

function FuelReceiving() {
  const [formData, setFormData] = useState({
    tanks: [],
    employees: [],
    suppliers: [],
    receiptNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formValues, setFormValues] = useState({
    receiptNumber: '',
    dateTime: new Date().toISOString().slice(0, 16),
    quantity: '',
    tankId: '',
    receivedBy: '',
    supplierId: '',
    mobileNumber: '',
    notes: '',
    siteId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Load form data on component mount
  useEffect(() => {
    loadFormData();
    // eslint-disable-next-line
  }, []);

  const loadFormData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Get next receipt number
      const receiptRes = await getNextReceiptNumber();
      // Get tanks (optionally by site)
      const tanksRes = await getTanksBySite(formValues.siteId || 1);
      // Get employees (tank in-charge)
      const employeesRes = await getTankInchargeEmployees();
      // Get suppliers
      const suppliersRes = await getActiveSuppliers();
      setFormData({
        tanks: tanksRes?.data || [],
        employees: employeesRes?.data || [],
        suppliers: suppliersRes?.data || [],
        receiptNumber: receiptRes?.data?.receiptNumber || ''
      });
      setFormValues(prev => ({
        ...prev,
        receiptNumber: receiptRes?.data?.receiptNumber || ''
      }));
      // Debug log for employees
      // eslint-disable-next-line
      console.log("Tank In-charge Employees:", employeesRes?.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear errors when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formValues.quantity || formValues.quantity <= 0) {
      errors.quantity = 'Quantity is required and must be greater than 0';
    }
    if (!formValues.tankId) {
      errors.tankId = 'Tank selection is required';
    }
    if (!formValues.receivedBy) {
      errors.receivedBy = 'Received by is required';
    }
    if (!formValues.supplierId) {
      errors.supplierId = 'Supplier selection is required';
    }
    if (!formValues.dateTime) {
      errors.dateTime = 'Date and time is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      // The backend expects receivedBy as employee_number (ID), not name
      await createDieselReceiving(formValues);
      setSuccessMessage('Fuel receiving record created successfully!');
      // Reset form on success
      setFormValues({
        receiptNumber: '',
        dateTime: new Date().toISOString().slice(0, 16),
        quantity: '',
        tankId: '',
        receivedBy: '',
        supplierId: '',
        mobileNumber: '',
        notes: '',
        siteId: ''
      });
      setSubmitted(false);
      // Load new receipt number and dropdowns
      loadFormData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Error creating fuel receiving');
    } finally {
      setIsLoading(false);
    }
  };


  const generateInvoice = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      // You may want to pass filters or site info as needed
      const response = await generateInvoiceFromReceiving({});
      setSuccessMessage('Invoice generated successfully!');
      // Optionally, show invoice details: response.invoice_number, etc.
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Error generating invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormValues({
      receiptNumber: formData?.receiptNumber || '',
      dateTime: new Date().toISOString().slice(0, 16),
      quantity: '',
      tankId: '',
      receivedBy: '',
      supplierId: '',
      mobileNumber: '',
      notes: '',
      siteId: ''
    });
    setFormErrors({});
    setSubmitted(false);
  };

  return (
    <div id="receiving" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998' }}>Fuel Receiving Entry</h2>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          <span>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !formData ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #015998',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ color: '#666' }}>Loading form data...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Receipt Number</label>
              <input
                type="text"
                className="form-input"
                name="receiptNumber"
                value={formValues.receiptNumber}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input
                type="datetime-local"
                className="form-input"
                name="dateTime"
                value={formValues.dateTime}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              {submitted && formErrors.dateTime && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.dateTime}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Quantity (Liters)</label>
              <input
                type="number"
                className="form-input"
                name="quantity"
                value={formValues.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                min="0"
                step="0.1"
                disabled={isLoading}
                required
              />
              {submitted && formErrors.quantity && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.quantity}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Tank</label>
              <select
                className="form-select"
                name="tankId"
                value={formValues.tankId}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              >
                <option value="">Select Tank</option>
                {formData?.tanks?.map(tank => (
                  <option key={tank.tank_id} value={tank.tank_id}>
                    {tank.tank_name} ({tank.capacity_liters?.toLocaleString() || tank.capacity}L) - {tank.site_name || tank.location}
                  </option>
                ))}
              </select>
              {submitted && formErrors.tankId && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.tankId}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Received By</label>
              <select
                className="form-select"
                name="receivedBy"
                value={formValues.receivedBy}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              >
                <option value="">Select Employee</option>
                {formData?.employees?.map(employee => (
                  <option key={employee.employee_number} value={employee.employee_number}>
                    {employee.display_name || `${employee.employee_name} (ID: ${employee.employee_number})`}
                  </option>
                ))}
              </select>
              {submitted && formErrors.receivedBy && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.receivedBy}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Supplier Name</label>
              <select
                className="form-select"
                name="supplierId"
                value={formValues.supplierId}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              >
                <option value="">Select Supplier</option>
                {formData?.suppliers?.map(supplier => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>
                    {supplier.supplier_name}
                  </option>
                ))}
              </select>
              {submitted && formErrors.supplierId && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.supplierId}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                name="mobileNumber"
                value={formValues.mobileNumber}
                onChange={handleInputChange}
                placeholder="+974 XXXX XXXX"
                pattern="\+974 [0-9]{4} [0-9]{4}"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <input
                type="text"
                className="form-input"
                name="notes"
                value={formValues.notes}
                onChange={handleInputChange}
                placeholder="Additional notes"
                disabled={isLoading}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    display: 'inline-block',
                    marginRight: '8px'
                  }}></div>
                  Saving...
                </>
              ) : (
                <>💾 Save Receipt</>
              )}
            </button>

            <button
              type="button"
              className="btn btn-invoice"
              onClick={generateInvoice}
              disabled={isLoading}
            >
              📄 Generate Invoice
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
              disabled={isLoading}
            >
              🔄 Reset Form
            </button>
          </div>
        </form>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}

export default FuelReceiving;
