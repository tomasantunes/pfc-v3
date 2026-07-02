import React, {useState, useEffect} from 'react';
import FileUploader from './FileUploader';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import {i18n} from '../libs/translations';
import {toLocaleISOString} from '../libs/utils';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Flatpickr from "react-flatpickr";

const MySwal = withReactContent(Swal);

export default function Santander() {
  const [extraExpense, setExtraExpense] = useState(0);
  const [extraExpenseDate, setExtraExpenseDate] = useState("");
  const [extraExpenses, setExtraExpenses] = useState([]);
  const [extraRevenueAmount, setExtraRevenueAmount] = useState(0);
  const [extraRevenueDate, setExtraRevenueDate] = useState("");
  const [extraRevenue, setExtraRevenue] = useState([]);

  function loadExtraExpenses() {
    axios.get(config.BASE_URL + "/get-extra-expenses")
    .then(function(response) {
      setExtraExpenses(response.data.data);
    })
    .catch(function() {
      MySwal.fire(i18n("Error loading extra expenses data."));
    });
  }

  function submitExtraExpense() {
    axios.post(config.BASE_URL + "/insert-extra-expense", {extraExpense, extraExpenseDate: toLocaleISOString(extraExpenseDate).substring(0, 10)})
    .then(function(response) {
      if (response.data.status == "OK") {
        MySwal.fire(i18n("Extra expense has been added successfully."));
      }
      else {
        MySwal.fire(i18n("Error adding extra expense."));
      }
    })
    .catch(function() {
      MySwal.fire(i18n("Error adding extra expense."));
    });
  }

  function loadExtraRevenue() {
    axios.get(config.BASE_URL + "/get-extra-revenue")
    .then(function(response) {
      if (response.data.status == "OK") {
        setExtraRevenue(response.data.data);
      }
      else {
        MySwal.fire(i18n("Error loading extra revenue data."));
      }
    })
    .catch(function() {
      MySwal.fire(i18n("Connection error."));
    });
  }

  function submitExtraRevenue() {
    axios.post(config.BASE_URL + "/insert-extra-revenue", {extraRevenueAmount, extraRevenueDate: toLocaleISOString(extraRevenueDate).substring(0, 10)})
    .then(function(response) {
      if (response.data.status == "OK") {
        MySwal.fire(i18n("Extra revenue has been added successfully."));
      }
      else {
        MySwal.fire(i18n("Error adding extra revenue."));
      }
    })
    .catch(function() {
      MySwal.fire(i18n("Error adding extra revenue."));
    });
  }

  useEffect(() => {
    loadExtraExpenses();
    loadExtraRevenue();
  }, []);
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="extra-revenue-form mb-3">
                <div className="form-group mb-2">
                  <label><b>{i18n("Insert Extra Revenue")}</b></label>
                  <input type="text" className="form-control" value={extraRevenueAmount} onChange={(e) => setExtraRevenueAmount(e.target.value)} />
                </div>

                <div className="form-group mb-2">
                  <label><b>{i18n("Date")}</b></label>
                  <Flatpickr className="form-control" value={extraRevenueDate} onChange={([date]) => setExtraRevenueDate(date)} />
                </div>

                <div style={{textAlign: "right"}}>
                  <button className="btn btn-primary" onClick={submitExtraRevenue}>{i18n("Submit")}</button>
                </div>
            </div>
            <div className="extra-revenue-list col-md-4">
              <h3>{i18n("Extra Revenue")}</h3>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>{i18n("Date")}</th>
                    <th>{i18n("Revenue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {extraRevenue.map((revenue, index) => (
                    <tr key={index}>
                      <td>{revenue.date}</td>
                      <td>{revenue.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="extra-expense-form mb-3">
              <div className="form-group mb-2">
                <label><b>{i18n("Insert Extra Expense")}</b></label>
                <input type="text" className="form-control" value={extraExpense} onChange={(e) => setExtraExpense(e.target.value)} />
              </div>

              <div className="form-group mb-2">
                <label><b>{i18n("Date")}</b></label>
                <Flatpickr className="form-control" value={extraExpenseDate} onChange={([date]) => setExtraExpenseDate(date)} />
              </div>

              <div style={{textAlign: "right"}}>
                <button className="btn btn-primary" onClick={submitExtraExpense}>{i18n("Submit")}</button>
              </div>
            </div>
            <div className="extra-expenses-list">
              <h3>{i18n("Extra Expenses")}</h3>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>{i18n("Date")}</th>
                    <th>{i18n("Expense")}</th>
                  </tr>
                </thead>
                <tbody>
                  {extraExpenses.map((expense, index) => (
                    <tr key={index}>
                      <td>{expense.date}</td>
                      <td>{expense.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
