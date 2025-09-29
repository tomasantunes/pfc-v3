import React from 'react';
import Navbar from './Navbar';
import './Budgets.css';

export default function Budgets() {
  return (
    <div className="budgets">
      <Navbar />
      <div className="container">
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
                <td></td>
                <td className="text-end"></td>
                <td></td>
              </tr>
              </tbody>
              <tfoot>
              <tr>
                <td><input type="text" className="form-control" /></td>
                <td><input type="text" className="form-control" /></td>
                <td><button className="btn btn-primary btn-block">+</button></td>
              </tr>
              </tfoot>

            </table>
            <h3>Totals</h3>
            <table className="table-fill">
              <thead>
              </thead>
              <tr>
                <td style={{width: "40%"}}>Total Income</td>
                <td style={{width: "40%"}}><input type="text" className="form-control" /></td>
                <td style={{width: "20%"}}></td>
              </tr>
              <tr>
                <td>Total Expense</td>
                <td className="text-end"></td>
                <td></td>
              </tr>
              <tr>
                <td>Total Balance</td>
                <td className="text-end"></td>
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
  )
}
