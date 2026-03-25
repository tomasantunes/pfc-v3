import React, { useState } from "react";

/**
 * Props:
 * - title: string
 * - tableHeaders: array of objects -> [{ key: 'name', label: 'Name' }]
 * - tableData: array of objects -> [{ name: 'John', age: 30 }]
 * - rowsPerPage: number (optional)
 */
export default function PaginatedTable({
  title,
  tableHeaders = [],
  tableData = [],
  rowsPerPage = 5,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">{title}</h2>

      <div className="table-responsive">
        <table className="table table-striped table-fixed">
          <thead>
            <tr>
              {tableHeaders.map((header, index) => (
                <th key={index}>{header.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {tableHeaders.map((header, colIndex) => (
                    <td key={colIndex}>{row[header.key]}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
              Previous
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, i) => (
            <li
              key={i}
              className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => goToPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}

          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
