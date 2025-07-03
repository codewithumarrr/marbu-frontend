import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InvoicePreview from '../components/InvoicePreview';
import { getInvoiceById } from '../services/invoicesService.js';
import { numberToWords } from '../utils/numberToWords.js';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      setLoading(true);
      try {
        const res = await getInvoiceById(id);
        const data = res?.data || {};
        setInvoice({
          invoiceNo: data.invoice_number || data.invoiceNo || '',
          supplier: data.supplier || data.sites?.site_name || '',
          date: data.invoice_date || '',
          dueDate: data.end_date || '',
          amount: typeof data.total_amount === 'number'
            ? data.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })
            : data.total_amount || '',
          status: data.status || 'Pending',
          items: data.items ?? [],
          generatedBy: data.generated_by_user?.employee_name || '',
        });
      } catch (err) {
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [id]);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!invoice) {
    return <div style={{ padding: 40, color: '#dc2626' }}>Invoice not found.</div>;
  }
 console.log(invoice)
  return (
    <div id="print-invoice" style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
   
      <InvoicePreview
        invoiceNo={invoice.invoiceNo}
        company={invoice.supplier}
        invoiceDate={invoice.date}
        invoiceMonth={invoice.date?.slice(5,7) === '05' ? 'MAY 2025' : 'JUN 2025'}
        total={invoice.amount}
        totalInWords={numberToWords(invoice.amount)}
        items={invoice.items}
        issuedBy={invoice.generatedBy || "Naeem Gul"}
        checkedBy="Ejaz Khan"
        approvedBy="Mohd Hazrat Gul"
      />
    </div>
  );
}