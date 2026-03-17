import React, {useState, useEffect} from 'react';
import Navbar from './Navbar';
import config from '../config';
import axios from 'axios';
import {i18n} from '../libs/translations';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [expensesByMonth, setExpensesByMonth] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  function loadExpenses() {
    axios.get(config.BASE_URL + "/expense-tracker/get-expenses")
      .then((response) => {
        setExpenses(response.data.data);
      })
      .catch((error) => {
        console.error("Error loading expenses:", error);
        MySwal.fire("Error: " + error.message);
      });
  }

  function loadExpensesByCategory() {
    axios.get(config.BASE_URL + "/expense-tracker/get-expenses-by-category")
    .then((response) => {
      setExpensesByCategory(response.data.data);
      const total = response.data.data.reduce((acc, curr) => acc + Number(curr.total_expense), 0);
      setTotalExpense(total);
    })
    .catch((error) => {
      console.error("Error loading expenses by category:", error);
      MySwal.fire("Error: " + error.message);
    });
  }

  function loadExpensesByMonth() {
    axios.get(config.BASE_URL + "/expense-tracker/get-expense-by-month")
    .then((response) => {
      setExpensesByMonth(response.data.data);
    })
    .catch((error) => {
      console.error("Error loading expenses by month:", error);
      MySwal.fire("Error: " + error.message);
    });
  }

  useEffect(() => {
    loadExpenses();
    loadExpensesByCategory();
    loadExpensesByMonth();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row mb-3">
          <h1>{i18n("Expense Tracker")}</h1>
          <h3>{i18n("Total Expense")}: {totalExpense.toFixed(2)}€</h3>
        </div>
        <div className="row mb-3">
          <h2>{i18n("Expenses By Category")}</h2>
          <table className="table table-striped table-bordered align-middle tasks">
            <thead className="table-dark">
              <tr>
                  <th>{i18n("Category")}</th>
                  <th>{i18n("Total Expense")}</th>
                  <th>{i18n("Percentage")}</th>
              </tr>
            </thead>
            <tbody>
                {expensesByCategory.map((expense, index) => (
                <tr key={index}>
                  <td>{expense.category_name}</td>
                  <td>{Number(expense.total_expense).toFixed(2)}€</td>
                  <td>{((Number(expense.total_expense) * 100) / totalExpense).toFixed(2)}%</td>
                </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="row mb-3">
          <h2>{i18n("Expenses By Month")}</h2>
          <table className="table table-striped table-bordered align-middle tasks">
            <thead className="table-dark">
              <tr>
                  <th>{i18n("Month")}</th>
                  <th>{i18n("Total Expense")}</th>
              </tr>
            </thead>
            <tbody>
                {expensesByMonth.map((expense, index) => (
                <tr key={index}>
                  <td>{expense.month}</td>
                  <td>{Number(expense.total_expense).toFixed(2)}€</td>
                </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="row mb-3">
          <h2>{i18n("Expenses")}</h2>
          <table className="table table-striped table-bordered align-middle tasks">
            <thead className="table-dark">
              <tr>
                  <th>{i18n("Category")}</th>
                  <th>{i18n("Amount")}</th>
                  <th>{i18n("Date")}</th>
                  <th></th>
              </tr>
            </thead>
            <tbody>
                {expenses.map((expense, index) => (
                <tr key={index}>
                  <td>{expense.category_name}</td>
                  <td>{Number(expense.amount).toFixed(2)}€</td>
                  <td>{expense.created_at}</td>
                  <td></td>
                </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
