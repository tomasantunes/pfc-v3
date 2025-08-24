import React, {useEffect, useState} from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import $ from 'jquery';

window.jQuery = $;
window.$ = $;
global.jQuery = $;
window.bootstrap = require('bootstrap');
var bootprompt = require('bootprompt');

export default function Home() {
  const [netWorth, setNetWorth] = useState("");
  const [averageMonthlyExpense, setAverageMonthlyExpense] = useState("");
  const [totalProfit, setTotalProfit] = useState("");
  const [expenseLast3Months, setExpenseLast3Months] = useState();

  function getNetWorth() {
    axios.get(config.BASE_URL + "/get-net-worth")
    .then(function(response) {
      setNetWorth(response.data.data.toString() + "€");
    })
    .catch(function(err) {
      bootprompt.alert("Error: " + err.message);
    });
  }

  function getAverageMonthlyExpense() {
    axios.get(config.BASE_URL + "/get-average-monthly-expense")
    .then(function(response) {
      setAverageMonthlyExpense(response.data.data.toString() + "€");
    })
    .catch(function(err) {
      bootprompt.alert("Error: " + err.message);
    });
  }

  function getTotalProfit() {
    axios.get(config.BASE_URL + "/get-total-profit")
    .then(function(response) {
      setTotalProfit(response.data.data.toString() + "€");
    })
    .catch(function(err) {
      bootprompt.alert("Error: " + err.message);
    });
  }

  function getExpenseLast3Months() {
    axios.get(config.BASE_URL + "/get-expense-last-3-months")
    .then(function(response) {
      setExpenseLast3Months(response.data.data);
    })
    .catch(function(err) {
      bootprompt.alert("Error: " + err.message);
    });
  }

  

  useEffect(() => {
    getNetWorth();
    getAverageMonthlyExpense();
    getTotalProfit();
    getExpenseLast3Months();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <div class="row">
          <div class="row text-center">
            <h1>Dashboard</h1>
          </div>
          <div class="col-md-4">
            <div class="dashboard-section mb-3">
              <div class="row">
                <h2>General Stats</h2>
              </div>
              <div class="row">
                <p><b>Net Worth:</b> {netWorth}</p>
                <p><b>Average Monthly Expense:</b> {averageMonthlyExpense}</p>
                <p><b>Total Profit:</b> {totalProfit}</p>
              </div>
            </div>
            <div class="dashboard-section mb-3">
              <div class="row">
                <h2>Expense Last 3 Months</h2>
              </div>
              <div class="row">
                {expenseLast3Months && expenseLast3Months.map((exp) => (
                  <p><b>{exp.mnth}/{exp.yr}</b> {exp.monthly_sum}€</p>
                ))}
              </div>
            </div>
          </div>
          <div class="col-md-4">

          </div>
          <div class="col-md-4">
            {/*
            <div class="dashboard-section mb-3">
              // TODO: new section
            </div>
            */}
          </div>
        </div>
      </div>
      
    </>
  )
}
