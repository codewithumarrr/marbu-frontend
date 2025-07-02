import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InvoicePreview from '../components/InvoicePreview';

const dummyData = [
  {
    id: 'INV-001',
    invoiceNo: 'INV-001',
    supplier: 'Division A',
    date: '2025-05-10',
    dueDate: '2025-06-10',
    amount: '10,000.00',
    status: 'Pending',
  },
  {
    id: 'INV-002',
    invoiceNo: 'INV-002',
    supplier: 'Division B',
    date: '2025-05-15',
    dueDate: '2025-06-15',
    amount: '20,000.00',
    status: 'Paid',
  },
  {
    id: 'INV-003',
    invoiceNo: 'INV-003',
    supplier: 'Division C',
    date: '2025-05-20',
    dueDate: '2025-06-20',
    amount: '15,500.00',
    status: 'Pending',
  },
  {
    id: 'INV-004',
    invoiceNo: 'INV-004',
    supplier: 'Division D',
    date: '2025-05-25',
    dueDate: '2025-06-25',
    amount: '18,750.00',
    status: 'Paid',
  },
];

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoice = dummyData.find(inv => inv.id === id);

  if (!invoice) {
    return <div style={{ padding: 40, color: '#dc2626' }}>Invoice not found.</div>;
  }

  return (
    <div id="print-invoice" style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <button className="btn btn-secondary" style={{ marginBottom: 24 }} onClick={() => navigate('/invoices')}>
        ← Back to Invoices
      </button>
      <InvoicePreview
        invoiceNo={invoice.invoiceNo}
        company={invoice.supplier}
        invoiceDate={invoice.date}
        invoiceMonth={invoice.date?.slice(5,7) === '05' ? 'MAY 2025' : 'JUN 2025'}
        total={invoice.amount}
        totalInWords={"Amount in words for demo only."}
        items={invoice.items}
        issuedBy="Naeem Gul"
        checkedBy="Ejaz Khan"
        approvedBy="Mohd Hazrat Gul"
      />
    </div>
  );
} 