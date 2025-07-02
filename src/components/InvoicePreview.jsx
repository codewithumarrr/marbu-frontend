import React, { useRef } from "react";
import html2pdf from 'html2pdf.js';

// Helper for PDF export (to be implemented later)
// import html2pdf from 'html2pdf.js';

const InvoicePreview = ({
  logoUrl = "https://i.ibb.co/YFHXfVz4/logo.png",
  blobUrl = "https://i.ibb.co/1t55NX5G/s-blob-v1-IMAGE-m-Lv-Z4-NP0tx-U.png",
  company = "Marbu",
  companyAddress = "Doha - Qatar",
  invoiceMonth = "MAR 2025",
  invoiceNo = "MRD-DIS-0016-2025",
  invoiceDate = "08/04/2025",
  subject = "Monthly Diesel Consumption Charge",
  items = [
    { description: "MRJ-158", qty: "27,747", unitPrice: "1.50", amount: "41,620.50" },
    { description: "MRJ-159", qty: "459", unitPrice: "1.50", amount: "688.50" },
    { description: "MRJ-162", qty: "426", unitPrice: "1.50", amount: "639.00" },
  ],
  total = "42,948.00",
  totalInWords = "forty two thousand nine hundred forty eight only.",
  issuedBy = "Naeem Gul",
  checkedBy = "Ejaz Khan",
  approvedBy = "Mohd Hazrat Gul",
  footerImg = "https://i.ibb.co/prR9PZvF/s-blob-v1-IMAGE-Acfj-L3-Uejf-I.png"
}) => {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  // Placeholder for PDF export
  const handlePDF = () => {
    if (printRef.current) {
      html2pdf().from(printRef.current).set({
        margin: 0,
        filename: 'invoice.pdf',
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }).save();
    }
  };

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.amount.replace(/,/g, '')), 0).toFixed(2);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={handlePrint}>Print</button>
        <button className="btn btn-secondary" onClick={handlePDF}>Export PDF</button>
      </div>
      <div className="invoice-container" ref={printRef}>
        <header className="invoice-header">
          <img src={logoUrl} alt="logo" />
          <img src={blobUrl} alt="blob" />
        </header>
        <div className="invoice-bottom-header" style={{ justifyContent: 'center' }}>
          <h1>INVOICE</h1>
          <h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>
            MARBU ROAD DIVISION (H2)
          </h3>
        </div>
        <section className="invoice-info">
          <div className="address-block">
            <h3>BILL TO:</h3>
            <p><strong>{company}</strong></p>
            <p>{companyAddress}</p>
          </div>
          <div className="info-block">
            <div className="invoice-info-item">
              <strong>Invoice Month: </strong> {invoiceMonth}
            </div>
            <div className="invoice-info-item">
              <strong>Invoice No: </strong> {invoiceNo}
            </div>
            <div className="invoice-info-item">
              <strong>Date: </strong> {invoiceDate}
            </div>
          </div>
        </section>
        <section className="subject">
          <p style={{ marginBottom: 0 }}>
            <b>Sub: {subject}</b>
          </p>
          <p style={{ marginTop: 0, color: 'gray' }}>
            We are please to submit our invoice regarding the above mentioned subject. Kindly find the details
          </p>
        </section>
        <section className="invoice-items">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.description}</td>
                  <td>{item.qty}</td>
                  <td>{item.unitPrice}</td>
                  <td>{item.amount}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ textAlign: 'right' }}><strong>Total Amount:</strong></td>
                <td><strong>{total}</strong></td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className="invoice-totals">
          <table>
            <tbody>
              <tr>
                <th>Subtotal:</th>
                <td>{subtotal}</td>
              </tr>
              <tr>
                <th>Total:</th>
                <td>{total}</td>
              </tr>
            </tbody>
          </table>
          <span className="in-words" style={{ textAlign: 'right' }}>
            <b>In Words Qar: </b> {totalInWords}
          </span>
        </section>
        <section className="invoice-info invoice-auth">
          <div><strong>Issued by:</strong> {issuedBy}</div>
          <div style={{ textAlign: 'center' }}><strong>Checked by:</strong> {checkedBy}</div>
          <div style={{ textAlign: 'right' }}><strong>Approved by:</strong> {approvedBy}</div>
        </section>
        <footer className="invoice-footer">
          <img src={footerImg} alt="footer" />
        </footer>
      </div>
      {/* Inline style tag for print and layout, copy from your HTML or import as CSS */}
      <style>{`
        .invoice-container { background-color: #fff; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 100%; padding: 10px; line-height: 1.6; transition: all 0.3s ease-in-out; box-sizing: border-box; display: flex; flex-direction: column; min-height: 98vh; }
        .invoice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
        .invoice-bottom-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
        .invoice-bottom-header h1 { color: #015998; font-size: 2.5em; margin: 0; font-weight: 700; line-height: 50px; }
        .invoice-bottom-header h3 { font-size: italic; margin: 0; }
        .company-details { text-align: right; }
        .company-details p { margin: 0; font-size: 0.9em; }
        .invoice-info { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .invoice-info strong { color: #015998; }
        .invoice-info-item { text-align: right; }
        .invoice-auth { border-top: 1px solid #eee; padding-top: 20px; }
        .address-section { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 20px; }
        .address-block p { margin: 0; font-size: 0.9em; }
        .address-block h3 { color: #25b86f; margin-top: 0; margin-bottom: 0; font-size: 1.2em; }
        .subject { font-size: 13px; margin-bottom: 20px; }
        .subject b { font-style: italic; }
        .invoice-items { margin-bottom: 40px; }
        .invoice-items table { width: 100%; border-collapse: collapse; text-align: left; }
        .invoice-items th, .invoice-items td { padding: 12px 15px; border-bottom: 1px solid #eee; }
        .invoice-items th { background-color: #f8f8f8; color: #015998; font-weight: 700; text-transform: uppercase; font-size: 0.85em; }
        .invoice-items td { font-size: 0.95em; }
        .invoice-items tr:hover td { background-color: #f5f5f5; }
        .invoice-totals { width: 100%; display: flex; align-items: flex-end; margin-bottom: 50px; flex-direction: column; }
        .invoice-totals table { width: 100%; max-width: 300px; border-collapse: collapse; }
        .invoice-totals th, .invoice-totals td { padding: 10px 15px; text-align: right; }
        .invoice-totals th { background-color: #f8f8f8; color: #015998; font-weight: 700; }
        .invoice-totals tr:last-child th, .invoice-totals tr:last-child td { border-top: 2px solid #25b86f; font-size: 1.2em; font-weight: 700; color: #015998; }
        .payment-terms { margin-bottom: 40px; padding-top: 20px; border-top: 1px solid #eee; }
        .payment-terms h3 { color: #25b86f; margin-bottom: 10px; font-size: 1.2em; }
        .payment-terms p { font-size: 0.9em; margin: 0; }
        .invoice-footer {
          text-align: center;
          font-size: 0.8em;
          color: #666;
          padding-top: 20px;
          border-top: 1px solid #eee;
          margin-top: auto;
          background: white;
          page-break-inside: avoid;
        }
        /* --- PRINT-ONLY CSS PATCH --- */
        @media print {
          .header, .nav-tabs, .btn, .content-panel, .table-container, .user-info {
            display: none !important;
            visibility: hidden !important;
          }
          #print-invoice {
            width: 100vw !important;
            min-height: 100vh !important;
            background: white !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            zoom: 0.85;
          }
          #print-invoice * {
            visibility: visible !important;
          }
          .invoice-items table, .invoice-items tr, .invoice-items td, .invoice-items th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .invoice-footer {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
        @page { margin: 0.5in; size: A4; }
      `}</style>
    </div>
  );
};

export default InvoicePreview; 