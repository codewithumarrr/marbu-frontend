/*
  Camera modal overlay fix:
  Ensures modal always overlays the entire browser viewport by using a portal to document.body.
*/
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Select from 'react-select';
import {
  createDieselConsumption,
  getVehicleEquipmentTypes,
  getActiveJobs,
  getOperatorEmployees,
  getVehiclesByType
} from "../services/fuelConsumptionService.js";
import { getUserByEmployeeNumber } from "../services/authService.js";
import { useUserStore } from "../store/userStore.js";
import { startAuthentication } from '@simplewebauthn/browser';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from "../services/authService.js";

function FuelUsageDriverForm({ onSuccess }) {
  const { user, profile } = useUserStore();

  const [formData, setFormData] = useState({
    vehicleTypes: [],
    jobs: [],
    operators: []
  });
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [formValues, setFormValues] = useState({
    vehicleEquipmentType: '',
    plateNumberMachineId: '',
    dateTime: new Date().toISOString().slice(0, 16),
    jobNumber: [],
    operatorName: '',
    operatorMobile: '',
    employeeNumber: '',
    qatarIdNumber: '',
    division: user?.tanks?.[0]?.tank_name || '',
    quantity: '',
    perhour: '',
    thumbprintData: '',
    siteId: '',
    machineRented: 'false'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [perhours, setperhours] = useState([]);
  const [isRented, setIsRented] = useState(false);
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [otherLocation, setOtherLocation] = useState('');

  const handleWebAuthn = async () => {
    setAuthenticating(true);
    setError('');
    try {
      const authOptions = await generateAuthenticationOptions();
      if (authOptions.status === 'success') {
        const options = authOptions.data.options;

        // Convert challenge to Uint8Array
        options.challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));

        const credential = await startAuthentication(options);

        const verificationResult = await verifyAuthenticationResponse(credential);
        if (verificationResult.status === 'success' && verificationResult.data.verification.verified) {
          setSignatureCaptured(true);
          setSignatureData('authenticated');
        } else {
          setSignatureCaptured(false);
          setSignatureData('');
          setError('Authentication failed: Verification failed.');
        }
      } else {
        setSignatureCaptured(false);
        setSignatureData('');
        setError('Authentication failed: Could not generate authentication options.');
      }
    } catch (err) {
      setSignatureCaptured(false);
      setSignatureData('');
      setError('Authentication failed: ' + (err?.message || err));
    } finally {
      setAuthenticating(false);
    }
  };
// Camera modal state and handlers
const [showCamera, setShowCamera] = useState(false);
const [cameraError, setCameraError] = useState('');
const videoRef = useRef(null);
const canvasRef = useRef(null);
const [facingMode, setFacingMode] = useState("environment");

// Flip camera
function flipCamera() {
  const newMode = facingMode === "environment" ? "user" : "environment";
  setFacingMode(newMode);
  if (showCamera) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: newMode } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => setCameraError('Unable to access camera'));
  }
}

// Open camera and stream video
function openCamera() {
  setCameraError('');
  setShowCamera(true);
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    })
    .catch(() => setCameraError('Unable to access camera'));
}

// Capture photo from video
function capturePhoto() {
  if (videoRef.current && canvasRef.current) {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], "perhour.jpg", { type: "image/jpeg" });
        setFormValues(prev => ({ ...prev, perhour: file }));
      }
    }, "image/jpeg");
    // Stop camera stream
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  }
}

// Close camera and stop stream
function closeCamera() {
  setShowCamera(false);
  if (videoRef.current && videoRef.current.srcObject) {
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
  }
}

  // Load form data on mount
  useEffect(() => {
    loadFormData();
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

  // Employee number lookup
  useEffect(() => {
    if (formValues.employeeNumber && formValues.employeeNumber.length >= 3) {
      const timeoutId = setTimeout(() => {
        handleEmployeeNumberLookup(formValues.employeeNumber);
      }, 800);
      return () => clearTimeout(timeoutId);
    }
  }, [formValues.employeeNumber]);

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
      // Silently handle errors
    }
  };

  // Input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleJobNumberChange = (selectedOptions) => {
    setFormValues(prev => ({
      ...prev,
      jobNumber: selectedOptions ? selectedOptions.map(opt => opt.value) : []
    }));
    if (formErrors.jobNumber) {
      setFormErrors(prev => ({ ...prev, jobNumber: '' }));
    }
  };

  const handleEmployeeNumberChange = (e) => {
    const { value } = e.target;
    setFormValues(prev => ({
      ...prev,
      employeeNumber: value
    }));
    if (formErrors.employeeNumber) {
      setFormErrors(prev => ({
        ...prev,
        employeeNumber: ''
      }));
    }
    if (value !== formValues.employeeNumber) {
      setFormValues(prev => ({
        ...prev,
        operatorName: '',
        operatorMobile: ''
      }));
    }
  };

  const handleQatarIdNumberChange = (e) => {
    const { value } = e.target;
    setFormValues(prev => ({
      ...prev,
      qatarIdNumber: value
    }));
    if (formErrors.qatarIdNumber) {
      setFormErrors(prev => ({
        ...prev,
        qatarIdNumber: ''
      }));
    }
    if (value !== formValues.qatarIdNumber) {
      setFormValues(prev => ({
        ...prev,
        operatorName: '',
        operatorMobile: ''
      }));
    }
  };

  // Plate number change and lookup
  const handlePlateNumberChange = (e) => {
    const { value } = e.target;
    setFormValues(prev => ({
      ...prev,
      plateNumberMachineId: value
    }));
    if (formErrors.plateNumberMachineId) {
      setFormErrors(prev => ({
        ...prev,
        plateNumberMachineId: ''
      }));
    }
    if (value !== formValues.plateNumberMachineId) {
      setFormValues(prev => ({
        ...prev,
        vehicleEquipmentType: ''
      }));
    }
  };

  useEffect(() => {
    if (formValues.plateNumberMachineId && formValues.plateNumberMachineId.length >= 3) {
      const timeoutId = setTimeout(() => {
        handleVehicleLookup(formValues.plateNumberMachineId);
      }, 800);
      return () => clearTimeout(timeoutId);
    }
  }, [formValues.plateNumberMachineId]);

  const handleVehicleLookup = async (plateNumber) => {
    if (!plateNumber || plateNumber.length < 3) return;
    try {
      const allVehicles = [];
      for (const vehicleType of formData.vehicleTypes || []) {
        try {
          const response = await getVehiclesByType(vehicleType);
          const vehicles = response?.data || [];
          allVehicles.push(...vehicles);
        } catch (err) {}
      }
      const foundVehicle = allVehicles.find(vehicle =>
        vehicle.plate_number_machine_id?.toLowerCase().includes(plateNumber.toLowerCase())
      );
      if (foundVehicle) {
        setFormValues(prev => ({
          ...prev,
          vehicleEquipmentType: foundVehicle.vehicle_equipment_type || foundVehicle.type || '',
          plateNumberMachineId: foundVehicle.plate_number_machine_id || plateNumber
        }));
        const plateUpper = plateNumber.toUpperCase();
        const isRentedVehicle = plateUpper.includes('RENT') ||
          plateUpper.includes('HIRE') ||
          plateUpper.startsWith('R') ||
          plateUpper.includes('TEMP');
        setIsRented(isRentedVehicle);
      }
    } catch (err) {}
  };

  // Odometer handlers
  const handleOdometerBlur = () => {
    if (
      formValues.perhour &&
      !isNaN(formValues.perhour) &&
      (perhours.length === 0 || perhours[perhours.length - 1] !== formValues.perhour)
    ) {
      setperhours(prev => [...prev, Number(formValues.perhour)]);
    }
  };
  const handleOdometerKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleOdometerBlur();
    }
  };

  // Signature pad
  const SignaturePad = () => (
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

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formValues.vehicleEquipmentType) errors.vehicleEquipmentType = 'Vehicle/Equipment type is required';
    if (!formValues.plateNumberMachineId) errors.plateNumberMachineId = 'Plate Number / Machine ID is required';
    if (!formValues.dateTime) errors.dateTime = 'Date and time is required';
    if (!formValues.jobNumber || formValues.jobNumber.length === 0) errors.jobNumber = 'At least one job number is required';
    if (!formValues.operatorName) errors.operatorName = 'Operator/Driver name is required';
    if (!formValues.operatorMobile) errors.operatorMobile = 'Operator mobile number is required';
    else if (formValues.operatorMobile.length !== 11) errors.operatorMobile = 'Mobile number must be exactly 11 characters';
    if (!formValues.employeeNumber) errors.employeeNumber = 'Employee number is required';
    if (!formValues.division) errors.division = 'Tank source is required';
    if (!formValues.quantity || formValues.quantity <= 0) errors.quantity = 'Quantity is required and must be greater than 0';
    if (!formValues.perhour || formValues.perhour <= 0) errors.perhour = 'Odometer/Equipment hours is required and must be greater than 0';
    if (formValues.jobNumber.includes('other') && !otherLocation) errors.otherLocation = 'Location is required when "Other" is selected';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validateForm()) return;
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = {
        ...formValues,
        signatureData: signatureData,
        signatureCaptured: signatureCaptured,
        thumbprintData: signatureData,
        ...(formValues.jobNumber.includes('other') ? { otherLocation } : {})
      };
      await createDieselConsumption(payload);
      setSuccessMessage('Fuel consumption record created successfully!');
      setFormValues({
        vehicleEquipmentType: '',
        plateNumberMachineId: '',
        dateTime: new Date().toISOString().slice(0, 16),
        jobNumber: [],
        operatorName: '',
        operatorMobile: '',
        employeeNumber: '',
        division: '',
        quantity: '',
        perhour: '',
        thumbprintData: '',
        siteId: '',
        machineRented: 'false'
      });
      setOtherLocation('');
      setSignatureCaptured(false);
      setSignatureData('');
      setSubmitted(false);
      setVehicles([]);
      setIsRented(false);
      loadFormData();
      setperhours(prev => [...prev, Number(formValues.perhour)]);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Error creating fuel consumption');
    } finally {
      setIsLoading(false);
    }
  };

  // Job options for react-select
  const jobOptions = (formData.jobs && formData.jobs.length > 0)
    ? formData.jobs.map(job => ({ value: job.job_number, label: job.job_number }))
    : [{ value: 'other', label: 'Other' }];

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '48px',
      borderRadius: '8px',
      border: '2px solid #e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(8, 145, 178, 0.1)' : 'none',
      fontSize: '16px',
      paddingLeft: '0',
      background: 'white'
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 16px'
    }),
    input: (provided) => ({
      ...provided,
      margin: '0',
      padding: '0'
    }),
    multiValue: (provided) => ({
      ...provided,
      background: '#e2e8f0',
      borderRadius: '6px',
      padding: '2px 6px',
      fontSize: '15px'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#015998',
      fontWeight: 500
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#dc2626',
      ':hover': { background: '#fee2e2', color: '#b91c1c' }
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#a0aec0',
      fontSize: '16px'
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 10
    })
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit}>
      <div className="form-grid">
        {/* Plate Number */}
        <div className="form-group">
          <label className="form-label">Plate Number / Machine ID</label>
          <input
            type="text"
            className="form-input"
            name="plateNumberMachineId"
            value={formValues.plateNumberMachineId}
            onChange={handlePlateNumberChange}
            placeholder="Machine ID"
            disabled={isLoading}
            required
          />
          {submitted && formErrors.plateNumberMachineId && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              {formErrors.plateNumberMachineId}
            </div>
          )}
        </div>
        {/* Vehicle/Equipment Type */}
        <div className="form-group">
          <label className="form-label">Vehicle / Equipment Type</label>
          <input
            type="text"
            className="form-input"
            name="vehicleEquipmentType"
            value={formValues.vehicleEquipmentType}
            readOnly
            placeholder="Machine Type"
            disabled={isLoading}
            required
          />
          {submitted && formErrors.vehicleEquipmentType && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              {formErrors.vehicleEquipmentType}
            </div>
          )}
        </div>
        {/* Date & Time */}
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
        {/* Rented Vehicle (for Machine ID, does NOT affect Employee/Qatar ID logic) */}
        <div className="form-group" style={{flexDirection: 'row', gap: '10px', alignItems: 'center'}}>
          <div className="form-group">
              <label className="form-label">Rented</label>
              <select
            className="form-input"
            value={formValues.machineRented || 'false'}
            onChange={e => setFormValues(prev => ({ ...prev, machineRented: e.target.value }))}
            disabled={isLoading}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
          </div>
          {/* Division */}
          <div className="form-group">
              <label className="form-label">Division</label>
              <select
            className="form-input"
            name="division"
            value={formValues.division}
            onChange={handleInputChange}
            readOnly={true}
            disabled={isLoading}
            required
          >
            <option value="">Select Division</option>
            <option value="division1">Division 1</option>
            <option value="division2">Division 2</option>
          </select>
          {submitted && formErrors.division && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              {formErrors.division}
            </div>
          )}
          </div>
        </div>
        {/* Employee Number / Qatar ID with Rented logic (this is the only one that controls the switch) */}
        <div className="form-group" style={{flexDirection: 'row', gap: '10px', alignItems: 'center'}}>
         { isRented === true ? <div className="form-group">
            <label className="form-label">Qatar ID Number</label>
            <input
              type="text"
              className="form-input"
              name="qatarIdNumber"
              value={formValues.qatarIdNumber}
              onChange={handleQatarIdNumberChange}
              disabled={isLoading}
              placeholder="Enter Qatar ID number"
              required
            />
            {submitted && formErrors.qatarIdNumber && (
              <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.qatarIdNumber}</div>
            )}
          </div> :
          <div className="form-group">
            <label className="form-label">Employee Number</label>
            <input
              type="text"
              className="form-input"
              name="employeeNumber"
              value={formValues.employeeNumber}
              onChange={handleEmployeeNumberChange}
              disabled={isLoading}
              placeholder="Enter employee number"
              required
            />
            {submitted && formErrors.employeeNumber && (
              <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.employeeNumber}</div>
            )}
          </div>}
          <div className="form-group">
              <label className="form-label" style={{ whiteSpace: 'nowrap', marginLeft: -10 }}>Rented</label>
              <select
            className="form-input"
            value={isRented}
            onChange={(e) => setIsRented(e.target.value === 'true')}
            disabled={isLoading}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
          </div>

        </div>
        {/* Driver Name */}
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
        {/* Operator Mobile Number */}
        <div className="form-group">
          <label className="form-label">Mobile Number</label>
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
            minLength={11}
            maxLength={11}
          />
          {submitted && formErrors.operatorMobile && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.operatorMobile}</div>
          )}
        </div>
        {/* Quantity */}
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
        {/* Speedometer Photo */}
        <div className="form-group">
          <label className="form-label">
            Per Hour &nbsp; (prev hour: 123)
          </label>
          <div
            className="form-input"
            style={{ cursor: 'pointer', padding: 12, border: '1px solid #ccc', borderRadius: 4, textAlign: 'center' }}
            onClick={openCamera}
          >
            {formValues.perhour
              ? <span style={{ color: '#23476a' }}>{formValues.perhour.name || 'Photo captured'}</span>
              : <span style={{ color: '#015998' }}>Tap to open camera</span>
            }
          </div>
          {showCamera &&
            ReactDOM.createPortal(
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.7)',
                zIndex: 2147483647,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  background: '#fff',
                  padding: 20,
                  borderRadius: 8,
                  textAlign: 'center',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <video ref={videoRef} autoPlay playsInline style={{ width: 320, height: 240, borderRadius: 8, background: '#000' }} />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div style={{ marginTop: 10, display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button type="button" className="btn btn-primary" onClick={capturePhoto}>Capture</button>
                    <button type="button" className="btn btn-secondary" onClick={closeCamera}>Cancel</button>
                    <button type="button" className="btn btn-secondary" onClick={flipCamera}>Flip Camera</button>
                  </div>
                  {cameraError && <div style={{ color: 'red', marginTop: 8 }}>{cameraError}</div>}
                </div>
              </div>,
              document.body
            )
          }
          <div style={{ marginTop: 8, color: '#015998', fontWeight: 600 }}>
            Extracted Reading: <span style={{ color: '#23476a' }}>[To be extracted]</span>
          </div>
          <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
            Previous: 123
          </div>
        </div>
        {/* Job Number */}
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
          {/* Show Location field if "Other" is selected */}
          {formValues.jobNumber.includes('other') && (
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                name="otherLocation"
                value={otherLocation}
                onChange={e => setOtherLocation(e.target.value)}
                placeholder="Enter location"
                disabled={isLoading}
                required
              />
              {submitted && formErrors.otherLocation && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.otherLocation}</div>
              )}
            </div>
          )}
        </div>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">Operator Fingerprint (Windows Hello)</label>
          <div
            className="thumbprint-pad"
            style={{
              cursor: (isLoading || authenticating) ? 'not-allowed' : 'pointer',
              border: '2px dashed #ccc',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center'
            }}
            onClick={handleWebAuthn}
            disabled={isLoading || authenticating}
          >
            {authenticating ? 'Authenticating...' : 'Place Thumb Here'}
          </div>
          {!signatureCaptured && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              Please authenticate with fingerprint before saving.
            </div>
          )}
          {signatureCaptured && (
            <div style={{ color: '#25b86f', fontSize: '12px', marginTop: '4px' }}>
              Fingerprint authentication successful.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={isLoading || !signatureCaptured}>
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
          onClick={() => {
            setFormValues({
              vehicleEquipmentType: '',
              plateNumberMachineId: '',
              dateTime: new Date().toISOString().slice(0, 16),
              jobNumber: [],
              operatorName: '',
              operatorMobile: '',
              employeeNumber: '',
              division: '',
              quantity: '',
              perhour: '',
              thumbprintData: '',
              siteId: '',
              machineRented: 'false'
            });
            setOtherLocation('');
            setFormErrors({});
            setSubmitted(false);
            setVehicles([]);
            setIsRented(false);
          }}
          disabled={isLoading}
        >
          🔄 Reset Form
        </button>
      </div>
      {successMessage && (
        <div className="alert alert-success" style={{ marginTop: 20 }}>
          <span>✅</span>
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginTop: 20 }}>
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}
    </form>
    </React.Fragment>
  );
}

export default FuelUsageDriverForm;