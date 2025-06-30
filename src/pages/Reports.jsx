import React, { useState, useEffect, useRef } from "react";
import "../styles/pages.css";
import TableComponent from "../components/TableComponent";
import {
  generateFuelUsageReport,
  getReportSites,
  getReportVehicleTypes,
  exportReportData,
  getEfficiencyAnalysis,
  exportReportPdf,
  emailReport
} from "../services/reportsService.js";
import jsPDF from "jspdf";
import WebAuthnButton from '../components/WebAuthnButton';

function Reports() {
  const reportHeaders = [
    "Date",
    "Site",
    "Vehicle/Equipment",
    "Operator",
    "Fuel Used (L)",
    "Efficiency",
    "Actions",
  ];
  const [reportData, setReportData] = useState([]);
  const [sites, setSites] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Default filter values
  const [defaultFilters] = useState({
    reportType: "daily",
    dateFrom: "",
    dateTo: "",
    siteId: "",
    vehicleType: ""
  });

  // Ref for the filter form
  const filterFormRef = useRef(null);

  useEffect(() => {
    loadFilters();
    // eslint-disable-next-line
  }, []);

  // After filters are loaded, trigger initial report load with defaults
  useEffect(() => {
    if (sites.length > 0 && vehicleTypes.length > 0) {
      handleGenerateReportWithDefaults();
    }
    // eslint-disable-next-line
  }, [sites, vehicleTypes]);

  const loadFilters = async () => {
    setLoading(true);
    setApiError('');
    try {
      const [sitesRes, vehicleTypesRes] = await Promise.all([
        getReportSites(),
        getReportVehicleTypes()
      ]);
      setSites(sitesRes?.data || []);
      setVehicleTypes(vehicleTypesRes?.data || []);
    } catch (err) {
      setApiError(err?.response?.data?.message || err.message || 'Failed to load report filters');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setApiError('');
    let filters;
    if (filterFormRef.current) {
      const form = filterFormRef.current;
      filters = {
        reportType: form.reportType.value,
        dateFrom: form.dateFrom.value,
        dateTo: form.dateTo.value,
        siteId: form.siteId.value,
        vehicleType: form.vehicleType.value
      };
    } else {
      filters = { ...defaultFilters };
    }
    try {
      const data = await generateFuelUsageReport(filters);
      setReportData(data?.data?.reportData || []);
    } catch (err) {
      setApiError(err?.response?.data?.message || err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Helper to trigger report load with default filters
  const handleGenerateReportWithDefaults = async () => {
    setLoading(true);
    setApiError('');
    try {
      const data = await generateFuelUsageReport(defaultFilters);
      setReportData(data?.data?.reportData || []);
    } catch (err) {
      setApiError(err?.response?.data?.message || err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="reports" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998',fontSize:27,fontWeight:700 }}>Fuel Usage Reports</h2>
      {/* Remove nested form: just use a single form here */}
      <form ref={filterFormRef} onSubmit={handleGenerateReport} autoComplete="off" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'end', marginBottom: '20px' }}>
        <div className="form-group">
          <label className="form-label">Report Type</label>
          <select className="form-select" name="reportType" defaultValue={defaultFilters.reportType}>
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date From</label>
          <input type="date" className="form-input" name="dateFrom" defaultValue={defaultFilters.dateFrom} />
        </div>
        <div className="form-group">
          <label className="form-label">Date To</label>
          <input type="date" className="form-input" name="dateTo" defaultValue={defaultFilters.dateTo} />
        </div>
        <div className="form-group">
          <label className="form-label">Site</label>
          <select className="form-select" name="siteId" defaultValue={defaultFilters.siteId}>
            <option value="">All Sites</option>
            {sites.map(site => (
              <option key={site.site_id || site.id} value={site.site_id || site.id}>{site.site_name || site.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Job Wise</label>
          <select className="form-select" name="siteId" defaultValue={defaultFilters.siteId}>
            <option value="">All Jobs</option>
            {sites.map(site => (
              <option key={site.site_id || site.id} value={site.site_id || site.id}>{site.site_name || site.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Vehicle Type</label>
          <select className="form-select" name="vehicleType" defaultValue={defaultFilters.vehicleType}>
            <option value="">All Types</option>
            {vehicleTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ alignSelf: 'end' }}>
          <button type="submit" className="btn btn-primary">🔍 Generate Report</button>
        </div>
      </form>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button
          className="btn btn-success"
          onClick={async (e) => {
            e.preventDefault();
            setLoading(true);
            setApiError('');
            try {
              const ExcelJS = (await import("exceljs")).default;
              // Use reportsService to get report data
              const params = {};
              if (filterFormRef.current) {
                const form = filterFormRef.current;
                params.reportType = form.reportType.value;
                params.dateFrom = form.dateFrom.value;
                params.dateTo = form.dateTo.value;
                params.siteId = form.siteId.value;
                params.vehicleType = form.vehicleType.value;
              }
              const result = await exportReportData(params);
              const report = result.data || [];
              if (!report.length) throw new Error('No data to export');
              const workbook = new ExcelJS.Workbook();
              const worksheet = workbook.addWorksheet('Report');
              worksheet.addRow(Object.keys(report[0]));
              report.forEach(row => worksheet.addRow(Object.values(row)));
              const buffer = await workbook.xlsx.writeBuffer();
              const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'report.xlsx');
              document.body.appendChild(link);
              link.click();
              link.parentNode.removeChild(link);
            } catch (err) {
              setApiError(err?.message || 'Failed to export Excel');
            } finally {
              setLoading(false);
            }
          }}
        >📊 Export to Excel</button>
        <button
          className="btn btn-secondary"
          onClick={async (e) => {
            e.preventDefault();
            setLoading(true);
            setApiError('');
            try {
              // Use filters from form for PDF export
              const params = {};
              if (filterFormRef.current) {
                const form = filterFormRef.current;
                params.reportType = form.reportType.value;
                params.dateFrom = form.dateFrom.value;
                params.dateTo = form.dateTo.value;
                params.siteId = form.siteId.value;
                params.vehicleType = form.vehicleType.value;
              }
              const result = await exportReportPdf(params);
              const report = result.data || [];
              const doc = new jsPDF();
              if (report.length > 0) {
                const headers = Object.keys(report[0]);
                let y = 10;
                doc.text("Fuel Usage Report", 10, y);
                y += 10;
                doc.setFontSize(10);
                doc.text(headers.join(" | "), 10, y);
                y += 7;
                report.forEach(row => {
                  doc.text(headers.map(h => String(row[h])).join(" | "), 10, y);
                  y += 7;
                  if (y > 270) {
                    doc.addPage();
                    y = 10;
                  }
                });
              } else {
                doc.text("No data to export.", 10, 10);
              }
              doc.save("report.pdf");
            } catch (err) {
              setApiError(err?.response?.data?.message || err.message || 'Failed to export PDF');
            } finally {
              setLoading(false);
            }
          }}
        >📄 Export to PDF</button>
        <button
          className="btn btn-secondary"
          onClick={async (e) => {
            e.preventDefault();
            setLoading(true);
            setApiError('');
            try {
              await emailReport();
              alert('Report emailed successfully!');
            } catch (err) {
              setApiError(err?.response?.data?.message || err.message || 'Failed to email report');
            } finally {
              setLoading(false);
            }
          }}
        >📧 Email Report</button>
      </div>
      <WebAuthnButton />
      {apiError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>❌</span>
          <span>{apiError}</span>
        </div>
      )}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #015998',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      )}
      <TableComponent
        headers={reportHeaders}
        data={reportData}
        renderRow={(row) => (
          <>
            <td>{row.date}</td>
            <td>{row.site}</td>
            <td>{row.vehicle}</td>
            <td>{row.operator}</td>
            <td>{row.fuelUsed}</td>
            <td>{row.efficiency}</td>
            <td>
              <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                👁️ View
              </button>
            </td>
          </>
        )}
      />
      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Reports;
