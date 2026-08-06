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
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [averageMonthlyExpense, setAverageMonthlyExpense] = useState(0);
  const [averageDailyExpense, setAverageDailyExpense] = useState(0);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [currentMonthClasses, setCurrentMonthClasses] = useState([]);
  const [expandedClasses, setExpandedClasses] = useState({});
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

  function loadExpenseSummary() {
    axios.get(config.BASE_URL + "/expense-tracker/get-summary")
    .then((response) => {
      if (response.data.status !== "OK") {
        throw new Error(response.data.error || "Failed to load expense summary.");
      }

      const summary = response.data.data || {};
      setDailyExpenses(Array.isArray(summary.daily_expenses) ? summary.daily_expenses : []);
      setAverageMonthlyExpense(Number(summary.average_monthly_expense) || 0);
      setAverageDailyExpense(Number(summary.average_daily_expense) || 0);
    })
    .catch((error) => {
      console.error("Error loading expense summary:", error);
      MySwal.fire("Error: " + error.message);
    });
  }

  function loadCurrentMonthClasses() {
    axios.get(config.BASE_URL + "/expense-tracker/get-current-month-by-class")
      .then((response) => setCurrentMonthClasses(getResponseRows(response)))
      .catch((error) => {
        console.error("Error loading current month expenses by class:", error);
        MySwal.fire("Error: " + error.message);
      });
  }

  useEffect(() => {
    loadExpenses();
    loadExpensesByCategory();
    loadExpensesByMonth();
    loadExpenseSummary();
    loadCurrentMonthClasses();
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
          <div className="col-md-6">
            <h2>{i18n("Expense Summary")}</h2>
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>{i18n("Label")}</th>
                  <th>{i18n("Value")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{i18n("Average Monthly Expense")}</td>
                  <td>{averageMonthlyExpense.toFixed(2)}€</td>
                </tr>
                <tr>
                  <td>{i18n("Average Daily Expense")}</td>
                  <td>{averageDailyExpense.toFixed(2)}€</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="row mb-3">
          <h2>{i18n("Current Month Expenses By Class")}</h2>
          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>{i18n("Class / Unit")}</th>
                  <th>{i18n("Total Expense")}</th>
                  <th>{i18n("Quantity")}</th>
                </tr>
              </thead>
              <tbody>
                {currentMonthClasses.map((expenseClass) => (
                  <React.Fragment key={expenseClass.class_name}>
                    <tr
                      className="table-secondary"
                      onClick={() => setExpandedClasses((current) => ({...current, [expenseClass.class_name]: !current[expenseClass.class_name]}))}
                      style={{cursor: "pointer"}}
                      role="button"
                      tabIndex={0}
                      aria-expanded={Boolean(expandedClasses[expenseClass.class_name])}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setExpandedClasses((current) => ({...current, [expenseClass.class_name]: !current[expenseClass.class_name]}));
                        }
                      }}
                    >
                      <td className="fw-bold">
                        <i className={`fa-solid ${expandedClasses[expenseClass.class_name] ? "fa-chevron-down" : "fa-chevron-right"} me-2`}></i>
                        {expenseClass.class_name}
                      </td>
                      <td className="fw-bold">{Number(expenseClass.total_expense).toFixed(2)}</td>
                      <td className="fw-bold">{expenseClass.quantity}</td>
                    </tr>
                    {expandedClasses[expenseClass.class_name] && (expenseClass.units || []).map((unit) => (
                      <tr key={`${expenseClass.class_name}-${unit.unit_name}`} className="table-light">
                        <td className="ps-5">{unit.unit_name}</td>
                        <td>{Number(unit.total_expense).toFixed(2)}</td>
                        <td>{unit.quantity}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="row mb-3">
          <h2>{i18n("Daily Expenses - Last 30 Days")}</h2>
          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>{i18n("Date")}</th>
                  <th>{i18n("Total Expense")}</th>
                </tr>
              </thead>
              <tbody>
                {dailyExpenses.map((expense) => (
                  <tr key={expense.expense_date}>
                    <td>{expense.expense_date}</td>
                    <td>{Number(expense.total_expense).toFixed(2)}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  <td>{(totalExpense > 0 ? (Number(expense.total_expense) * 100) / totalExpense : 0).toFixed(2)}%</td>
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
