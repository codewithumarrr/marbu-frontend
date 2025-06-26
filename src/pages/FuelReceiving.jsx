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
import { generateReceivingInvoiceExcel } from "../utils/excelExport.js";

// Mock data for recent records
const recentRecords = [
  {
    receipt: 'RCP-2025-001',
    date: '2025-06-17 09:30',
    quantity: '2000 L',
    tank: 'Tank A',
    supplier: 'ABC Fuel Company',
    receivedBy: 'Fareed Khan',
  },
  // Add more records as needed
];

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
      // Generate invoice with default parameters - last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const response = await generateInvoiceFromReceiving({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        siteId: formValues.siteId || 1,
        generatedByUserId: "EMP001" // You might want to get this from user context
      });
      
      if (response?.data?.invoice?.invoice_number) {
        // Generate and download Excel file
        await generateReceivingInvoiceExcel(response.data);
        setSuccessMessage(`Invoice ${response.data.invoice.invoice_number} generated successfully! Total: QAR ${response.data.totalAmount.toFixed(2)} - Excel file downloaded`);
      } else {
        setSuccessMessage('Invoice generated successfully!');
      }
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

      {/* Recent Fuel Receiving Records Section */}
      <div style={{
        background: '#f4fafd',
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        marginTop: 40,
        padding: 0,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '28px 32px 0 32px',
        }}>
          <div style={{
            fontWeight: 800,
            fontSize: 32,
            color: '#23476a',
            letterSpacing: 0.5,
            marginBottom: 0,
          }}>
            Recent Fuel Receiving Records
          </div>
        </div>
        <div style={{
          width: '100%',
          height: 5,
          background: 'linear-gradient(90deg, #25b86f 0%, #2563eb 100%)',
          borderRadius: 8,
          margin: '10px 0 18px 0',
        }} />
        <div style={{ padding: '0 32px 32px 32px' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'transparent' }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                boxShadow: '0 8px 32px 0 rgba(37,99,235,0.18), 0 1.5px 0 #e0e7ef',
                zIndex: 10,
                position: 'relative',
                borderBottom: '3px solid #e0e7ef',
                transform: 'translateY(-12px)',
                marginBottom: 8,
                boxSizing: 'border-box',
                // Subtle inner shadow for depth
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.10))',
              }}>
                <th style={{ color: '#fff', fontWeight: 800, fontSize: 18, padding: '16px 24px', border: 'none', borderTopLeftRadius: 12, textAlign: 'left', letterSpacing: 1.2, borderRight: '1.5px solid rgba(255,255,255,0.18)' }}>Receipt #</th>
                <th style={{ color: '#fff', fontWeight: 800, fontSize: 18, padding: '16px 24px', border: 'none', textAlign: 'left', letterSpacing: 1.2, borderRight: '1.5px solid rgba(255,255,255,0.18)' }}>Date</th>
                <th style={{ color: '#fff', fontWeight: 800, fontSize: 18, padding: '16px 24px', border: 'none', textAlign: 'left', letterSpacing: 1.2, borderRight: '1.5px solid rgba(255,255,255,0.18)' }}>Quantity</th>
                <th style={{ color: '#fff', fontWeight: 800, fontSize: 18, padding: '16px 24px', border: 'none', textAlign: 'left', letterSpacing: 1.2, borderRight: '1.5px solid rgba(255,255,255,0.18)' }}>Tank</th>
                <th style={{ color: '#fff', fontWeight: 800, fontSize: 18, padding: '16px 24px', border: 'none', textAlign: 'left', letterSpacing: 1.2, borderRight: '1.5px solid rgba(255,255,255,0.18)' }}>Supplier</th>
                <th style={{ color: '#fff', fontWeight: 800, fontSize: 18, padding: '16px 24px', border: 'none', textAlign: 'left', letterSpacing: 1.2, borderRight: '1.5px solid rgba(255,255,255,0.18)' }}>Received By</th>
                <th style={{ color: '#fff', fontWeight: 800, fontSize: 18, padding: '16px 24px', border: 'none', borderTopRightRadius: 12, textAlign: 'left', letterSpacing: 1.2 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((rec, idx) => (
                <tr key={idx} style={{
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  borderRadius: 10,
                  marginTop: 8,
                  marginBottom: 8,
                  height: 60,
                }}>
                  <td style={{ padding: '14px 24px', fontWeight: 500, textAlign: 'left' }}>{rec.receipt}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'left' }}>{rec.date}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'left' }}>{rec.quantity}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'left' }}>{rec.tank}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'left' }}>{rec.supplier}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'left' }}>{rec.receivedBy}</td>
                  <td style={{ padding: '14px 24px', textAlign: 'left' }}>
                    <button style={{
                      background: 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 22px',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: 'pointer',
                      letterSpacing: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}>
                      <span style={{ fontSize: 18, marginRight: 4 }}>✏️</span> EDIT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
