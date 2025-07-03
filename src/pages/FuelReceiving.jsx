import React, { useState, useEffect, useRef } from "react";
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


function FuelReceiving() {
  const [formData, setFormData] = useState({
    tanks: [],
    employees: [],
    suppliers: [],
    receiptNumber: ''
  });

  const getCurrentDateTime = () => {
      // Use device's current date/time in local timezone, formatted for input[type="datetime-local"]
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const local = new Date(now.getTime() - offset * 60000);
      return local.toISOString().slice(0, 16);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formValues, setFormValues] = useState({
    receiptNumber: '',
    dateTime: getCurrentDateTime(),
    quantity: '',
    tankId: '',
    receivedBy: '',
    supplierId: '',
    customSupplierName: '',
    dieselRate: '',
    notes: '',
    siteId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const [signatureData, setSignatureData] = useState('');

  // Pagination and data state
  const [receivingRecords, setReceivingRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recordsPerPage] = useState(4);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Edit state
  const [editingRecord, setEditingRecord] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');
  // For delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Ref for custom supplier input
  const customSupplierRef = useRef(null);

  // Load form data on component mount
  useEffect(() => {
    loadFormData();
    loadReceivingRecords();
    // eslint-disable-next-line
  }, []);

  // Load records when page changes
  useEffect(() => {
    loadReceivingRecords();
    // eslint-disable-next-line
  }, [currentPage]);

  // Auto-focus custom supplier field when "Other" is selected
  useEffect(() => {
    if (formValues.supplierId === "other" && customSupplierRef.current) {
      customSupplierRef.current.focus();
    }
  }, [formValues.supplierId]);

  const loadReceivingRecords = async () => {
    setIsLoadingRecords(true);
    setError('');
    try {
      // Use API data only, support both paginated and non-paginated backend responses
      const response = await getAllDieselReceiving({
        page: currentPage,
        limit: recordsPerPage,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      // If response.data is an array, use it directly (non-paginated)
      if (Array.isArray(response?.data)) {
        setReceivingRecords(response.data);
        setTotalRecords(response.data.length);
        setTotalPages(1);
      } else {
        // Paginated (records/total)
        setReceivingRecords(response?.data?.records || []);
        setTotalRecords(response?.data?.total || 0);
        setTotalPages(Math.ceil((response?.data?.total || 0) / recordsPerPage));
      }
    } catch (err) {
      // On API error, show no records
      setReceivingRecords([]);
      setTotalRecords(0);
      setTotalPages(1);
      setError('Failed to load records');
    } finally {
      setIsLoadingRecords(false);
    }
  };

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

      // Use API data only
      const tanks = tanksRes?.data || [];
      const employees = employeesRes?.data || [];
      const suppliers = suppliersRes?.data || [];

      setFormData({
        tanks: tanks,
        employees: employees,
        suppliers: suppliers,
        receiptNumber: receiptRes?.data?.receiptNumber || 'RCP-2025-009'
      });
      setFormValues(prev => ({
        ...prev,
        receiptNumber: receiptRes?.data?.receiptNumber || 'RCP-2025-009'
      }));
    } catch (err) {
      // On API error, show empty dropdowns
      setFormData({
        tanks: [],
        employees: [],
        suppliers: [],
        receiptNumber: ''
      });
      setFormValues(prev => ({
        ...prev,
        receiptNumber: ''
      }));
      setError('Failed to load form data');
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
      // Prepare the payload with signature data
      const payload = {
        ...formValues,
        supplierId: formValues.supplierId === 'other' ? formValues.customSupplierName : formValues.supplierId ?? null,
        signatureData: signatureData,
        signatureCaptured: signatureCaptured
      };

      // The backend expects receivedBy as employee_number (ID), not name
      await createDieselReceiving(payload);
      setSuccessMessage('Fuel receiving record created successfully!');
      
      // Reset form on success
      setFormValues({
        receiptNumber: formData?.receiptNumber || '',
        dateTime: getCurrentDateTime(),
        quantity: '',
        tankId: '',
        receivedBy: '',
        supplierId: '',
        customSupplierName: '',
        dieselRate: '',
        notes: '',
        siteId: ''
      });
      setSignatureCaptured(false);
      setSignatureData('');
      setSubmitted(false);
      
      // Load new receipt number and dropdowns
      loadFormData();
      // Reload records to show the new entry
      setCurrentPage(1); // Go to first page to show the new record
      loadReceivingRecords();
    } catch (err) {
      setError('Failed to create record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (recordId) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getDieselReceivingById(recordId);
      const record = response?.data;
      if (record) {
        setEditingRecord(record);
        setFormValues({
          receiptNumber: record.receipt_number,
          dateTime: record.received_datetime ? new Date(record.received_datetime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
          quantity: record.quantity_liters,
          tankId: record.tank_id,
          receivedBy: record.received_by_user_id,
          supplierId: record.supplier_id,
          customSupplierName: record.custom_supplier_name || '',
          dieselRate: record.diesel_rate || '',
          notes: record.notes,
          siteId: record.site_id,
        });
        setSubmitted(false);
      }
    } catch (err) {
      setError('Record not found for editing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (!validateForm()) return;
    setIsUpdating(true);
    setError('');
    setSuccessMessage('');
    try {
      await updateDieselReceiving(editingRecord.receiving_id, {
        receiptNumber: formValues.receiptNumber,
        dateTime: formValues.dateTime,
        quantity: formValues.quantity,
        tankId: formValues.tankId,
        receivedBy: formValues.receivedBy,
        supplierId: formValues.supplierId,
        customSupplierName: formValues.customSupplierName,
        dieselRate: formValues.dieselRate,
        notes: formValues.notes,
        siteId: formValues.siteId,
      });
      setSuccessModalMessage('Fuel receiving record updated successfully!');
      setShowSuccessModal(true);
      setEditingRecord(null);
      resetForm();
      loadReceivingRecords();
    } catch (err) {
      setError('Failed to update record');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    resetForm();
  };

  // Pagination functions
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
      customSupplierName: '',
      dieselRate: '',
      notes: '',
      siteId: ''
    });
    setFormErrors({});
    setSubmitted(false);
  };

  // Helper function to get display name for employee
  const getEmployeeDisplayName = (employeeId) => {
    const employee = formData.employees.find(emp => emp.employee_number === employeeId);
    return employee ? (employee.display_name || employee.employee_name) : employeeId;
  };

  // Helper function to get tank name
  const getTankName = (tankId) => {
    const tank = formData.tanks.find(t => t.tank_id === tankId);
    return tank ? tank.tank_name : tankId;
  };

  // Helper function to get supplier name
  const getSupplierName = (supplierId) => {
    const supplier = formData.suppliers.find(s => s.supplier_id === supplierId);
    return supplier ? supplier.supplier_name : supplierId;
  };

  // Helper function to get selected tank location
  const getSelectedTankLocation = () => {
    const tank = formData.tanks.find(t => t.tank_id === formValues.tankId);
    return tank ? tank.site_name || tank.location : '';
  };

  // Helper function to get supplier rate
  const getSupplierRate = () => {
    const supplier = formData.suppliers.find(s => s.supplier_id === formValues.supplierId);
    return supplier ? supplier.dieselRate : '';
  };

  // Helper function to get employee role
  const getEmployeeRole = () => {
    const employee = formData.employees.find(e => e.employee_number === formValues.receivedBy);
    return employee ? employee.display_name || employee.employee_name : '';
  };

  // Helper function to calculate total cost
  const calculateTotalCost = () => {
    const quantity = parseFloat(formValues.quantity);
    const rate = parseFloat(formValues.dieselRate);
    return (quantity * rate).toFixed(2);
  };

  const handleDelete = (recordId) => {
    setDeleteId(recordId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    setError('');
    try {
      await deleteDieselReceiving(deleteId);
      setSuccessMessage('Fuel receiving record deleted successfully!');
      setShowDeleteModal(false);
      setDeleteId(null);
      loadReceivingRecords();
    } catch (err) {
      setError('Failed to delete record');
      setShowDeleteModal(false);
      setDeleteId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessModalMessage('');
  };

  return (
    <div id="receiving" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998', fontWeight: 700, fontSize: 27 }}>Fuel Receiving Entry</h2>

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
        <form onSubmit={editingRecord ? handleUpdate : handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Receipt Number</label>
              <input
                type="text"
                className="form-input"
                name="receiptNumber"
                value={formValues.receiptNumber}
                onChange={handleInputChange}
                disabled={isLoading}
                required
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
              <label className="form-label">Tank Location</label>
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
                    {tank.tank_name} - {tank.site_name || tank.location}
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
                <option value="other">Other (Enter manually)</option>
              </select>
              {submitted && formErrors.supplierId && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.supplierId}
                </div>
              )}
            </div>

            {formValues.supplierId === "other" && (
              <div className="form-group">
                <label className="form-label">Custom Supplier Name</label>
                <input
                  type="text"
                  className="form-input"
                  name="customSupplierName"
                  value={formValues.customSupplierName || ""}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  required
                  ref={customSupplierRef}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Diesel Rate (QAR/Liter)</label>
              <input
                type="number"
                className="form-input"
                name="dieselRate"
                value={formValues.dieselRate || ""}
                onChange={handleInputChange}
                placeholder="Enter diesel rate"
                min="0"
                step="0.01"
                required
              />
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

          {/* Signature/Fingerprint Section */}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}>
              <div style={{
                background: '#fff',
                padding: 32,
                borderRadius: 12,
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                textAlign: 'center'
              }}>
                <h3 style={{ marginBottom: 16 }}>Delete Record?</h3>
                <p>Are you sure you want to delete this fuel receiving record?</p>
                <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ background: '#dc2626', borderColor: '#dc2626' }}
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Receiver Signature/Fingerprint</label>
            <div
              className={`thumbprint-pad ${signatureCaptured ? 'thumbprint-captured' : ''}`}
              onClick={() => {
                setSignatureCaptured(!signatureCaptured);
                setSignatureData(signatureCaptured ? '' : `signature_${Date.now()}`);
              }}
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {signatureCaptured ? (
                <span>✅ Signature Captured - Click to remove</span>
              ) : (
                <span>👆 Click to capture signature/fingerprint</span>
              )}
            </div>
          </div> */}

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {editingRecord ? (
              <>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
                  style={{
                    opacity: isUpdating ? 0.6 : 1,
                    cursor: isUpdating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
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
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  🔄 Reset Form
                </button>
              </>
            )}
          </div>
        </form>
      )}

      {/* Recent Fuel Receiving Records Section */}
      <div style={{
       marginTop: 40,
      }}>
        <div>
          <div style={{
            fontWeight: 600,
            fontSize: 24,
            color: '#015998',
            marginBottom: 0,
          }}>
            Recent Fuel Receiving Records
          </div>
        </div>
        <div style={{
          width: '100%',
          height: 5,
          background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
          borderRadius: 8,
          margin: '10px 0 18px 0',
        }} />
        <div>
          {isLoadingRecords ? (
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
              <span style={{ color: '#666' }}>Loading records...</span>
            </div>
          ) : (
            <>
              <div className="table-container" style={{ overflowX: 'auto', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'transparent' }}>
                  <thead style={{ background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)' }}>
                    <tr>
                      <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: "nowrap"  }}>Receipt #</th>
                      <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: "nowrap"  }}>Date</th>
                      <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: "nowrap"  }}>Quantity</th>
                      <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: "nowrap"  }}>Diesel Rate</th>
                      <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: "nowrap"  }}>Tank</th>
                      <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: "nowrap"  }}>Supplier</th>
                      <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: "nowrap"  }}>Received By</th>
                      <th style={{ color: '#fff', textAlign: 'left', fontWeight: 600, padding: 15, whiteSpace: "nowrap"  }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivingRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ 
                          padding: '40px 24px', 
                          textAlign: 'center', 
                          color: '#666',
                          fontSize: '16px',
                          fontWeight: '500'
                        }}>
                          No records found
                        </td>
                      </tr>
                    ) : (
                      [...receivingRecords]?.reverse()?.map((rec, idx) => (
                        <tr key={rec.id || idx} style={{
                          background: '#fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          borderRadius: 10,
                          marginTop: 8,
                          marginBottom: 8,
                          height: 60,
                        }}>
                          <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', fontWeight: 500, textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)', whiteSpace: 'nowrap' }}>
                            {rec.receipt_number}
                          </td>
                          <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)', whiteSpace: 'nowrap' }}>
                            {rec.received_datetime ? new Date(rec.received_datetime).toLocaleString() :
                             rec.created_at ? new Date(rec.created_at).toLocaleString() : 'N/A'}
                          </td>
                          <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)', whiteSpace: 'nowrap' }}>
                            {rec.quantity_liters} L
                          </td>
                          <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)', whiteSpace: 'nowrap' }}>
                            {typeof rec.diesel_rate === 'number' ? `QAR ${rec.diesel_rate}` : 'N/A'}
                          </td>
                          <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)', whiteSpace: 'nowrap' }}>
                            {rec.tanks?.tank_name || rec.tank_id || 'N/A'}
                          </td>
                          <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)', whiteSpace: 'nowrap' }}>
                            {rec.suppliers?.supplier_name || rec.custom_supplier_name || rec.supplier_id || 'N/A'}
                          </td>
                          <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)', whiteSpace: 'nowrap' }}>
                            {rec.received_by_user?.employee_name || rec.received_by_user_id || 'N/A'}
                          </td>
                          <td style={{ padding: 'clamp(10px, 2vw, 14px) clamp(16px, 2vw, 24px)', textAlign: 'left', fontSize: 'clamp(12px, 1.5vw, 14px)' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <button 
                                onClick={() => handleEdit(rec.receiving_id)}
                                style={{
                                  background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '6px 16px',
                                  fontWeight: 700,
                                  fontSize: 15,
                                  cursor: 'pointer',
                                  letterSpacing: 1,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                                }}
                              >
                                <span style={{ fontSize: 18, marginRight: 4 }}><i class="fa fa-pencil" aria-hidden="true"></i></span> 
                              </button>
                              <button
                                onClick={() => handleDelete(rec.receiving_id)}
                                style={{
                                  background: '#dc2626',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '6px 16px',
                                  fontWeight: 700,
                                  fontSize: 15,
                                  cursor: 'pointer',
                                  letterSpacing: 1,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                                  transition: 'background 0.2s',
                                }}
                              >
                                <span style={{ fontSize: 18, marginRight: 4 }}><i class="fa fa-trash" aria-hidden="true"></i> </span> 
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '24px',
                  padding: '16px 0'
                }}>
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    style={{
                      background: currentPage === 1 ? '#e5e7eb' : 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
                      color: currentPage === 1 ? '#9ca3af' : '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontWeight: 600,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ← Previous
                  </button>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        style={{
                          background: currentPage === page ? 'linear-gradient(135deg, #25b86f 0%, #015998 100%)' : '#fff',
                          color: currentPage === page ? '#fff' : '#374151',
                          border: currentPage === page ? 'none' : '1px solid #d1d5db',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontWeight: currentPage === page ? 700 : 500,
                          cursor: 'pointer',
                          fontSize: '14px',
                          minWidth: '40px'
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    style={{
                      background: currentPage === totalPages ? '#e5e7eb' : 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
                      color: currentPage === totalPages ? '#9ca3af' : '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontWeight: 600,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Records Info */}
              <div style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px',
                marginTop: '16px'
              }}>
                Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords} records
              </div>
            </>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: '#fff',
            padding: 32,
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <span style={{ fontSize: '24px', color: '#fff' }}>✅</span>
            </div>
            <h3 style={{ marginBottom: 16, color: '#015998', fontSize: '20px', fontWeight: '600' }}>
              Success!
            </h3>
            <p style={{ marginBottom: 24, color: '#374151', fontSize: '16px' }}>
              {successModalMessage}
            </p>
            <button
              className="btn btn-primary"
              onClick={closeSuccessModal}
              style={{
                background: 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* CSS for animations and responsiveness */}
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
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .form-input, .form-select, input, select, textarea {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 900px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .table-container {
            padding: 0 0 12px 0;
          }
        }
        @media (max-width: 600px) {
          .content-panel {
            padding: 8px !important;
          }
          .form-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .form-input, .form-select, input, select, textarea {
            width: 100%;
            max-width: 100%;
            min-width: 0;
          }
          .table-container {
            overflow-x: auto;
            border-radius: 8px;
          }
          table {
            font-size: 13px;
          }
          th, td {
            padding: 8px 8px !important;
          }
          h2, .recent-title {
            font-size: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default FuelReceiving;
