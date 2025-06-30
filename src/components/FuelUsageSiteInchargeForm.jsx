import React, { useState, useEffect } from "react";
import Select from 'react-select';
import {
  createDieselConsumption,
  getVehicleEquipmentTypes,
  getActiveJobs,
  getOperatorEmployees,
  getVehiclesByType,
} from "../services/fuelConsumptionService.js";
import { getUserByEmployeeNumber } from "../services/authService.js";
import { useUserStore } from "../store/userStore.js";

function FuelUsageSiteInchargeForm({ onSuccess }) {
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
  const [formValues, setFormValues] = useState({
    vehicleEquipmentType: '',
    plateNumberMachineId: '',
    dateTime: new Date().toISOString().slice(0, 16),
    jobNumber: [],
    operatorName: '',
    operatorMobile: '',
    employeeNumber: '',
    division: '',
    quantity: '',
    odometerReading: '',
    thumbprintData: '',
    siteId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [odometerReadings, setOdometerReadings] = useState([]);
  const [isRented, setIsRented] = useState(false);
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
// Camera modal state
const [showCamera, setShowCamera] = useState(false);
const [cameraError, setCameraError] = useState('');
const videoRef = React.useRef(null);
// Camera facing mode state
const [facingMode, setFacingMode] = useState("environment");

// Flip camera
const flipCamera = async () => {
  const newMode = facingMode === "environment" ? "user" : "environment";
  setFacingMode(newMode);
  if (showCamera) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newMode } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError('Unable to access camera');
    }
  }
};
const canvasRef = React.useRef(null);

// Open camera and stream video
const openCamera = async () => {
  setCameraError('');
  setShowCamera(true);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  } catch (err) {
    setCameraError('Unable to access camera');
  }
};

// Capture photo from video
const capturePhoto = () => {
  if (videoRef.current && canvasRef.current) {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], "speedometer.jpg", { type: "image/jpeg" });
        setFormValues(prev => ({ ...prev, speedometerImage: file }));
      }
    }, "image/jpeg");
    // Stop camera stream
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  }
};

// Close camera and stop stream
const closeCamera = () => {
  setShowCamera(false);
  if (videoRef.current && videoRef.current.srcObject) {
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
  }
};

  // Load form data on mount
  useEffect(() => {
    loadFormData();
    autoFillForSiteIncharge();
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

  // Auto-fill for Site Incharge
  const autoFillForSiteIncharge = () => {
    const currentUser = profile || user;
    if (currentUser?.role === 'Site Incharge') {
      setFormValues(prev => ({
        ...prev,
        employeeNumber: currentUser?.employeeNumber || '',
        operatorName: currentUser?.name || '',
        operatorMobile: currentUser?.mobile_number || '',
        siteId: currentUser?.site_id || '',
        division: currentUser?.tanks?.[0]?.tank_name || ''
      }));
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
    if (!formValues.employeeNumber) errors.employeeNumber = 'Employee number is required';
    if (!formValues.division) errors.division = 'Tank source is required';
    if (!formValues.quantity || formValues.quantity <= 0) errors.quantity = 'Quantity is required and must be greater than 0';
    if (!formValues.odometerReading || formValues.odometerReading <= 0) errors.odometerReading = 'Odometer/Equipment hours is required and must be greater than 0';
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
        odometerReading: '',
        thumbprintData: '',
        siteId: ''
      });
      setOtherLocation('');
      setSignatureCaptured(false);
      setSignatureData('');
      setSubmitted(false);
      setVehicles([]);
      setIsRented(false);
      loadFormData();
      setOdometerReadings(prev => [...prev, Number(formValues.odometerReading)]);
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

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        {/* Plate Number */}
        <div className="form-group">
          <label className="form-label">Plate Number</label>
          <input
            type="text"
            className="form-input"
            name="plateNumberMachineId"
            value={formValues.plateNumberMachineId}
            onChange={handlePlateNumberChange}
            placeholder="Enter plate number"
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
          <label className="form-label">Vehicle</label>
          <input
            type="text"
            className="form-input"
            name="vehicleEquipmentType"
            value={formValues.vehicleEquipmentType}
            readOnly
            placeholder="Vehicle"
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
        {/* Rented Vehicle & Division */}
        <div className="form-group" style={{flexDirection: 'row', gap: '10px', alignItems: 'center'}}>
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
          {/* Division */}
          <div className="form-group" >
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
        {/* Employee Number */}
        <div className="form-group">
          <label className="form-label">Employee Number</label>
          <input
            type="text"
            className="form-input"
            name="employeeNumber"
            value={formValues.employeeNumber}
            onChange={handleEmployeeNumberChange}
            disabled={isLoading || (profile || user)?.role === 'Site Incharge'}
            placeholder={(profile || user)?.role === 'Site Incharge' ? "Auto-filled (Site Incharge)" : "Enter employee number"}
            required
          />
          {submitted && formErrors.employeeNumber && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{formErrors.employeeNumber}</div>
          )}
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
            Speedometer Photo (Current Reading)
          </label>
          <div
            className="form-input"
            style={{ cursor: 'pointer', padding: 12, border: '1px solid #ccc', borderRadius: 4, textAlign: 'center' }}
            onClick={openCamera}
          >
            {formValues.speedometerImage
              ? <span style={{ color: '#23476a' }}>{formValues.speedometerImage.name || 'Photo captured'}</span>
              : <span style={{ color: '#015998' }}>Tap to open camera</span>
            }
          </div>
          {showCamera && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: window.innerWidth, height: window.innerHeight,
              background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
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
            </div>
          )}
          <div style={{ marginTop: 8, color: '#015998', fontWeight: 600 }}>
            Extracted Reading: <span style={{ color: '#23476a' }}>[To be extracted]</span>
          </div>
          <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
            Previous: 123456
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
              odometerReading: '',
              thumbprintData: '',
              siteId: ''
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
  );
}

export default FuelUsageSiteInchargeForm;