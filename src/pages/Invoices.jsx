import React, { useState } from "react";
import "../styles/pages.css";
import FilterGroup from "../components/FilterGroup";
import TableComponent from "../components/TableComponent";
import Modal from "../components/Modal";

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
  const invoiceData = [
    {
      invoiceNo: "INV-2025-001",
      supplier: "Qatar Fuel Company",
      date: "2025-06-15",
      dueDate: "2025-07-15",
      amount: "QAR 5,500.00",
      status: "Pending",
    },
    {
      invoiceNo: "INV-2025-002",
      supplier: "Gulf Energy Ltd.",
      date: "2025-05-28",
      dueDate: "2025-06-28",
      amount: "QAR 8,200.00",
      status: "Paid",
    },
  ];

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

  const loadInvoices = () => {
    // Add logic to filter and load invoices
  };

  const createNewInvoice = () => {
    setIsCreateModalOpen(true);
  };

  const showInvoiceModal = (invoiceNo) => {
    const invoice = invoiceData.find((inv) => inv.invoiceNo === invoiceNo);
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
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

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    // Here you would add the new invoice to your data
    closeCreateModal();
  };

  return (
    <div id="invoices" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998' }}>Diesel Invoices</h2>
      <FilterGroup onSubmit={loadInvoices}>
        <div className="form-group">
          <label className="form-label">Invoice Type</label>
          <select className="form-select" id="invoiceType">
            <option value="supplier">Supplier Billing</option>
            <option value="internal">Internal Cost Allocation</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Supplier</label>
          <select className="form-select" id="invoiceSupplier">
            <option value="">All Suppliers</option>
            <option value="sup-001">Qatar Fuel Company</option>
            <option value="sup-002">Gulf Energy Ltd.</option>
            <option value="sup-003">Doha Petroleum</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date From</label>
          <input type="date" className="form-input" id="invoiceDateFrom" defaultValue="2025-05-01" />
        </div>
        <div className="form-group">
          <label className="form-label">Date To</label>
          <input type="date" className="form-input" id="invoiceDateTo" defaultValue="2025-06-21" />
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
      <TableComponent
        headers={invoiceHeaders}
        data={invoiceData}
        renderRow={(row) => (
          <>
            <td>{row.invoiceNo}</td>
            <td>{row.supplier}</td>
            <td>{row.date}</td>
            <td>{row.dueDate}</td>
            <td>{row.amount}</td>
            <td>
              <span className={`status-badge status-${row.status.toLowerCase()}`}>{row.status}</span>
            </td>
            <td>
              <button
                className="btn btn-secondary"
                style={{ padding: '5px 10px', fontSize: '12px' }}
                onClick={() => showInvoiceModal(row.invoiceNo)}
              >
                👁️ View
              </button>
            </td>
          </>
        )}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`Invoice Details: ${selectedInvoice?.invoiceNo || ""}`}
      >
        {selectedInvoice && (
          <div>
            <p>
              <strong>Supplier:</strong> {selectedInvoice.supplier}
            </p>
            <p>
              <strong>Date:</strong> {selectedInvoice.date}
            </p>
            <p>
              <strong>Due Date:</strong> {selectedInvoice.dueDate}
            </p>
            <p>
              <strong>Total Amount:</strong> {selectedInvoice.amount}
            </p>
            <p>
              <strong>Status:</strong> {selectedInvoice.status}
            </p>
          </div>
        )}
      </Modal>
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
    </div>
  );
}

export default Invoices;
