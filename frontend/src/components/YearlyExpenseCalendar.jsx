import "flatpickr/dist/themes/airbnb.css";
import React, {useState, useEffect} from 'react';
import Navbar from './Navbar';
import config from '../config';
import axios from 'axios';
import {i18n} from '../libs/translations';
import { toLocaleISOString } from '../libs/utils';
import Flatpickr from "react-flatpickr";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)


export default function YearlyExpenseCalendar() {
  const [expenses, setExpenses] = useState([]);
  const [newExpenseDate, setNewExpenseDate] = useState('');
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  function loadExpenses() {
    axios.get(config.BASE_URL + "/api/yearly-expense-calendar/list")
    .then((response) => {
      setExpenses(response.data.data);
    })
    .catch((error) => {
      console.error("Error loading expenses:", error);
      MySwal.fire("Error: " + error.message);
    });
  }

  function handleAddExpense() {
    const newExpense = {
      yedate: toLocaleISOString(newExpenseDate).substring(0, 10),
      description: newExpenseDescription,
      amount: newExpenseAmount
    };

    axios.post(config.BASE_URL + "/api/yearly-expense-calendar/add", newExpense)
    .then((response) => {
      if (response.data.status === "OK") {
        MySwal.fire(i18n("Success"), i18n("Expense added successfully"), "success");
        loadExpenses();
      } else {
        MySwal.fire("Error: " + response.data.error);
      }
    })
    .catch((error) => {
      console.error("Error adding expense:", error);
      MySwal.fire("Error: " + error.message);
    });
  }

  useEffect(() => {
    loadExpenses();
  }, []);
  return (
    <>
      <Navbar />
      <div className="container">
        <h2>{i18n("Yearly Expense Calendar")}</h2>
        <table className="table table-striped table-bordered align-middle tasks">
          <thead className="table-dark">
            <tr>
                <th>{i18n("Date")}</th>
                <th>{i18n("Expense")}</th>
                <th>{i18n("Amount")}</th>
                <th></th>
            </tr>
          </thead>
          <tbody>
              {expenses.map((expense, index) => (
              <tr>
                <td>{expense.yedate}</td>
                <td>{expense.description}</td>
                <td>{expense.amount}€</td>
                <td>
                  
                </td>
              </tr>
              ))}
          </tbody>
        </table>
        <div className="row mt-3">
          <div className="col-md-3">
            <div className="form-group mb-2">
              <label>{i18n("Date")}</label>
              <Flatpickr className="form-control" value={newExpenseDate} onChange={([date]) => setNewExpenseDate(date)} />
            </div>
            <div className="form-group mb-2">
              <label>{i18n("Description")}</label>
              <input type="text" className="form-control" value={newExpenseDescription} onChange={(e) => setNewExpenseDescription(e.target.value)} />
            </div>
            <div className="form-group mb-2">
              <label>{i18n("Amount")}</label>
              <input type="number" className="form-control" value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleAddExpense}>{i18n("Add Expense")}</button>
          </div>
        </div>
      </div>
    </>
  )
}
