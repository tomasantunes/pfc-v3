import React, {useEffect, useState} from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import TextInputModal from './TextInputModal';
import {i18n} from '../libs/translations';
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
  const [estimatedData, setEstimatedData] = useState({
    incomePerHour: "",
    incomePerDay: "",
    incomePerWeek: "",
    incomePerMonth: "",
    incomePerYear: "",
    netSalaryPerMonth: "",
    netSalaryPerYear: "",
    grossSalaryPerMonth: "",
    grossSalaryPerYear: "",
  });

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

  function changeIncomePerHour(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      incomePerHour: newVal
    }));
  }

  function changeIncomePerDay(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      incomePerDay: newVal
    }));
  }

  function changeIncomePerWeek(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      incomePerWeek: newVal
    }));
  }

  function changeIncomePerMonth(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      incomePerMonth: newVal
    }));
  }

  function changeIncomePerYear(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      incomePerYear: newVal
    }));
  }

  function changeNetSalaryPerMonth(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      netSalaryPerMonth: newVal
    }));
  }

  function changeNetSalaryPerYear(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      netSalaryPerYear: newVal
    }));
  }

  function changeGrossSalaryPerMonth(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      grossSalaryPerMonth: newVal
    }));
  }

  function changeGrossSalaryPerYear(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      grossSalaryPerYear: newVal
    }));
  }

  function updateField(field, value) {
    axios.post("/update-estimated-data", {field, value})
    .then(function(response) {
      if (response.data.status == "OK") {
        bootprompt.alert("This field has been updated.");
      }
      else {
        bootprompt.alert("There has been an error updating this field.");
      }
    })
    .catch(function(err) {
      console.log("Error: " + err.message);
      bootprompt.alert("Error: " + err.message);
    });
  }

  function getEstimatedData() {
    axios.get("/get-estimated-data")
    .then(function(response) {
      console.log(response.data.data);
      setEstimatedData(response.data.data);
    })
    .catch(function(err) {
      console.log(err);
      bootprompt.alert("Error: " + err.message);
    });
  }

  function showIncomePerHourModal() {
    $('#incomePerHourModal').modal('show');
  }

  function showIncomePerDayModal() {
    $('#incomePerDayModal').modal('show');
  }

  function showIncomePerWeekModal() {
    $('#incomePerWeekModal').modal('show');
  }

  function showIncomePerMonthModal() {
    $('#incomePerMonthModal').modal('show');
  }

  function showIncomePerYearModal() {
    $('#incomePerYearModal').modal('show');
  }

  function showNetSalaryPerMonth() {
    $('#netSalaryPerMonthModal').modal('show');
  }

  function showNetSalaryPerYear() {
    $('#netSalaryPerYearModal').modal('show');
  }

  function showGrossSalaryPerMonth() {
    $('#grossSalaryPerMonthModal').modal('show');
  }

  function showGrossSalaryPerYear() {
    $('#grossSalaryPerYearModal').modal('show');
  }

  useEffect(() => {
    getNetWorth();
    getAverageMonthlyExpense();
    getTotalProfit();
    getExpenseLast3Months();
    getEstimatedData();
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
            <div class="dashboard-section mb-3">
              <h2>Dados Estimados</h2>
              <p><b>{i18n("Income Per Hour")}: </b> {estimatedData.incomePerHour} <div class="pencil-btn" onClick={showIncomePerHourModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Day")}: </b> {estimatedData.incomePerDay} <div class="pencil-btn" onClick={showIncomePerDayModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>Rendimento p/ semana: </b> {estimatedData.incomePerWeek} <div class="pencil-btn" onClick={showIncomePerWeekModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>Rendimento p/ mês: </b> {estimatedData.incomePerMonth} <div class="pencil-btn" onClick={showIncomePerMonthModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>Rendimento p/ ano: </b> {estimatedData.incomePerYear} <div class="pencil-btn" onClick={showIncomePerYearModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>Salário p/ Mês Líquido: </b> {estimatedData.netSalaryPerMonth} <div class="pencil-btn" onClick={showNetSalaryPerMonth}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>Salário p/ Ano Líquido: </b> {estimatedData.netSalaryPerYear} <div class="pencil-btn" onClick={showNetSalaryPerYear}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>Salário p/ Mês Bruto: </b> {estimatedData.grossSalaryPerMonth} <div class="pencil-btn" onClick={showGrossSalaryPerMonth}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>Salário p/ Ano Bruto: </b> {estimatedData.grossSalaryPerYear} <div class="pencil-btn" onClick={showGrossSalaryPerYear}><i class="fa-solid fa-pencil"></i></div></p>
            </div>
          </div>
        </div>
      </div>
      <TextInputModal
        id="incomePerHourModal"
        value={estimatedData.incomePerHour + "€"}
        setValue={changeIncomePerHour}
        updateField={() => updateField("incomePerHour", estimatedData.incomePerHour)}
      />
      <TextInputModal
        id="incomePerDayModal"
        value={estimatedData.incomePerDay + "€"}
        setValue={changeIncomePerDay}
        updateField={() => updateField("incomePerDay", estimatedData.incomePerDay)}
      />
      <TextInputModal
        id="incomePerWeekModal"
        value={estimatedData.incomePerWeek + "€"}
        setValue={changeIncomePerWeek}
        updateField={() => updateField("incomePerWeek", estimatedData.incomePerWeek)}
      />
      <TextInputModal
        id="incomePerMonthModal"
        value={estimatedData.incomePerMonth + "€"}
        setValue={changeIncomePerMonth}
        updateField={() => updateField("incomePerMonth", estimatedData.incomePerMonth)}
      />
      <TextInputModal
        id="incomePerYearModal"
        value={estimatedData.incomePerYear + "€"}
        setValue={changeIncomePerYear}
        updateField={() => updateField("incomePerYear", estimatedData.incomePerYear)}
      />
      <TextInputModal
        id="netSalaryPerMonthModal"
        value={estimatedData.netSalaryPerMonth + "€"}
        setValue={changeNetSalaryPerMonth}
        updateField={() => updateField("netSalaryPerMonth", estimatedData.netSalaryPerMonth)}
      />
      <TextInputModal
        id="netSalaryPerYearModal"
        value={estimatedData.netSalaryPerYear + "€"}
        setValue={changeNetSalaryPerYear}
        updateField={() => updateField("netSalaryPerYear", estimatedData.netSalaryPerYear)}
      />
      <TextInputModal
        id="grossSalaryPerMonthModal"
        value={estimatedData.grossSalaryPerMonth + "€"}
        setValue={changeGrossSalaryPerMonth}
        updateField={() => updateField("grossSalaryPerMonth", estimatedData.grossSalaryPerMonth)}
      />
      <TextInputModal
        id="grossSalaryPerYearModal"
        value={estimatedData.grossSalaryPerYear + "€"}
        setValue={changeGrossSalaryPerYear}
        updateField={() => updateField("grossSalaryPerYear", estimatedData.grossSalaryPerYear)}
      />
    </>
  )
}
