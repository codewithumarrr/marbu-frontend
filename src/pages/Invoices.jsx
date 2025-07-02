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
  const [form, setForm] = useState({
    supplier: '',
    date: '',
    dueDate: '',
    amount: '',
    status: 'Pending',
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line
  }, []);

  const loadInvoices = async (filters = {}) => {
    setLoading(true);
    setApiError('');
    try {
      // Dummy data for UI testing
      const dummyData = [
        { id: 'INV-001', invoiceNo: 'INV-001', supplier: 'division-a', date: '2025-05-10', dueDate: '2025-06-10', amount: '10,000.00', status: 'Pending', items: [
          { description: 'MRJ-158', qty: '1000', unitPrice: '5.00', amount: '5,000.00' },
          { description: 'MRJ-159', qty: '500', unitPrice: '10.00', amount: '5,000.00' },
        ] },
        { id: 'INV-002', invoiceNo: 'INV-002', supplier: 'division-a', date: '2025-05-11', dueDate: '2025-06-11', amount: '11,000.00', status: 'Paid', items: [
          { description: 'MRJ-160', qty: '1100', unitPrice: '10.00', amount: '11,000.00' },
        ] },
        { id: 'INV-003', invoiceNo: 'INV-003', supplier: 'division-a', date: '2025-05-12', dueDate: '2025-06-12', amount: '12,000.00', status: 'Pending', items: [
          { description: 'MRJ-161', qty: '600', unitPrice: '10.00', amount: '6,000.00' },
          { description: 'MRJ-162', qty: '600', unitPrice: '10.00', amount: '6,000.00' },
        ] },
        { id: 'INV-004', invoiceNo: 'INV-004', supplier: 'division-a', date: '2025-05-13', dueDate: '2025-06-13', amount: '13,000.00', status: 'Paid', items: [
          { description: 'MRJ-163', qty: '1300', unitPrice: '10.00', amount: '13,000.00' },
        ] },
        { id: 'INV-005', invoiceNo: 'INV-005', supplier: 'division-a', date: '2025-05-14', dueDate: '2025-06-14', amount: '14,000.00', status: 'Pending', items: [
          { description: 'MRJ-164', qty: '700', unitPrice: '10.00', amount: '7,000.00' },
          { description: 'MRJ-165', qty: '700', unitPrice: '10.00', amount: '7,000.00' },
        ] },
        { id: 'INV-006', invoiceNo: 'INV-006', supplier: 'division-a', date: '2025-05-15', dueDate: '2025-06-15', amount: '15,000.00', status: 'Paid', items: [
          { description: 'MRJ-166', qty: '1500', unitPrice: '10.00', amount: '15,000.00' },
        ] },
        { id: 'INV-007', invoiceNo: 'INV-007', supplier: 'division-a', date: '2025-05-16', dueDate: '2025-06-16', amount: '16,000.00', status: 'Pending', items: [
          { description: 'MRJ-167', qty: '800', unitPrice: '10.00', amount: '8,000.00' },
          { description: 'MRJ-168', qty: '800', unitPrice: '10.00', amount: '8,000.00' },
        ] },
        { id: 'INV-008', invoiceNo: 'INV-008', supplier: 'division-a', date: '2025-05-17', dueDate: '2025-06-17', amount: '17,000.00', status: 'Paid', items: [
          { description: 'MRJ-169', qty: '1700', unitPrice: '10.00', amount: '17,000.00' },
        ] },
        // Other divisions
        { id: 'INV-009', invoiceNo: 'INV-009', supplier: 'division-b', date: '2025-05-18', dueDate: '2025-06-18', amount: '20,000.00', status: 'Paid', items: [
          { description: 'MRJ-170', qty: '2000', unitPrice: '10.00', amount: '20,000.00' },
        ] },
        { id: 'INV-010', invoiceNo: 'INV-010', supplier: 'division-c', date: '2025-05-19', dueDate: '2025-06-19', amount: '15,500.00', status: 'Pending', items: [
          { description: 'MRJ-171', qty: '1550', unitPrice: '10.00', amount: '15,500.00' },
        ] },
        { id: 'INV-011', invoiceNo: 'INV-011', supplier: 'division-d', date: '2025-05-20', dueDate: '2025-06-20', amount: '18,750.00', status: 'Paid', items: [
          { description: 'MRJ-172', qty: '1875', unitPrice: '10.00', amount: '18,750.00' },
        ] },
      ];
      // Simple filter logic for demo
      let filtered = dummyData;
      if (filters.supplierId) {
        filtered = filtered.filter(inv => inv.supplier === filters.supplierId);
      }
      if (filters.dateFrom) {
        filtered = filtered.filter(inv => inv.date >= filters.dateFrom);
      }
      if (filters.dateTo) {
        filtered = filtered.filter(inv => inv.date <= filters.dateTo);
      }
      setInvoiceData(filtered);
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
      await createInvoice(form);
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
            <option value="division-a">Division A</option>
            <option value="division-b">Division B</option>
            <option value="division-c">Division C</option>
            <option value="division-d">Division D</option>
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
          <div className="form-group">
            <label className="form-label">Supplier</label>
            <input
              type="text"
              className="form-input"
              name="supplier"
              value={form.supplier}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              name="dueDate"
              value={form.dueDate}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input
              type="text"
              className="form-input"
              name="amount"
              value={form.amount}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              name="status"
              value={form.status}
              onChange={handleFormChange}
              required
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
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
