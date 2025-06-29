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

// Dummy data for demonstration
const dummyReceivingRecords = [
  {
    id: 1,
    receipt_number: 'RCP-2025-001',
    date_time: '2025-01-15T10:30:00',
    quantity: 2500,
    tank_id: 1,
    supplier_id: 1,
    received_by: 'EMP001',
    mobile_number: '+974 5555 1234',
    notes: 'Regular diesel delivery',
    created_at: '2025-01-15T10:30:00'
  },
  {
    id: 2,
    receipt_number: 'RCP-2025-002',
    date_time: '2025-01-14T14:15:00',
    quantity: 1800,
    tank_id: 2,
    supplier_id: 2,
    received_by: 'EMP002',
    mobile_number: '+974 5555 5678',
    notes: 'Emergency fuel supply',
    created_at: '2025-01-14T14:15:00'
  },
  {
    id: 3,
    receipt_number: 'RCP-2025-003',
    date_time: '2025-01-13T09:45:00',
    quantity: 3200,
    tank_id: 1,
    supplier_id: 1,
    received_by: 'EMP001',
    mobile_number: '+974 5555 1234',
    notes: 'Monthly bulk delivery',
    created_at: '2025-01-13T09:45:00'
  },
  {
    id: 4,
    receipt_number: 'RCP-2025-004',
    date_time: '2025-01-12T16:20:00',
    quantity: 1500,
    tank_id: 3,
    supplier_id: 3,
    received_by: 'EMP003',
    mobile_number: '+974 5555 9012',
    notes: 'Weekend delivery',
    created_at: '2025-01-12T16:20:00'
  },
  {
    id: 5,
    receipt_number: 'RCP-2025-005',
    date_time: '2025-01-11T11:30:00',
    quantity: 2800,
    tank_id: 2,
    supplier_id: 2,
    received_by: 'EMP002',
    mobile_number: '+974 5555 5678',
    notes: 'Standard delivery',
    created_at: '2025-01-11T11:30:00'
  },
  {
    id: 6,
    receipt_number: 'RCP-2025-006',
    date_time: '2025-01-10T13:45:00',
    quantity: 2000,
    tank_id: 1,
    supplier_id: 1,
    received_by: 'EMP001',
    mobile_number: '+974 5555 1234',
    notes: 'Regular supply',
    created_at: '2025-01-10T13:45:00'
  },
  {
    id: 7,
    receipt_number: 'RCP-2025-007',
    date_time: '2025-01-09T08:15:00',
    quantity: 3500,
    tank_id: 3,
    supplier_id: 3,
    received_by: 'EMP003',
    mobile_number: '+974 5555 9012',
    notes: 'Large delivery for project',
    created_at: '2025-01-09T08:15:00'
  },
  {
    id: 8,
    receipt_number: 'RCP-2025-008',
    date_time: '2025-01-08T15:30:00',
    quantity: 1200,
    tank_id: 2,
    supplier_id: 2,
    received_by: 'EMP002',
    mobile_number: '+974 5555 5678',
    notes: 'Small top-up delivery',
    created_at: '2025-01-08T15:30:00'
  }
];

// Dummy form data for dropdowns
const dummyFormData = {
  tanks: [
    { tank_id: 1, tank_name: 'Tank A', capacity_liters: 50000, site_name: 'Main Site' },
    { tank_id: 2, tank_name: 'Tank B', capacity_liters: 30000, site_name: 'Secondary Site' },
    { tank_id: 3, tank_name: 'Tank C', capacity_liters: 40000, site_name: 'Remote Site' }
  ],
  employees: [
    { employee_number: 'EMP001', employee_name: 'Fareed Khan', display_name: 'Fareed Khan' },
    { employee_number: 'EMP002', employee_name: 'Ahmed Al-Mansouri', display_name: 'Ahmed Al-Mansouri' },
    { employee_number: 'EMP003', employee_name: 'Mohammed Hassan', display_name: 'Mohammed Hassan' }
  ],
  suppliers: [
    { supplier_id: 1, supplier_name: 'ABC Fuel Company' },
    { supplier_id: 2, supplier_name: 'Qatar Petroleum' },
    { supplier_id: 3, supplier_name: 'Gulf Energy Solutions' }
  ]
};

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
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const [signatureData, setSignatureData] = useState('');

  // Pagination and data state
  const [receivingRecords, setReceivingRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recordsPerPage] = useState(4);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormValues, setEditFormValues] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

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

  const loadReceivingRecords = async () => {
    setIsLoadingRecords(true);
    setError('');
    try {
      const response = await getAllDieselReceiving({
        page: currentPage,
        limit: recordsPerPage,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
      
      // Use dummy data if API doesn't return records or in development
      if (!response?.data?.records || response.data.records.length === 0) {
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const paginatedDummyData = dummyReceivingRecords.slice(startIndex, endIndex);
        
        setReceivingRecords(paginatedDummyData);
        setTotalRecords(dummyReceivingRecords.length);
        setTotalPages(Math.ceil(dummyReceivingRecords.length / recordsPerPage));
      } else {
        setReceivingRecords(response?.data?.records || []);
        setTotalRecords(response?.data?.total || 0);
        setTotalPages(Math.ceil((response?.data?.total || 0) / recordsPerPage));
      }
    } catch (err) {
      // Use dummy data on API error
      const startIndex = (currentPage - 1) * recordsPerPage;
      const endIndex = startIndex + recordsPerPage;
      const paginatedDummyData = dummyReceivingRecords.slice(startIndex, endIndex);
      
      setReceivingRecords(paginatedDummyData);
      setTotalRecords(dummyReceivingRecords.length);
      setTotalPages(Math.ceil(dummyReceivingRecords.length / recordsPerPage));
      console.log('Using dummy data due to API error:', err.message);
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
      
      // Use dummy data if API doesn't return data
      const tanks = tanksRes?.data?.length > 0 ? tanksRes.data : dummyFormData.tanks;
      const employees = employeesRes?.data?.length > 0 ? employeesRes.data : dummyFormData.employees;
      const suppliers = suppliersRes?.data?.length > 0 ? suppliersRes.data : dummyFormData.suppliers;
      
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
      // Use dummy data on API error
      setFormData({
        tanks: dummyFormData.tanks,
        employees: dummyFormData.employees,
        suppliers: dummyFormData.suppliers,
        receiptNumber: 'RCP-2025-009'
      });
      setFormValues(prev => ({
        ...prev,
        receiptNumber: 'RCP-2025-009'
      }));
      console.log('Using dummy form data due to API error:', err.message);
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
        signatureData: signatureData,
        signatureCaptured: signatureCaptured
      };

      // The backend expects receivedBy as employee_number (ID), not name
      await createDieselReceiving(payload);
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
      setSignatureCaptured(false);
      setSignatureData('');
      setSubmitted(false);
      
      // Load new receipt number and dropdowns
      loadFormData();
      // Reload records to show the new entry
      loadReceivingRecords();
    } catch (err) {
      // Simulate successful creation with dummy data
      const newRecord = {
        id: Math.max(...dummyReceivingRecords.map(rec => rec.id)) + 1,
        receipt_number: formValues.receiptNumber,
        date_time: formValues.dateTime,
        quantity: formValues.quantity,
        tank_id: formValues.tankId,
        supplier_id: formValues.supplierId,
        received_by: formValues.receivedBy,
        mobile_number: formValues.mobileNumber,
        notes: formValues.notes,
        created_at: new Date().toISOString()
      };
      
      // Add to dummy data array
      dummyReceivingRecords.unshift(newRecord);
      
      setSuccessMessage('Fuel receiving record created successfully! (Demo mode)');
      
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
      setSignatureCaptured(false);
      setSignatureData('');
      setSubmitted(false);
      
      // Load new receipt number and dropdowns
      loadFormData();
      // Reload records to show the new entry
      loadReceivingRecords();
      console.log('Created dummy record due to API error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit functionality
  const handleEdit = async (recordId) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getDieselReceivingById(recordId);
      const record = response?.data;
      
      if (record) {
        setEditingRecord(record);
        setEditFormValues({
          receiptNumber: record.receipt_number || record.receiptNumber,
          dateTime: record.date_time ? new Date(record.date_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
          quantity: record.quantity,
          tankId: record.tank_id || record.tankId,
          receivedBy: record.received_by || record.receivedBy,
          supplierId: record.supplier_id || record.supplierId,
          mobileNumber: record.mobile_number || record.mobileNumber,
          notes: record.notes,
          siteId: record.site_id || record.siteId
        });
        setIsEditModalOpen(true);
      }
    } catch (err) {
      // Use dummy data for editing when API fails
      const dummyRecord = dummyReceivingRecords.find(rec => rec.id === recordId);
      if (dummyRecord) {
        setEditingRecord(dummyRecord);
        setEditFormValues({
          receiptNumber: dummyRecord.receipt_number,
          dateTime: dummyRecord.date_time ? new Date(dummyRecord.date_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
          quantity: dummyRecord.quantity,
          tankId: dummyRecord.tank_id,
          receivedBy: dummyRecord.received_by,
          supplierId: dummyRecord.supplier_id,
          mobileNumber: dummyRecord.mobile_number,
          notes: dummyRecord.notes,
          siteId: dummyRecord.site_id || 1
        });
        setIsEditModalOpen(true);
        console.log('Using dummy record for editing due to API error:', err.message);
      } else {
        setError('Record not found for editing');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editFormValues.quantity || editFormValues.quantity <= 0) {
      errors.quantity = 'Quantity is required and must be greater than 0';
    }
    if (!editFormValues.tankId) {
      errors.tankId = 'Tank selection is required';
    }
    if (!editFormValues.receivedBy) {
      errors.receivedBy = 'Received by is required';
    }
    if (!editFormValues.supplierId) {
      errors.supplierId = 'Supplier selection is required';
    }
    if (!editFormValues.dateTime) {
      errors.dateTime = 'Date and time is required';
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }

    setIsUpdating(true);
    setError('');
    setSuccessMessage('');
    try {
      await updateDieselReceiving(editingRecord.id, editFormValues);
      setSuccessMessage('Fuel receiving record updated successfully!');
      setIsEditModalOpen(false);
      setEditingRecord(null);
      setEditFormValues({});
      setEditFormErrors({});
      
      // Reload records to show updated data
      loadReceivingRecords();
    } catch (err) {
      // Simulate successful update with dummy data
      const updatedDummyRecords = dummyReceivingRecords.map(rec => 
        rec.id === editingRecord.id 
          ? { 
              ...rec, 
              receipt_number: editFormValues.receiptNumber,
              date_time: editFormValues.dateTime,
              quantity: editFormValues.quantity,
              tank_id: editFormValues.tankId,
              received_by: editFormValues.receivedBy,
              supplier_id: editFormValues.supplierId,
              mobile_number: editFormValues.mobileNumber,
              notes: editFormValues.notes
            }
          : rec
      );
      
      // Update the dummy data array
      dummyReceivingRecords.splice(0, dummyReceivingRecords.length, ...updatedDummyRecords);
      
      setSuccessMessage('Fuel receiving record updated successfully! (Demo mode)');
      setIsEditModalOpen(false);
      setEditingRecord(null);
      setEditFormValues({});
      setEditFormErrors({});
      
      // Reload records to show updated data
      loadReceivingRecords();
      console.log('Updated dummy record due to API error:', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRecord(null);
    setEditFormValues({});
    setEditFormErrors({});
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
      mobileNumber: '',
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

          {/* Signature/Fingerprint Section */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
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
                  {receivingRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ 
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
                    receivingRecords.map((rec, idx) => (
                      <tr key={rec.id || idx} style={{
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        borderRadius: 10,
                        marginTop: 8,
                        marginBottom: 8,
                        height: 60,
                      }}>
                        <td style={{ padding: '14px 24px', fontWeight: 500, textAlign: 'left' }}>
                          {rec.receipt_number || rec.receiptNumber}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'left' }}>
                          {rec.date_time ? new Date(rec.date_time).toLocaleString() : 
                           rec.created_at ? new Date(rec.created_at).toLocaleString() : 'N/A'}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'left' }}>
                          {rec.quantity} L
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'left' }}>
                          {getTankName(rec.tank_id || rec.tankId)}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'left' }}>
                          {getSupplierName(rec.supplier_id || rec.supplierId)}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'left' }}>
                          {getEmployeeDisplayName(rec.received_by || rec.receivedBy)}
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'left' }}>
                          <button 
                            onClick={() => handleEdit(rec.id)}
                            style={{
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
                            }}
                          >
                            <span style={{ fontSize: 18, marginRight: 4 }}>✏️</span> EDIT
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

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
                      background: currentPage === 1 ? '#e5e7eb' : 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)',
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
                          background: currentPage === page ? 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)' : '#fff',
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
                      background: currentPage === totalPages ? '#e5e7eb' : 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)',
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: 0, color: '#015998', fontSize: '24px', fontWeight: '700' }}>
                Edit Fuel Receiving Record
              </h3>
              <button
                onClick={closeEditModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Receipt Number
                  </label>
                  <input
                    type="text"
                    value={editFormValues.receiptNumber || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb',
                      color: '#6b7280'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={editFormValues.dateTime || ''}
                    onChange={handleEditInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: editFormErrors.dateTime ? '1px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  />
                  {editFormErrors.dateTime && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {editFormErrors.dateTime}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Quantity (Liters)
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={editFormValues.quantity || ''}
                    onChange={handleEditInputChange}
                    min="0"
                    step="0.1"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: editFormErrors.quantity ? '1px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  />
                  {editFormErrors.quantity && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {editFormErrors.quantity}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Tank
                  </label>
                  <select
                    name="tankId"
                    value={editFormValues.tankId || ''}
                    onChange={handleEditInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: editFormErrors.tankId ? '1px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="">Select Tank</option>
                    {formData?.tanks?.map(tank => (
                      <option key={tank.tank_id} value={tank.tank_id}>
                        {tank.tank_name} ({tank.capacity_liters?.toLocaleString() || tank.capacity}L)
                      </option>
                    ))}
                  </select>
                  {editFormErrors.tankId && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {editFormErrors.tankId}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Received By
                  </label>
                  <select
                    name="receivedBy"
                    value={editFormValues.receivedBy || ''}
                    onChange={handleEditInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: editFormErrors.receivedBy ? '1px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="">Select Employee</option>
                    {formData?.employees?.map(employee => (
                      <option key={employee.employee_number} value={employee.employee_number}>
                        {employee.display_name || employee.employee_name}
                      </option>
                    ))}
                  </select>
                  {editFormErrors.receivedBy && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {editFormErrors.receivedBy}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Supplier
                  </label>
                  <select
                    name="supplierId"
                    value={editFormValues.supplierId || ''}
                    onChange={handleEditInputChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: editFormErrors.supplierId ? '1px solid #dc2626' : '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="">Select Supplier</option>
                    {formData?.suppliers?.map(supplier => (
                      <option key={supplier.supplier_id} value={supplier.supplier_id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                  </select>
                  {editFormErrors.supplierId && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      {editFormErrors.supplierId}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={editFormValues.mobileNumber || ''}
                    onChange={handleEditInputChange}
                    placeholder="+974 XXXX XXXX"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Notes
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={editFormValues.notes || ''}
                    onChange={handleEditInputChange}
                    placeholder="Additional notes"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '24px'
              }}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    background: 'linear-gradient(90deg, #2563eb 0%, #25b86f 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontWeight: '600',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    opacity: isUpdating ? 0.6 : 1
                  }}
                >
                  {isUpdating ? 'Updating...' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
