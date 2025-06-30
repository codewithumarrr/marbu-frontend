import React, { useState, useEffect } from "react";
import Select from 'react-select';
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
import { getUserByEmployeeNumber } from "../services/authService.js";
import { useUserStore } from "../store/userStore.js";
import { generateInvoiceFromConsumption } from "../services/invoicesService.js";
import { generateInvoiceExcel } from "../utils/excelExport.js";
import { startAuthentication } from '@simplewebauthn/browser';

// Dummy data for portable containers
// const dummyPortableContainers = [
//   { id: 1, name: 'Drum 001', type: 'Drum', capacity: 200, location: 'Site A' },
//   { id: 2, name: 'Drum 002', type: 'Drum', capacity: 200, location: 'Site A' },
//   { id: 3, name: 'Jerry Can 001', type: 'Jerry Can', capacity: 20, location: 'Site B' },
//   { id: 4, name: 'Jerry Can 002', type: 'Jerry Can', capacity: 20, location: 'Site B' },
//   { id: 5, name: 'Portable Tank 001', type: 'Portable Tank', capacity: 1000, location: 'Site C' },
//   { id: 6, name: 'Portable Tank 002', type: 'Portable Tank', capacity: 1000, location: 'Site C' },
//   { id: 7, name: 'Generator Tank', type: 'Generator Tank', capacity: 50, location: 'Site A' },
//   { id: 8, name: 'Welding Machine Tank', type: 'Welding Tank', capacity: 30, location: 'Site B' }
// ];

function FuelUsage() {
  const { user, profile } = useUserStore();
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
    // portableContainerName: '',
    dateTime: new Date().toISOString().slice(0, 16),
    jobNumber: [],
    operatorName: '',
    operatorMobile: '',
    employeeNumber: '',
    tankSource: user?.tanks[0]?.tank_name || '',
    quantity: '',
    odometerReading: '',
    thumbprintData: '',
    siteId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [odometerReadings, setOdometerReadings] = useState([]);
  const [isRented, setIsRented] = useState(false);
  // const [isPortableContainer, setIsPortableContainer] = useState(false);
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const [signatureData, setSignatureData] = useState('');

  // Get current user role and info
  const getCurrentUser = () => {
    return profile || user;
  };
  
  const isUserSiteIncharge = () => {
    const currentUser = getCurrentUser();
    return currentUser?.role === 'Site Incharge';
  };

  // Load form data on component mount and auto-fill for Site Incharge
  useEffect(() => {
    loadFormData();
    autoFillForSiteIncharge();
    // eslint-disable-next-line
  }, []);

  // Auto-fill form data for Site Incharge users
  const autoFillForSiteIncharge = () => {
    if (isUserSiteIncharge()) {
      const currentUser = getCurrentUser();
      setFormValues(prev => ({
        ...prev,
        employeeNumber: currentUser?.employeeNumber || '',
        operatorName: currentUser?.name || '',
        operatorMobile: currentUser?.mobile_number || '',
        siteId: currentUser?.site_id || '',
        tankSource: currentUser?.tanks && currentUser.tanks.length > 0 
          ? currentUser.tanks[0].tank_name 
          : ''
      }));
    }
  };

  // Handle employee number lookup
  const handleEmployeeNumberLookup = async (employeeNumber) => {
    if (!employeeNumber || employeeNumber.length < 3) return;
    
    try {
      const response = await getUserByEmployeeNumber(employeeNumber);
      if (response.status === 'success') {
        const employeeData = response.data;
        setFormValues(prev => ({
          ...prev,
          operatorName: employeeData.employeeName || '',
          operatorMobile: employeeData.mobileNumber || ''
        }));
      }
    } catch (err) {
      // Silently handle errors - user might be typing
      console.log('Employee lookup error:', err);
    }
  };

  // Handle employee number change with lookup
  const handleEmployeeNumberChange = (e) => {
    const { value } = e.target;
    setFormValues(prev => ({
      ...prev,
      employeeNumber: value
    }));

    // Clear field error when user starts typing
    if (formErrors.employeeNumber) {
      setFormErrors(prev => ({
        ...prev,
        employeeNumber: ''
      }));
    }

    // Clear operator fields immediately when user starts typing
    if (value !== formValues.employeeNumber) {
      setFormValues(prev => ({
        ...prev,
        operatorName: '',
        operatorMobile: ''
      }));
    }
  };

  // Use useEffect for debounced lookup
  useEffect(() => {
    if (formValues.employeeNumber && formValues.employeeNumber.length >= 3) {
      const timeoutId = setTimeout(() => {
        handleEmployeeNumberLookup(formValues.employeeNumber);
      }, 800); // Increased debounce time to 800ms

      return () => clearTimeout(timeoutId);
    }
  }, [formValues.employeeNumber]);

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

  // Multi-select handler for jobNumber
  const handleJobNumberChange = (selectedOptions) => {
    setFormValues(prev => ({
      ...prev,
      jobNumber: selectedOptions ? selectedOptions.map(opt => opt.value) : []
    }));
    if (formErrors.jobNumber) {
      setFormErrors(prev => ({ ...prev, jobNumber: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // if (!isPortableContainer) {
      // Vehicle/Equipment validation
      if (!formValues.vehicleEquipmentType) {
        errors.vehicleEquipmentType = 'Vehicle/Equipment type is required';
      }
      if (!formValues.plateNumberMachineId) {
        errors.plateNumberMachineId = 'Plate Number / Machine ID is required';
      }
    // } else {
    //   // Portable container validation
    //   if (!formValues.portableContainerName) {
    //     errors.portableContainerName = 'Container name/description is required';
    //   }
    // }

    if (!formValues.dateTime) {
      errors.dateTime = 'Date and time is required';
    }
    if (!formValues.jobNumber || formValues.jobNumber.length === 0) {
      errors.jobNumber = 'At least one job number is required';
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
      // Prepare the payload with signature data
      const payload = {
        ...formValues,
        signatureData: signatureData,
        signatureCaptured: signatureCaptured,
        thumbprintData: signatureData, // Map signature to thumbprint for backward compatibility
        // isPortableContainer: isPortableContainer,
        // // Use appropriate identifier based on mode
        // identifier: isPortableContainer ? formValues.portableContainerName : formValues.plateNumberMachineId
      };

      await createDieselConsumption(payload);
      setSuccessMessage('Fuel consumption record created successfully!');
      
      // Reset form on success
      setFormValues({
        vehicleEquipmentType: '',
        plateNumberMachineId: '',
        // portableContainerName: '',
        dateTime: new Date().toISOString().slice(0, 16),
        jobNumber: [],
        operatorName: '',
        operatorMobile: '',
        employeeNumber: '',
        tankSource: '',
        quantity: '',
        odometerReading: '',
        thumbprintData: '',
        siteId: ''
      });
      setSignatureCaptured(false);
      setSignatureData('');
      setSubmitted(false);
      setVehicles([]);
      setIsRented(false);
      loadFormData();
      setOdometerReadings(prev => [...prev, Number(formValues.odometerReading)]);
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
        generatedByUserId: formValues?.employeeNumber,
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
      jobNumber: [],
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
    setIsRented(false);
  };

  // Prepare job options for react-select
  const jobOptions = (formData.jobs && formData.jobs.length > 0)
    ? formData.jobs.map(job => ({ value: job.job_number, label: job.job_number }))
    : [
      { value: 'job-001', label: 'Job 001' },
      { value: 'job-002', label: 'Job 002' },
      { value: 'job-003', label: 'Job 003' }
    ];

  // Custom styles for react-select to match .form-input
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '48px',
      borderRadius: '8px',
      border: '2px solid #e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(8, 145, 178, 0.1)' : 'none',
      fontSize: '16px',
      paddingLeft: '0',
      background: 'white',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 16px',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0',
      padding: '0',
    }),
    multiValue: (provided) => ({
      ...provided,
      background: '#e2e8f0',
      borderRadius: '6px',
      padding: '2px 6px',
      fontSize: '15px',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#015998',
      fontWeight: 500,
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#dc2626',
      ':hover': { background: '#fee2e2', color: '#b91c1c' },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#a0aec0',
      fontSize: '16px',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 10,
    }),
  };

  // Odometer input handlers
  const handleOdometerBlur = () => {
    if (
      formValues.odometerReading &&
      !isNaN(formValues.odometerReading) &&
      (odometerReadings.length === 0 || odometerReadings[odometerReadings.length - 1] !== formValues.odometerReading)
    ) {
      setOdometerReadings(prev => [...prev, Number(formValues.odometerReading)]);
    }
  };
  const handleOdometerKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleOdometerBlur();
    }
  };

  // Calculate total of all previous readings plus current input
  const odometerTotal = odometerReadings.reduce((sum, val) => sum + parseFloat(val || 0), 0);

  // Add handler for rented checkbox
  const handleRentedChange = (e) => {
    setIsRented(e.target.checked);
  };

  // Add handler for portable container checkbox
  // const handlePortableContainerChange = (e) => {
  //   setIsPortableContainer(e.target.checked);
  //   // Clear related fields when switching modes
  //   if (e.target.checked) {
  //     setFormValues(prev => ({
  //       ...prev,
  //       vehicleEquipmentType: '',
  //       plateNumberMachineId: ''
  //     }));
  //   } else {
  //     setFormValues(prev => ({
  //       ...prev,
  //       portableContainerName: ''
  //     }));
  //   }
  // };

  const previousOdometer = odometerReadings.length > 0 ? odometerReadings[odometerReadings.length - 1] : null;

  const SignaturePad = () => {
    return (
      <div
        className={`thumbprint-pad ${signatureCaptured ? 'thumbprint-captured' : ''}`}
        onClick={() => {
          setSignatureCaptured(!signatureCaptured);
          setSignatureData(signatureCaptured ? '' : `operator_signature_${Date.now()}`);
        }}
        style={{
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {signatureCaptured ? (
          <span>✅ Operator Signature Captured - Click to remove</span>
        ) : (
          <span>👆 Click to capture operator signature/fingerprint</span>
        )}
      </div>
    );
  };

  // Handle plate number change with auto-population
  const handlePlateNumberChange = (e) => {
    const { value } = e.target;
    setFormValues(prev => ({
      ...prev,
      plateNumberMachineId: value
    }));

    // Clear field error when user starts typing
    if (formErrors.plateNumberMachineId) {
      setFormErrors(prev => ({
        ...prev,
        plateNumberMachineId: ''
      }));
    }

    // Clear vehicle type when plate number changes
    if (value !== formValues.plateNumberMachineId) {
      setFormValues(prev => ({
        ...prev,
        vehicleEquipmentType: ''
      }));
    }
  };

  // Use useEffect for debounced vehicle lookup
  useEffect(() => {
    if (formValues.plateNumberMachineId && formValues.plateNumberMachineId.length >= 3) {
      const timeoutId = setTimeout(() => {
        handleVehicleLookup(formValues.plateNumberMachineId);
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [formValues.plateNumberMachineId]);

  // Handle vehicle lookup by plate number
  const handleVehicleLookup = async (plateNumber) => {
    if (!plateNumber || plateNumber.length < 3) return;
    
    try {
      // Search through all vehicle types to find the vehicle
      const allVehicles = [];
      
      // Get vehicles for each type
      for (const vehicleType of formData.vehicleTypes || []) {
        try {
          const response = await getVehiclesByType(vehicleType);
          const vehicles = response?.data || [];
          allVehicles.push(...vehicles);
        } catch (err) {
          console.log(`Failed to load vehicles for type ${vehicleType}:`, err);
        }
      }
      
      // Find the vehicle by plate number
      const foundVehicle = allVehicles.find(vehicle => 
        vehicle.plate_number_machine_id?.toLowerCase().includes(plateNumber.toLowerCase())
      );
      
      if (foundVehicle) {
        setFormValues(prev => ({
          ...prev,
          vehicleEquipmentType: foundVehicle.vehicle_equipment_type || foundVehicle.type || '',
          plateNumberMachineId: foundVehicle.plate_number_machine_id || plateNumber
        }));
        
        // Auto-detect rented status based on plate number pattern
        // Rented vehicles often have specific patterns like "RENT", "HIRE", or start with "R"
        const plateUpper = plateNumber.toUpperCase();
        const isRentedVehicle = plateUpper.includes('RENT') || 
                               plateUpper.includes('HIRE') || 
                               plateUpper.startsWith('R') ||
                               plateUpper.includes('TEMP');
        
        setIsRented(isRentedVehicle);
      }
    } catch (err) {
      console.log('Vehicle lookup error:', err);
    }
  };

  return (
    <div id="usage" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998', fontWeight: 700 ,fontSize:27}}>Fuel Usage Entry</h2>
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

            {/* Plate Number - First Field */}
            <div className="form-group">
              <label className="form-label">Plate Number / Machine ID</label>
              <input
                type="text"
                className="form-input"
                name="plateNumberMachineId"
                value={formValues.plateNumberMachineId}
                onChange={handlePlateNumberChange}
                placeholder="Enter plate number or machine ID"
                disabled={isLoading}
                required
              />
              {submitted && formErrors.plateNumberMachineId && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.plateNumberMachineId}
                </div>
              )}
            </div>

            {/* Vehicle/Equipment Type - Auto-populated */}
            <div className="form-group">
              <label className="form-label">Vehicle/Equipment Type</label>
              <input
                type="text"
                className="form-input"
                name="vehicleEquipmentType"
                value={formValues.vehicleEquipmentType}
                readOnly
                placeholder="Auto-populated from plate number"
                disabled={isLoading}
                required
              />
              {submitted && formErrors.vehicleEquipmentType && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {formErrors.vehicleEquipmentType}
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

            {/* Job Number - moved to where Rented checkbox was */}
         

            {/* Rented Dropdown - moved to where Job Number was */}
            <div className="form-group">
              <label className="form-label">Rented Vehicle</label>
              <select
                className="form-input"
                value={isRented ? 'yes' : 'no'}
                onChange={(e) => setIsRented(e.target.value === 'yes')}
                disabled={isLoading}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {/* Tank Source - Back to read-only input */}
            <div className="form-group">
              <label className="form-label">Tank Source</label>
              <input
                type="text"
                className="form-input"
                name="tankSource"
                value={formValues.tankSource}
                onChange={handleInputChange}
                readOnly={true}
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
              <label className="form-label">{isRented ? 'Employee ID' : 'Employee Number'}</label>
              <input
                type="text"
                className="form-input"
                name="employeeNumber"
                value={formValues.employeeNumber}
                onChange={handleEmployeeNumberChange}
                disabled={isLoading || isUserSiteIncharge()}
                placeholder={isUserSiteIncharge() ? "Auto-filled (Site Incharge)" : "Enter employee number"}
                required
              />
              {submitted && formErrors.employeeNumber && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.employeeNumber}</div>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">Driver Name</label>
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
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.operatorMobile}</div>
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
              <label className="form-label">
                Speedometer Photo (Current Reading)
              </label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                name="speedometerImage"
                onChange={e => setFormValues(prev => ({ ...prev, speedometerImage: e.target.files[0] }))}
                disabled={isLoading}
                required
              />
              {/* Placeholder for extracted reading from image */}
              <div style={{ marginTop: 8, color: '#015998', fontWeight: 600 }}>
                Extracted Reading: <span style={{ color: '#23476a' }}>[To be extracted]</span>
              </div>
              {/* Hardcoded previous reading */}
              <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
                Previous: 123456
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Job Number</label>
              <Select
                isMulti
                name="jobNumber"
                options={jobOptions}
                value={jobOptions.filter(opt => formValues.jobNumber.includes(opt.value))}
                onChange={handleJobNumberChange}
                classNamePrefix="react-select"
                placeholder="Select job(s)"
                isDisabled={isLoading}
                styles={customSelectStyles}
              />
              {submitted && formErrors.jobNumber && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.jobNumber}</div>
              )}
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Operator Signature/Fingerprint</label>
            <SignaturePad />
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
                <>💾 Save Record</>
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

export default FuelUsage;
