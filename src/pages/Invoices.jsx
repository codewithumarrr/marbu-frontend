import React, { useState, useEffect } from "react";
import "../styles/pages.css";
import FilterGroup from "../components/FilterGroup";
import TableComponent from "../components/TableComponent";
import Modal from "../components/Modal";
import InvoicePreview from '../components/InvoicePreview';
import {
  getAllInvoices,
  getFilteredInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generateInvoiceFromConsumption
} from "../services/invoicesService.js";
import { getAllDivisions } from "../services/divisionsService.js";
import { getAllEmployees } from "../services/employeesService.js";
import { getAllSuppliers } from "../services/suppliersService.js";
import { useNavigate } from 'react-router-dom';

function Invoices() {
  const invoiceHeaders = [
    "Invoice No.",
    "Supplier",
    "Date",
    "Due Date",
    "Total Amount",
    "Status",
    "Actions",
  ];

  const [invoiceData, setInvoiceData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [divisions, setDivisions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    site_id: '',
    invoice_date: '',
    start_date: '',
    end_date: '',
    total_amount: '',
    generated_by_user_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
    loadDivisions();
    loadSites();
    loadUsers();
    // eslint-disable-next-line
  }, []);

  const loadSuppliers = async () => {
    try {
      const res = await getAllSuppliers();
      setSuppliers(res || []);
    } catch (err) {}
  };

  // Use service for sites
  const loadSites = async () => {
    try {
      const { getReportSites } = await import("../services/reportsService.js");
      const sitesRes = await getReportSites();
      setSites(sitesRes?.data || []);
    } catch (err) {}
  };

  // Use getAllEmployees service for employees
  const loadUsers = async () => {
    try {
      const res = await getAllEmployees();
      setUsers(res?.data || []);
    } catch (err) {}
  };

  const loadDivisions = async () => {
    try {
      const res = await getAllDivisions();
      setDivisions(res?.data || []);
    } catch (err) {
      // Optionally handle error
    }
  };

  const loadInvoices = async (filters = {}) => {
    setLoading(true);
    setApiError('');
    try {
      // Build flexible payload
      const payload = {
        invoiceType: filters.invoiceType,
        supplierId: filters.supplierId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        page: filters.page || 1,
        limit: filters.limit || 10
      };
      // Use backend API for filtered invoices
      const res = await getFilteredInvoices(payload);
      setInvoiceData(res?.data?.invoices || []);
    } catch (err) {
      setApiError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const createNewInvoice = () => {
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setForm({ supplier: '', date: '', dueDate: '', amount: '', status: 'Pending' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    try {
      // Prepare payload for backend with correct field names
      const payload = {
        site_id: parseInt(form.site_id),
        invoice_date: form.invoice_date,
        start_date: form.start_date,
        end_date: form.end_date,
        total_amount: parseFloat(form.total_amount),
        generated_by_user_id: form.generated_by_user_id
      };
      await createInvoice(payload);
      closeCreateModal();
      loadInvoices();
    } catch (err) {
      setApiError(err?.response?.data?.message || err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="invoices" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998',fontSize:27,fontWeight:700 }}>Diesel Invoices</h2>
      <FilterGroup onSubmit={e => {
        e.preventDefault();
        const form = e.target;
        const filters = {
          invoiceType: form.invoiceType.value,
          supplierId: form.supplierId.value,
          dateFrom: form.dateFrom.value,
          dateTo: form.dateTo.value
        };
        loadInvoices(filters);
      }}>
        <div className="form-group">
          <label className="form-label">Invoice Type</label>
          <select className="form-select" id="invoiceType" name="invoiceType">
            <option value="supplier">Supplier Billing</option>
            <option value="internal">Internal Cost Allocation</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Division</label>
          <select className="form-select" id="supplierId" name="supplierId">
            <option value="">All Divisions</option>
            {divisions.map(div => (
              <option key={div.division_id} value={div.division_name}>
                {div.division_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date From</label>
          <input type="date" className="form-input" id="invoiceDateFrom" name="dateFrom" defaultValue="2025-05-01" />
        </div>
        <div className="form-group">
          <label className="form-label">Date To</label>
          <input type="date" className="form-input" id="invoiceDateTo" name="dateTo" defaultValue="2025-06-21" />
        </div>
        <div className="form-group" style={{ alignSelf: 'end' }}>
          <button type="submit" className="btn btn-primary">
            Load Invoices
          </button>
        </div>
      </FilterGroup>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button className="btn btn-success" onClick={createNewInvoice}>
          Create New Invoice
        </button>
      </div>
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
        headers={invoiceHeaders}
        data={invoiceData}
        renderRow={(row) => (
          <>
            <td>{row.invoiceNo || row.id}</td>
            <td>{row.supplier}</td>
            <td>{row.date}</td>
            <td>{row.dueDate}</td>
            <td>{row.amount}</td>
            <td>
              <span className={`status-badge status-${row.status?.toLowerCase()}`}>{row.status}</span>
            </td>
            <td>
              <button
                className="btn btn-secondary"
                style={{ padding: '5px 10px', fontSize: '12px' }}
                onClick={() => navigate(`/invoice/${row.id}`)}
              >
                👁️ View
              </button>
            </td>
          </>
        )}
      />
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Create New Invoice"
      >
        <form onSubmit={handleCreateSubmit}>
          {/* Supplier field removed, as supplier_id is not a direct field on invoice */}
          <div className="form-group">
            <label className="form-label">Site</label>
            <select
              className="form-select"
              name="site_id"
              value={form.site_id}
              onChange={handleFormChange}
              required
            >
              <option value="">Select Site</option>
              {sites.map(site => (
                <option key={site.site_id} value={site.site_id}>
                  {site.site_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Invoice Date</label>
            <input
              type="date"
              className="form-input"
              name="invoice_date"
              value={form.invoice_date}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              name="start_date"
              value={form.start_date}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              name="end_date"
              value={form.end_date}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Total Amount</label>
            <input
              type="number"
              className="form-input"
              name="total_amount"
              value={form.total_amount}
              onChange={handleFormChange}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Generated By</label>
            <select
              className="form-select"
              name="generated_by_user_id"
              value={form.generated_by_user_id}
              onChange={handleFormChange}
              required
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.employee_number} value={user.employee_number}>
                  {user.employee_name} ({user.employee_number})
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary">Create Invoice</button>
            <button type="button" className="btn btn-secondary" onClick={closeCreateModal}>Cancel</button>
          </div>
        </form>
      </Modal>
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

export default Invoices;
