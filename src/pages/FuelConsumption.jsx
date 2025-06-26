import React, { useState, useEffect } from "react";
import "../styles/pages.css";
import {
  getAllDieselConsumption,
  getDieselConsumptionById,
  createDieselConsumption,
  updateDieselConsumption,
  deleteDieselConsumption,
  getVehicleEquipmentTypes,
  getVehiclesByType,
  getActiveJobs,
  getOperatorEmployees,
  saveThumbprint
} from "../services/fuelConsumptionService.js";
 import { generateInvoiceFromConsumption } from "../services/invoicesService.js";
 import { generateInvoiceExcel } from "../utils/excelExport.js";
 
function FuelConsumption() {
  const [formData, setFormData] = useState({
    vehicleTypes: [],
    tanks: [],
    jobs: [],
    operators: []
  });
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formValues, setFormValues] = useState({
    vehicleEquipmentType: '',
    plateNumberMachineId: '',
    dateTime: new Date().toISOString().slice(0, 16),
    jobNumber: '',
    operatorName: '',
    operatorMobile: '',
    employeeNumber: '',
    tankSource: '',
    quantity: '',
    odometerReading: '',
    thumbprintData: '',
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
      const [vehicleTypesRes, jobsRes, operatorsRes] = await Promise.all([
        getVehicleEquipmentTypes(),
        getActiveJobs(),
        getOperatorEmployees()
      ]);
      setFormData({
        vehicleTypes: vehicleTypesRes?.data || [],
        jobs: jobsRes?.data || [],
        operators: operatorsRes?.data || []
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load vehicles when vehicle type changes
  useEffect(() => {
    // Only call API if vehicleEquipmentType is not empty/null/undefined
    if (formValues.vehicleEquipmentType && formValues.vehicleEquipmentType !== "") {
      setIsLoading(true);
      getVehiclesByType(formValues.vehicleEquipmentType)
        .then(data => {
          setVehicles(data?.data || []);
        })
        .catch(err => {
          setError(err?.response?.data?.message || err.message || 'Failed to load vehicles');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setVehicles([]);
    }
    // eslint-disable-next-line
  }, [formValues.vehicleEquipmentType]);

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

    if (!formValues.vehicleEquipmentType) {
      errors.vehicleEquipmentType = 'Vehicle/Equipment type is required';
    }
    if (!formValues.plateNumberMachineId) {
      errors.plateNumberMachineId = 'Plate Number / Machine ID is required';
    }
    if (!formValues.dateTime) {
      errors.dateTime = 'Date and time is required';
    }
    if (!formValues.jobNumber) {
      errors.jobNumber = 'Job number is required';
    }
    if (!formValues.operatorName) {
      errors.operatorName = 'Operator/Driver name is required';
    }
    if (!formValues.operatorMobile) {
      errors.operatorMobile = 'Operator mobile number is required';
    }
    if (!formValues.employeeNumber) {
      errors.employeeNumber = 'Employee number is required';
    }
    if (!formValues.tankSource) {
      errors.tankSource = 'Tank source is required';
    }
    if (!formValues.quantity || formValues.quantity <= 0) {
      errors.quantity = 'Quantity is required and must be greater than 0';
    }
    if (!formValues.odometerReading || formValues.odometerReading <= 0) {
      errors.odometerReading = 'Odometer/Equipment hours is required and must be greater than 0';
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
      await createDieselConsumption(formValues);
      setSuccessMessage('Fuel consumption record created successfully!');
      // Reset form on success
      setFormValues({
        vehicleEquipmentType: '',
        plateNumberMachineId: '',
        dateTime: new Date().toISOString().slice(0, 16),
        jobNumber: '',
        operatorName: '',
        operatorMobile: '',
        employeeNumber: '',
        tankSource: '',
        quantity: '',
        odometerReading: '',
        thumbprintData: '',
        siteId: ''
      });
      setSubmitted(false);
      setVehicles([]);
      loadFormData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Error creating fuel consumption');
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
      
      const response = await generateInvoiceFromConsumption({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        siteId: formValues.siteId || 1,
        jobId: formValues.jobNumber ? parseInt(formValues.jobNumber) : null,
        generatedByUserId: "EMP001" // You might want to get this from user context
      });
      
      if (response?.data?.invoice?.invoice_number) {
        // Generate and download Excel file
        await generateInvoiceExcel(response.data);
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
      vehicleEquipmentType: '',
      plateNumberMachineId: '',
      dateTime: new Date().toISOString().slice(0, 16),
      jobNumber: '',
      operatorName: '',
      operatorMobile: '',
      employeeNumber: '',
      tankSource: '',
      quantity: '',
      odometerReading: '',
      thumbprintData: '',
      siteId: ''
    });
    setFormErrors({});
    setSubmitted(false);
    setVehicles([]);
  };

  return (
    <div id="consumption" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998' }}>Fuel Consumption Entry</h2>
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
              <label className="form-label">Vehicle/Equipment Type</label>
              <select
                className="form-select"
                name="vehicleEquipmentType"
                value={formValues.vehicleEquipmentType}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              >
                <option value="">Select Type</option>
                {formData?.vehicleTypes?.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {submitted && formErrors.vehicleEquipmentType && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.vehicleEquipmentType}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Plate Number / Machine ID</label>
              <select
                className="form-select"
                name="plateNumberMachineId"
                value={formValues.plateNumberMachineId}
                onChange={handleInputChange}
                disabled={isLoading || !formValues.vehicleEquipmentType}
                required
              >
                <option value="">Select Vehicle/Equipment</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.vehicle_equipment_id} value={vehicle.plate_number_machine_id}>
                    {vehicle.plate_number_machine_id} {vehicle.make_model ? `(${vehicle.make_model})` : ""}
                  </option>
                ))}
              </select>
              {submitted && formErrors.plateNumberMachineId && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.plateNumberMachineId}
                </div>
              )}
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
              <label className="form-label">Job Number</label>
              <input
                type="text"
                className="form-input"
                name="jobNumber"
                value={formValues.jobNumber}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              {submitted && formErrors.jobNumber && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.jobNumber}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Operator/Driver Name</label>
              <input
                type="text"
                className="form-input"
                name="operatorName"
                value={formValues.operatorName}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              {submitted && formErrors.operatorName && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.operatorName}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Operator Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                name="operatorMobile"
                value={formValues.operatorMobile}
                onChange={handleInputChange}
                placeholder="+974 XXXX XXXX"
                pattern="\+974 [0-9]{4} [0-9]{4}"
                disabled={isLoading}
                required
              />
              {submitted && formErrors.operatorMobile && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.operatorMobile}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Employee Number</label>
              <input
                type="text"
                className="form-input"
                name="employeeNumber"
                value={formValues.employeeNumber}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              {submitted && formErrors.employeeNumber && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.employeeNumber}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Tank Source</label>
              <input
                type="text"
                className="form-input"
                name="tankSource"
                value={formValues.tankSource}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              {submitted && formErrors.tankSource && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.tankSource}
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
                placeholder="Fuel consumed"
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
              <label className="form-label">Odometer (Km) / Equipment Hours</label>
              <input
                type="number"
                className="form-input"
                name="odometerReading"
                value={formValues.odometerReading}
                onChange={handleInputChange}
                placeholder="Current reading"
                min="0"
                disabled={isLoading}
                required
              />
              {submitted && formErrors.odometerReading && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.odometerReading}
                </div>
              )}
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Operator Thumbprint Authentication</label>
            <div
              className={`thumbprint-pad`}
              style={{
                border: '2px dashed #25b86f',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#f9f9f9'
              }}
              onClick={() => alert('Thumbprint capture not implemented in demo')}
            >
              <span>👆 Touch here to capture thumbprint</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
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
                <>💾 Record Consumption</>
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

export default FuelConsumption;
