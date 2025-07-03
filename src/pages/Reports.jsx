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
import ReportPreview from '../components/ReportPreview';

function Reports() {
  const reportHeaders = [
    "Date",
    "Site",
    "Vehicle/Equipment",
    "Name",
    "Fuel Used (L)",
    "Efficiency",
    "Actions",
  ];
  const [reportData, setReportData] = useState([]);
  const [sites, setSites] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  // Default filter values
  const [defaultFilters] = useState({
    reportType: "monthly",
    dateFrom: "",
    dateTo: "",
    siteId: "",
    jobId: "",
    vehicleType: "",
    name: "",
    plateNumber: "",
    fuelMin: "",
    fuelMax: "",
    efficiency: ""
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

  // Removed dummyReportData

  const handleGenerateReport = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setApiError('');
    let filters = {};
    if (filterFormRef.current) {
      const form = filterFormRef.current;
      // Flexible dropdown-based payload
      filters.reportType = form.reportType.value;
      // Date logic: single or range
      if (form.dateFrom.value && !form.dateTo.value) {
        filters.dateFrom = form.dateFrom.value;
        filters.dateTo = form.dateFrom.value;
      } else if (!form.dateFrom.value && form.dateTo.value) {
        filters.dateFrom = form.dateTo.value;
        filters.dateTo = form.dateTo.value;
      } else {
        filters.dateFrom = form.dateFrom.value;
        filters.dateTo = form.dateTo.value;
      }
      if (form.siteId.value) filters.siteId = form.siteId.value;
      if (form.jobId && form.jobId.value) filters.jobId = form.jobId.value;
      if (form.vehicleType.value) filters.vehicleType = form.vehicleType.value;
      if (form.efficiency && form.efficiency.value) filters.efficiency = form.efficiency.value;
      // Add more dropdowns here as needed (e.g., operator dropdown)
    } else {
      filters = { ...defaultFilters };
    }
    try {
      const data = await generateFuelUsageReport(filters);
      setReportData((data?.data?.reportData && data.data.reportData.length > 0)
        ? data.data.reportData
        : []);
    } catch (err) {
      setApiError(err?.response?.data?.message || err.message || 'Failed to generate report');
      setReportData([]);
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
      setReportData((data?.data?.reportData && data.data.reportData.length > 0)
        ? data.data.reportData
        : []);
    } catch (err) {
      setApiError(err?.response?.data?.message || err.message || 'Failed to generate report');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="reports" className="content-panel">
      {selectedReport ? (
        <div id="print-report" style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
          <button className="btn btn-secondary" style={{ marginBottom: 24 }} onClick={() => setSelectedReport(null)}>
            ← Back to Reports
          </button>
          <ReportPreview
            month={selectedReport.date?.slice(0, 7) || 'MAR 2025'}
            jobNumber={selectedReport.jobNumber || '---'}
            items={reportData.map((row, idx) => ({
              sn: idx + 1,
              plateNo: row.plateNumber || row.vehicle?.match(/\(([^)]+)\)/)?.[1] || '',
              equipment: row.vehicle?.split(' (')[0] || '',
              date: row.date,
              jobNo: row.jobNumber,
              ltrs: row.fuelUsed,
              hours: row.odometerReading || '--',
              name: row.name,
              signature: '--',
            }))}
            subtotal={reportData.reduce((sum, row) => sum + (parseFloat(row.fuelUsed) || 0), 0).toLocaleString()}
            total={reportData.reduce((sum, row) => sum + (parseFloat(row.fuelUsed) || 0), 0).toLocaleString()}
          />
        </div>
      ) : (
        <>
          <h2 style={{ marginBottom: '20px', color: '#015998',fontSize:27,fontWeight:700 }}>Fuel Usage Reports</h2>
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
              <select className="form-select" name="jobId" defaultValue={defaultFilters.jobId}>
                <option value="">All Jobs</option>
                {sites.map(site => (
                  <option key={site.site_id || site.id} value={site.site_id || site.id}>{site.site_name || site.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Plate Number Wise</label>
              <select className="form-select" name="vehicleType" defaultValue={defaultFilters.vehicleType}>
                <option value="">All Plate Numbers</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            {/* Remove text inputs for operator and plate number, keep dropdowns only */}
          </form>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerateReport}
            >🔍 Generate Report</button>
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
          {/* <WebAuthnButton /> */}
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
                <td>{row.name}</td>
                <td>{row.fuelUsed}</td>
                <td>{row.efficiency}</td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => setSelectedReport(row)}>
                    👁️ View
                  </button>
                </td>
              </>
            )}
            pagination={{
              page: 1,
              limit: 50,
              total: reportData.length,
              onPageChange: async (newPage) => {
                setLoading(true);
                let filters = {};
                if (filterFormRef.current) {
                  const form = filterFormRef.current;
                  filters = {
                    reportType: form.reportType.value,
                    dateFrom: form.dateFrom.value,
                    dateTo: form.dateTo.value,
                    siteId: form.siteId.value,
                    jobId: form.jobId ? form.jobId.value : "",
                    vehicleType: form.vehicleType.value,
                    name: form.name ? form.name.value : "",
                    plateNumber: form.plateNumber ? form.plateNumber.value : "",
                    fuelMin: form.fuelMin ? form.fuelMin.value : "",
                    fuelMax: form.fuelMax ? form.fuelMax.value : "",
                    efficiency: form.efficiency ? form.efficiency.value : "",
                    page: newPage
                  };
                }
                try {
                  const resp = await generateFuelUsageReport(filters);
                  setReportData((resp?.data?.reportData && resp.data.reportData.length > 0)
                    ? resp.data.reportData
                    : []);
                } catch (err) {
                  setApiError(err?.response?.data?.message || err.message || 'Failed to generate report');
                  setReportData([]);
                } finally {
                  setLoading(false);
                }
              }
            }}
          />
        </>
      )}
      {/* CSS for animations and responsiveness */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          form[ref], .content-panel form {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .btn {
            width: 100%;
            min-width: 0;
          }
        }
        @media (max-width: 600px) {
          .content-panel {
            padding: 8px !important;
          }
          form[ref], .content-panel form {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .btn {
            width: 100%;
            min-width: 0;
            font-size: 14px;
            padding: 10px 0;
          }
          .form-group {
            width: 100%;
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

export default Reports;
