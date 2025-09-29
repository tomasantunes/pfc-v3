import React, {useState, useEffect} from 'react';
import Navbar from './Navbar';
import './Budgets.css';

export default function Budgets() {
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({category: "", amount: ""});
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  function removeRow(index) {
    setRows(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    setRows([...rows, newRow]);
    setNewRow({category: "", amount: ""});
  }

  function calculateTotals() {
    let expense = 0;
    let balance = 0;
    rows.forEach(row => {
      expense += Number(row.amount) || 0;
    });
    balance = totalIncome - expense;
    setTotalExpense(expense);
    setTotalBalance(balance);
  }

  useEffect(() => {
    calculateTotals();
  }, [rows, totalIncome]);

  return (
    <div className="budgets">
      <Navbar />
      <div className="container">
        <div className="row">
          <div className="col-md-4">
          </div>
          <div className="col-md-4">
            <div className="main">
              <h1>Budget</h1>
              <h3>Expenses</h3>
              <table className="table-fill">
                <thead>
                <tr>
                  <th style={{width: "40%"}}>Category</th>
                  <th style={{width: "40%"}} className="text-end">Amount</th>
                  <th style={{width: "20%"}}></th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  {rows.map((row, index) => (
                    <React.Fragment key={index}>
                      <td>
                        {row.category}
                      </td>
                      <td className="text-end">
                        {row.amount}
                      </td>
                      <td>
                        <button className="btn btn-danger" onClick={() => removeRow(index)}>-</button>
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
                </tbody>
                <tfoot>
                <tr>
                  <td><input type="text" className="form-control" value={newRow.category} onChange={e => setNewRow({...newRow, category: e.target.value})} /></td>
                  <td><input type="text" className="form-control" value={newRow.amount} onChange={e => setNewRow({...newRow, amount: e.target.value})} /></td>
                  <td><button className="btn btn-primary btn-block" onClick={addRow}>+</button></td>
                </tr>
                </tfoot>

              </table>
              <h3>Totals</h3>
              <table className="table-fill">
                <thead>
                </thead>
                <tr>
                  <td style={{width: "40%"}}>Total Income</td>
                  <td style={{width: "40%"}}><input type="text" className="form-control" value={totalIncome} onChange={e => setTotalIncome(e.target.value)} /></td>
                  <td style={{width: "20%"}}></td>
                </tr>
                <tr>
                  <td>Total Expense</td>
                  <td className="text-end">{totalExpense}</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Total Balance</td>
                  <td className="text-end">{totalBalance}</td>
                  <td></td>
                </tr>
                <tfoot>
                </tfoot>
              </table>
            </div>
          </div>
          <div className="col-md-4">
          </div>
        </div>
      </div>
    </div>
  )
}
