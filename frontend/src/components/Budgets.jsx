import React, {useState, useEffect} from 'react';
import axios from 'axios';
import config from '../config';
import Swal from 'sweetalert2';
import Chart from "react-apexcharts";
import withReactContent from 'sweetalert2-react-content';
import Navbar from './Navbar';
import {i18n} from "../libs/translations";
import './Budgets.css';

const MySwal = withReactContent(Swal);

export default function Budgets() {
  const [budgetId, setBudgetId] = useState(null);
  const [budgetTitle, setBudgetTitle] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({category: "", amount: ""});
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [budgetChartOptions, setBudgetChartOptions] = useState(null);
  const [budgetChartSeries, setBudgetChartSeries] = useState(null);

  function removeRow(index) {
    setRows(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    setRows([...rows, newRow]);
    setNewRow({category: "", amount: ""});
    loadPieChart();
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

  function loadBudgets() {
    axios.get(config.BASE_URL + "/load-budgets")
    .then(response => {
      if (response.data.status === "OK") {
        console.log(response.data.data);
        setBudgets(response.data.data);
        loadPieChart();
      } else {
        console.error(response.data.error);
      }
    })
    .catch(error => {
      console.error("Error loading budgets:", error);
    });
  }

  function saveBudget() {
    const newBudget = {
      id: budgetId,
      title: budgetTitle,
      income: totalIncome,
      expense: totalExpense,
      balance: totalBalance,
      rows: rows
    };

    axios.post(config.BASE_URL + "/save-budget", newBudget)
    .then(response => {
      if (response.data.status === "OK") {
        setBudgetTitle("");
        setTotalIncome(0);
        setTotalExpense(0);
        setTotalBalance(0);
        setRows([]);
        loadBudgets();
        MySwal.fire(i18n("Budget saved successfully."));
      } else {
        MySwal.fire("Error: " + response.data.error);
      }
    })
    .catch(error => {
      MySwal.fire("Error: " + error.message);
    });
  }

  function setBudget(idx) {
    const budget = budgets[idx];
    setBudgetId(budget.id);
    setBudgetTitle(budget.title);
    setTotalIncome(budget.income);
    setTotalExpense(budget.expense);
    setTotalBalance(budget.balance);
    setRows(budget.rows);
    loadPieChart();
  }

  function loadPieChart() {
    const options = {
      labels: rows.map(r => r.category),
      options: {
        chart: { 
          id: 'budget-chart'
        },
        legend: { position: 'bottom' }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
          const value = opts.w.globals.series[opts.seriesIndex];
          return val.toFixed(1) + "% (" + value + ")";
        },
      },
      title: {
        text: i18n('Budget Distribution'),
        align: 'center',
        style: {
          fontSize: '20px'
        }
      }
    };

    const series = rows.map(r => Number(r.amount) || 0);

    setBudgetChartOptions(options);
    setBudgetChartSeries(series);
  }

  function deleteBudget() {
    if (!budgetTitle) {
      MySwal.fire(i18n("Please select a budget to delete."));
      return;
    }
    const budget = budgets.find(b => b.title === budgetTitle);
    if (!budget) {
      MySwal.fire(i18n("Budget not found."));
      return;
    }
    if (window.confirm(i18n("Are you sure you want to delete the budget:") + ` "${budget.title}"?`)) {
      axios.post(config.BASE_URL + "/delete-budget", {id: budget.id})
      .then(response => {
        if (response.data.status === "OK") {
          setBudgets(budgets.filter(b => b.id !== budget.id));
          setBudgetTitle("");
          setTotalIncome(0);
          setTotalExpense(0);
          setTotalBalance(0);
          setRows([]);
          MySwal.fire(i18n("Budget deleted successfully."));
        } else {
          MySwal.fire("Error: " + response.data.error);
        }
      })
      .catch(error => {
        MySwal.fire("Error: " + error.message);
      });
    }
  }

  useEffect(() => {
    loadBudgets();
    calculateTotals();
  }, [rows, totalIncome]);

  return (
    <div className="budgets">
      <Navbar />
      <div className="container">
        <div className="row">
          <div className="col-md-2 pt-4">
            <h3>{i18n("Budgets")}</h3>
            <ul>
              {budgets.map((b, index) => (
                <li key={index} style={{cursor: "pointer"}} onClick={() => setBudget(index)}>{b.title}</li>
              ))}
            </ul>
          </div>
          <div className="col-md-4">
            <div className="main">
              <h1>{i18n("Budget")}</h1>
              <div className="form-group mb-2">
                <label><b>{i18n("Title")}</b></label>
                <input type="text" className="form-control text-start" value={budgetTitle} onChange={e => setBudgetTitle(e.target.value)} />
              </div>
              <h3>{i18n("Expenses")}</h3>
              <table className="table-fill">
                <thead>
                <tr>
                  <th style={{width: "40%"}}>{i18n("Category")}</th>
                  <th style={{width: "40%"}} className="text-end">{i18n("Amount")}</th>
                  <th style={{width: "20%"}}></th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      {row.category}
                    </td>
                    <td className="text-end">
                      {row.amount}
                    </td>
                    <td>
                      <button className="btn btn-danger" onClick={() => removeRow(index)}>-</button>
                    </td>
                  </tr>
                ))}
                </tbody>
                <tfoot>
                <tr>
                  <td><input type="text" className="form-control" value={newRow.category} onChange={e => setNewRow({...newRow, category: e.target.value})} /></td>
                  <td><input type="text" className="form-control" value={newRow.amount} onChange={e => setNewRow({...newRow, amount: e.target.value})} /></td>
                  <td><button className="btn btn-primary btn-block" onClick={addRow}>+</button></td>
                </tr>
                </tfoot>

              </table>
              <h3>{i18n("Totals")}</h3>
              <table className="table-fill">
                <thead>
                </thead>
                <tr>
                  <td style={{width: "40%"}}>{i18n("Total Income")}</td>
                  <td style={{width: "40%"}}><input type="text" className="form-control" value={totalIncome} onChange={e => setTotalIncome(e.target.value)} /></td>
                  <td style={{width: "20%"}}></td>
                </tr>
                <tr>
                  <td>{i18n("Total Expense")}</td>
                  <td className="text-end">{totalExpense}</td>
                  <td></td>
                </tr>
                <tr>
                  <td>{i18n("Total Balance")}</td>
                  <td className="text-end">{totalBalance}</td>
                  <td></td>
                </tr>
                <tfoot>
                </tfoot>
              </table>
              <div className="mt-2 text-end">
                <button className="btn btn-danger ms-auto" onClick={deleteBudget}>{i18n("Delete")}</button>
                <button className="btn btn-primary ms-2" onClick={saveBudget}>{i18n("Save")}</button>
              </div>
            </div>
          </div>
          <div className="col-md-6 pt-4">
            {budgetChartOptions && budgetChartSeries &&
              <Chart
                options={budgetChartOptions}
                series={budgetChartSeries}
                type="pie"
                width="650"
              />
            }
          </div>
        </div>
      </div>
    </div>
  )
}
