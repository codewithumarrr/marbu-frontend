import React from "react";
import "../styles/components.css";

function TableComponent({ headers, data, renderRow, pagination }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {renderRow(row)}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 20 }}>
          <button
            onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
            style={{
              background: pagination.page === 1 ? '#e5e7eb' : 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
              color: pagination.page === 1 ? '#9ca3af' : '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontWeight: 600,
              cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
              fontSize: 14
            }}
          >
            ← Previous
          </button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => pagination.onPageChange(page)}
                style={{
                  background: pagination.page === page ? 'linear-gradient(135deg, #25b86f 0%, #015998 100%)' : '#fff',
                  color: pagination.page === page ? '#fff' : '#374151',
                  border: pagination.page === page ? 'none' : '1px solid #d1d5db',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontWeight: pagination.page === page ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: 14,
                  minWidth: 40
                }}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => pagination.onPageChange(Math.min(Math.ceil(pagination.total / pagination.limit), pagination.page + 1))}
            disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
            style={{
              background: pagination.page === Math.ceil(pagination.total / pagination.limit) ? '#e5e7eb' : 'linear-gradient(135deg, #25b86f 0%, #015998 100%)',
              color: pagination.page === Math.ceil(pagination.total / pagination.limit) ? '#9ca3af' : '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontWeight: 600,
              cursor: pagination.page === Math.ceil(pagination.total / pagination.limit) ? 'not-allowed' : 'pointer',
              fontSize: 14
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default TableComponent;
