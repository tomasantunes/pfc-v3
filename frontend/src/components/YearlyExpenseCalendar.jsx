import "flatpickr/dist/themes/airbnb.css";
import React, {useState, useEffect} from 'react';
import Navbar from './Navbar';
import config from '../config';
import axios from 'axios';
import {i18n} from '../libs/translations';
import { toLocaleISOString } from '../libs/utils';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)


export default function YearlyExpenseCalendar() {
  const [expenses, setExpenses] = useState([]);
  const [newExpenseDay, setNewExpenseDay] = useState('');
  const [newExpenseMonth, setNewExpenseMonth] = useState('');
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [showMonthInput, setShowMonthInput] = useState(true);

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
      yeday: newExpenseDay,
      yemonth: newExpenseMonth,
      description: newExpenseDescription,
      amount: newExpenseAmount,
      isMonthly: isMonthly
    };

    axios.post(config.BASE_URL + "/api/yearly-expense-calendar/add", newExpense)
    .then((response) => {
      if (response.data.status === "OK") {
        MySwal.fire(i18n("Success"), i18n("Expense added successfully"), "success");
        loadExpenses();
        setNewExpenseDay('');
        setNewExpenseMonth('');
        setNewExpenseDescription('');
        setNewExpenseAmount('');
      } else {
        MySwal.fire("Error: " + response.data.error);
      }
    })
    .catch((error) => {
      console.error("Error adding expense:", error);
      MySwal.fire("Error: " + error.message);
    });
  }

  function deleteExpense(expenseId) {
    MySwal.fire({
      title: i18n("Are you sure?"),
      text: i18n("Are you sure you want to delete this expense?"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: i18n("Yes"),
      cancelButtonText: i18n("No")
    }).then((result) => {
      if (result.isConfirmed) {
        axios.post(config.BASE_URL + "/api/yearly-expense-calendar/delete/" + expenseId)
        .then((response) => {
          if (response.data.status === "OK") {
            MySwal.fire(i18n("Deleted!"), i18n("Expense has been deleted."), "success");
            loadExpenses();
          } else {
            MySwal.fire("Error: " + response.data.error);
          }
        })
        .catch((error) => {
          console.error("Error deleting expense:", error);
          MySwal.fire("Error: " + error.message);
        });
      }
    });
  }

  useEffect(() => {
    if (isMonthly) {
      setShowMonthInput(false);
      setNewExpenseMonth("");
    }
    else {
      setShowMonthInput(true);
    }
  }, [isMonthly]);

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
                <td>{expense.yeday + "/" + expense.yemonth}</td>
                <td>{expense.description}</td>
                <td>{expense.amount}€</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => { deleteExpense(expense.id); }}>{i18n("Delete")}</button>
                </td>
              </tr>
              ))}
          </tbody>
        </table>
        <div className="row mt-3">
          <div className="col-md-3">
            <h3>{i18n("Add New Expense")}</h3>
            <div className="form-group mb-2">
              <input type="checkbox" checked={isMonthly} onChange={(e) => setIsMonthly(e.target.checked)} />
              <label>{i18n("Monthly")}</label>
            </div>
            <div className="form-group mb-2">
              <label>{i18n("Date")}</label>
              <div className="d-flex gap-2">
                <input type="number" className="form-control w-auto" value={newExpenseDay} onChange={(e) => setNewExpenseDay(e.target.value)} placeholder={i18n("Day")} />
                {showMonthInput && 
                  <input type="number" className="form-control w-auto" value={newExpenseMonth} onChange={(e) => setNewExpenseMonth(e.target.value)} placeholder={i18n("Month")} />
                }
              </div>
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
