import React, {useState, useEffect} from 'react';
import Navbar from './Navbar';
import config from '../config';
import axios from 'axios';
import {i18n} from '../libs/translations';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

function getResponseRows(response) {
  if (response.data.status !== "OK") {
    throw new Error(response.data.error || "Failed to load expense data.");
  }

  return Array.isArray(response.data.data) ? response.data.data : [];
}

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [expensesByMonth, setExpensesByMonth] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [totalExpense, setTotalExpense] = useState(0);

  function toggleMonth(month) {
    setExpandedMonths((current) => ({
      ...current,
      [month]: !current[month]
    }));
  }

  function loadExpenses() {
    axios.get(config.BASE_URL + "/expense-tracker/get-expenses")
      .then((response) => {
        setExpenses(getResponseRows(response));
      })
      .catch((error) => {
        console.error("Error loading expenses:", error);
        MySwal.fire("Error: " + error.message);
      });
  }

  function loadExpensesByCategory() {
    axios.get(config.BASE_URL + "/expense-tracker/get-expenses-by-category")
    .then((response) => {
      const categoryExpenses = getResponseRows(response);
      setExpensesByCategory(categoryExpenses);
      const total = categoryExpenses.reduce((acc, curr) => acc + Number(curr.total_expense), 0);
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
      setExpensesByMonth(getResponseRows(response));
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
                  <th>{i18n("Percentage")}</th>
              </tr>
            </thead>
            <tbody>
                {expensesByMonth.map((expense) => (
                  <React.Fragment key={expense.month}>
                    <tr
                      className="table-secondary"
                      onClick={() => toggleMonth(expense.month)}
                      style={{cursor: "pointer"}}
                      role="button"
                      tabIndex={0}
                      aria-expanded={Boolean(expandedMonths[expense.month])}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleMonth(expense.month);
                        }
                      }}
                    >
                      <td className="fw-bold">
                        <i className={`fa-solid ${expandedMonths[expense.month] ? "fa-chevron-down" : "fa-chevron-right"} me-2`}></i>
                        {expense.month}
                      </td>
                      <td className="fw-bold">{Number(expense.total_expense).toFixed(2)}€</td>
                      <td></td>
                    </tr>
                    {expandedMonths[expense.month] && (expense.categories || []).map((category) => (
                      <tr key={`${expense.month}-${category.category_name}`} className="table-light">
                        <td className="ps-5">{category.category_name}</td>
                        <td>{Number(category.total_expense).toFixed(2)}€</td>
                        <td>{Number(category.percentage).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </React.Fragment>
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
