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

  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
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
                <td>{expense.amount}€</td>
                <td>{expense.created_at}</td>
                <td></td>
              </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
