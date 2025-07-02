import React, { useRef } from "react";
import html2pdf from 'html2pdf.js';
import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';

const ReportPreview = ({
  logoUrl = "https://i.ibb.co/YFHXfVz4/logo.png",
  blobUrl = "https://i.ibb.co/1t55NX5G/s-blob-v1-IMAGE-m-Lv-Z4-NP0tx-U.png",
  footerImg = "https://i.ibb.co/prR9PZvF/s-blob-v1-IMAGE-Acfj-L3-Uejf-I.png",
  division = "ROAD DIVISION",
  reportTitle = "EQUIPMENT DIESEL SUPPLY REPORT",
  month = "MAR 2025",
  jobNumber = "MAR 2025",
  items = [
    { sn: 1, plateNo: "MRJ-158", equipment: "Excavator", date: "2025-03-01", jobNo: "JOB-001", ltrs: "27747", hours: "120", driver: "Ali Khan", signature: "--" },
    { sn: 2, plateNo: "MRJ-159", equipment: "Bulldozer", date: "2025-03-02", jobNo: "JOB-002", ltrs: "459", hours: "98", driver: "Sami Ullah", signature: "--" },
    { sn: 3, plateNo: "MRJ-162", equipment: "Loader", date: "2025-03-03", jobNo: "JOB-003", ltrs: "426", hours: "110", driver: "Fahad", signature: "--" },
    { sn: 4, plateNo: "MRJ-163", equipment: "Crane", date: "2025-03-04", jobNo: "JOB-004", ltrs: "500", hours: "130", driver: "Imran", signature: "--" },
    { sn: 5, plateNo: "MRJ-164", equipment: "Grader", date: "2025-03-05", jobNo: "JOB-005", ltrs: "600", hours: "140", driver: "Naveed", signature: "--" },
  ],
  subtotal = "42,948.00",
  total = "42,948.00"
}) => {
  const printRef = useRef();
  const handlePrint = () => window.print();
  const handlePDF = () => {
    if (printRef.current) {
      html2pdf().from(printRef.current).set({
        margin: 0,
        filename: 'report.pdf',
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }).save();
    }
  };
  const handleExcel = async () => {
    if (!printRef.current) return;
    // Capture the report as an image
    const canvas = await html2canvas(printRef.current, { useCORS: true, scale: 2 });
    const dataUrl = canvas.toDataURL('image/png');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    // Add the image to the worksheet
    const imageId = workbook.addImage({ base64: dataUrl, extension: 'png' });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: canvas.width / 2, height: canvas.height / 2 },
    });
    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'report.xlsx');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={handlePrint}>Print</button>
        <button className="btn btn-secondary" onClick={handlePDF}>Export PDF</button>
        <button className="btn btn-success" onClick={handleExcel}>Export Excel</button>
      </div>
      <div className="invoice-container" ref={printRef}>
        <header className="invoice-header">
          <img src={logoUrl} alt="logo" />
          <img src={blobUrl} alt="blob" />
        </header>
        <div className="invoice-bottom-header" style={{ justifyContent: 'center' }}>
          <h1>{division}</h1>
          <h3 style={{ textAlign: 'center', fontStyle: 'italic' }}>{reportTitle}</h3>
        </div>
        <section className="invoice-info">
          <div className="info-block">
            <div className="invoice-info-item"><strong>Month: </strong> {month}</div>
          </div>
          <div className="info-block">
            <div className="invoice-info-item"><strong>Job Number: </strong> {jobNumber}</div>
          </div>
        </section>
        <section className="invoice-items">
          <table>
            <thead>
              <tr>
                <th>S.N</th>
                <th>PLATE NO</th>
                <th>DATE</th>
                <th>EQUIPMENT</th>
                <th>JOB NO</th>
                <th>LTRS</th>
                <th>EQUIPMENT HRS/KM</th>
                <th>DRIVER</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.sn}</td>
                  <td>{item.plateNo}</td>
                  <td>{item.date}</td>
                  <td>{item.equipment}</td>
                  <td>{item.jobNo}</td>
                  <td>{item.ltrs}</td>
                  <td>{item.hours}</td>
                  <td>{item.driver}</td>
                </tr>
              ))}
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
        </section>
        <footer className="invoice-footer">
          <img src={footerImg} alt="footer" />
        </footer>
      </div>
      <style>{`
        .invoice-container { background-color: #fff; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 100%; padding: 10px; line-height: 1.6; transition: all 0.3s ease-in-out; box-sizing: border-box; display: flex; flex-direction: column; min-height: 98vh; }
        .invoice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
        .invoice-header img { max-width: 150px; height: auto; }
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
        .invoice-footer { text-align: center; font-size: 0.8em; color: #666; padding-top: 20px; border-top: 1px solid #eee; margin-top: auto; background: white; page-break-inside: avoid; }
        @media print {
          body * { visibility: hidden !important; }
          .header, .nav-tabs, .btn, .user-info { display: none !important; }
          #print-report, #print-report * { visibility: visible !important; }
          #print-report {
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

export default ReportPreview; 