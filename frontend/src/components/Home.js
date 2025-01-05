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

  useEffect(() => {
    getNetWorth();
    getAverageMonthlyExpense();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h3>Dashboard</h3>
        <p><b>Net Worth:</b> {netWorth}</p>
        <p><b>Average Monthly Expense:</b> {averageMonthlyExpense}</p>
      </div>
      
    </>
  )
}
