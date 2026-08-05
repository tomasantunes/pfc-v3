import React, {useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import config from '../config';
import Swal from 'sweetalert2';
import Chart from 'react-apexcharts';
import withReactContent from 'sweetalert2-react-content';
import Navbar from './Navbar';
import {i18n} from '../libs/translations';
import './Budgets.css';

const MySwal = withReactContent(Swal);
const emptySubItem = () => ({name: '', quantity: 1, unitPrice: '', totalPrice: 0});

export default function Budgets() {
  const [budgetId, setBudgetId] = useState(null);
  const [budgetTitle, setBudgetTitle] = useState('');
  const [budgets, setBudgets] = useState([]);
  const [rows, setRows] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [totalIncome, setTotalIncome] = useState(0);

  const totalExpense = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    [rows]
  );
  const totalBalance = (Number(totalIncome || 0) - totalExpense).toFixed(2);

  const chartOptions = useMemo(() => ({
    labels: rows.map(row => row.category),
    chart: {id: 'budget-chart'},
    legend: {position: 'bottom'},
    dataLabels: {
      enabled: true,
      formatter: (value, options) => `${value.toFixed(1)}% (${options.w.globals.series[options.seriesIndex].toFixed(2)})`
    },
    title: {
      text: `${i18n('Budget Distribution')}${budgetTitle ? ` - ${budgetTitle}` : ''}`,
      align: 'center',
      style: {fontSize: '20px'}
    }
  }), [rows, budgetTitle]);

  function loadBudgets() {
    axios.get(config.BASE_URL + '/load-budgets').then(response => {
      if (response.data.status === 'OK') setBudgets(response.data.data);
      else console.error(response.data.error);
    }).catch(error => console.error('Error loading budgets:', error));
  }

  function addCategory() {
    if (!newCategory.trim()) return;
    setRows([...rows, {category: newCategory.trim(), amount: 0, subItems: []}]);
    setNewCategory('');
  }

  function removeCategory(index) {
    setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  function addSubItem(rowIndex) {
    setRows(rows.map((row, index) => index === rowIndex
      ? {...row, subItems: [...(row.subItems || []), emptySubItem()]}
      : row));
  }

  function updateSubItem(rowIndex, subItemIndex, field, value) {
    setRows(rows.map((row, index) => {
      if (index !== rowIndex) return row;
      const subItems = (row.subItems || []).map((subItem, itemIndex) => {
        if (itemIndex !== subItemIndex) return subItem;
        const updated = {...subItem, [field]: value};
        updated.totalPrice = Number(updated.quantity || 0) * Number(updated.unitPrice || 0);
        return updated;
      });
      const amount = subItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
      return {...row, subItems, amount};
    }));
  }

  function removeSubItem(rowIndex, subItemIndex) {
    setRows(rows.map((row, index) => {
      if (index !== rowIndex) return row;
      const subItems = (row.subItems || []).filter((_, itemIndex) => itemIndex !== subItemIndex);
      const amount = subItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
      return {...row, subItems, amount};
    }));
  }

  function saveBudget() {
    axios.post(config.BASE_URL + '/save-budget', {
      id: budgetId,
      title: budgetTitle,
      income: Number(totalIncome || 0),
      expense: totalExpense,
      balance: Number(totalBalance),
      rows
    }).then(response => {
      if (response.data.status !== 'OK') return MySwal.fire('Error: ' + response.data.error);
      newBudget();
      loadBudgets();
      MySwal.fire(i18n('Budget saved successfully.'));
    }).catch(error => MySwal.fire('Error: ' + error.message));
  }

  function selectBudget(index) {
    const budget = budgets[index];
    setBudgetId(budget.id);
    setBudgetTitle(budget.title);
    setTotalIncome(budget.income);
    setRows((budget.rows || []).map(row => ({...row, subItems: row.subItems || []})));
  }

  function deleteBudget() {
    if (!budgetId) return MySwal.fire(i18n('Please select a budget to delete.'));
    if (!window.confirm(`${i18n('Are you sure you want to delete the budget:')} "${budgetTitle}"?`)) return;
    axios.post(config.BASE_URL + '/delete-budget', {id: budgetId}).then(response => {
      if (response.data.status !== 'OK') return MySwal.fire('Error: ' + response.data.error);
      setBudgets(budgets.filter(budget => budget.id !== budgetId));
      newBudget();
      MySwal.fire(i18n('Budget deleted successfully.'));
    }).catch(error => MySwal.fire('Error: ' + error.message));
  }

  function newBudget() {
    setBudgetId(null);
    setBudgetTitle('');
    setTotalIncome(0);
    setRows([]);
    setNewCategory('');
  }

  useEffect(loadBudgets, []);

  return (
    <div className="budgets">
      <Navbar />
      <div className="container-fluid budgets-layout">
        <aside className="budget-list">
          <h3>{i18n('Budgets')}</h3>
          <ul>
            {budgets.map((budget, index) => (
              <li key={budget.id} className={budget.id === budgetId ? 'active' : ''} onClick={() => selectBudget(index)}>
                {budget.title}
              </li>
            ))}
          </ul>
        </aside>

        <main className="budget-content">
          <section className="budget-chart-row">
            {rows.length > 0 && totalExpense > 0
              ? <Chart options={chartOptions} series={rows.map(row => Number(row.amount || 0))} type="pie" height={330} />
              : <h3>{i18n('Budget Distribution')}</h3>}
          </section>

          <section className="main budget-table-row">
            <div className="budget-heading">
              <h1>{i18n('Budget')}</h1>
              <div className="budget-actions">
                <button className="btn btn-secondary" onClick={newBudget}>{i18n('New')}</button>
                <button className="btn btn-danger" onClick={deleteBudget}>{i18n('Delete')}</button>
                <button className="btn btn-primary" onClick={saveBudget}>{i18n('Save')}</button>
              </div>
            </div>

            <div className="budget-summary">
              <label><b>{i18n('Title')}</b><input type="text" className="form-control" value={budgetTitle} onChange={event => setBudgetTitle(event.target.value)} /></label>
              <label><b>{i18n('Total Income')}</b><input type="number" step="0.01" className="form-control" value={totalIncome} onChange={event => setTotalIncome(event.target.value)} /></label>
              <div><b>{i18n('Total Expense')}</b><span>{totalExpense.toFixed(2)}</span></div>
              <div><b>{i18n('Total Balance')}</b><span>{totalBalance}</span></div>
            </div>

            <div className="table-responsive">
              <table className="table-fill budget-detail-table">
                <thead><tr>
                  <th>{i18n('Category')}</th><th>{i18n('Sub-item')}</th><th>{i18n('Quantity')}</th>
                  <th>{i18n('Unit Price')}</th><th>{i18n('Total Price')}</th><th></th>
                </tr></thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <React.Fragment key={`${row.id || 'new'}-${rowIndex}`}>
                      <tr className="category-row">
                        <td><strong>{row.category}</strong></td>
                        <td colSpan="3"><button className="btn btn-sm btn-outline-primary" onClick={() => addSubItem(rowIndex)}>+ {i18n('Add sub-item')}</button></td>
                        <td className="text-end"><strong>{Number(row.amount || 0).toFixed(2)}</strong></td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => removeCategory(rowIndex)}>-</button></td>
                      </tr>
                      {(row.subItems || []).map((subItem, subItemIndex) => (
                        <tr key={`${subItem.id || 'new'}-${subItemIndex}`}>
                          <td></td>
                          <td><input className="form-control" value={subItem.name} onChange={event => updateSubItem(rowIndex, subItemIndex, 'name', event.target.value)} /></td>
                          <td><input type="number" min="0" step="0.01" className="form-control" value={subItem.quantity} onChange={event => updateSubItem(rowIndex, subItemIndex, 'quantity', event.target.value)} /></td>
                          <td><input type="number" min="0" step="0.01" className="form-control" value={subItem.unitPrice} onChange={event => updateSubItem(rowIndex, subItemIndex, 'unitPrice', event.target.value)} /></td>
                          <td className="text-end">{Number(subItem.totalPrice || 0).toFixed(2)}</td>
                          <td><button className="btn btn-sm btn-outline-danger" onClick={() => removeSubItem(rowIndex, subItemIndex)}>-</button></td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
                <tfoot><tr>
                  <td><input className="form-control text-start" value={newCategory} placeholder={i18n('Category')} onChange={event => setNewCategory(event.target.value)} onKeyDown={event => event.key === 'Enter' && addCategory()} /></td>
                  <td colSpan="5"><button className="btn btn-primary" onClick={addCategory}>+ {i18n('Add category')}</button></td>
                </tr></tfoot>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
