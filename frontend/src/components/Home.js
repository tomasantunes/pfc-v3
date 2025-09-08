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
  const [averageDailyExpense, setAverageDailyExpense] = useState("");
  const [tradingProfit, setTradingProfit] = useState("");
  const [expenseLast12Months, setExpenseLast12Months] = useState();
  const [estimatedData, setEstimatedData] = useState({
    incomePerHour: "",
    incomePerDay: "",
    incomePerWorkHour: "",
    incomePerWorkDay: "",
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

  function getAverageDailyExpense() {
    axios.get(config.BASE_URL + "/get-average-daily-expense")
    .then(function(response) {
      setAverageDailyExpense(response.data.data.toString() + "€");
    })
    .catch(function(err) {
      bootprompt.alert("Error: " + err.message);
    });
  }

  function getTotalProfit() {
    axios.get(config.BASE_URL + "/get-total-profit")
    .then(function(response) {
      setTradingProfit(response.data.data.toString() + "€");
    })
    .catch(function(err) {
      bootprompt.alert("Error: " + err.message);
    });
  }

  function getExpenseLast12Months() {
    axios.get(config.BASE_URL + "/get-expense-last-12-months")
    .then(function(response) {
      setExpenseLast12Months(response.data.data);
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

  function changeIncomePerWorkHour(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      incomePerWorkHour: newVal
    }));
  }

  function changeIncomePerWorkDay(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      incomePerWorkDay: newVal
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
        console.log("This field has been updated.");
      }
      else {
        bootprompt.alert(i18n("There has been an error updating this field."));
      }
      $('#incomePerHourModal').modal('hide');
      $('#incomePerDayModal').modal('hide');
      $('#incomePerWorkHourModal').modal('hide');
      $('#incomePerWorkDayModal').modal('hide');
      $('#incomePerWeekModal').modal('hide');
      $('#incomePerMonthModal').modal('hide');
      $('#incomePerYearModal').modal('hide');
      $('#netSalaryPerMonthModal').modal('hide');
      $('#netSalaryPerYearModal').modal('hide');
      $('#grossSalaryPerMonthModal').modal('hide');
      $('#grossSalaryPerYearModal').modal('hide');
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

  function showIncomePerWorkHourModal() {
    $('#incomePerWorkHourModal').modal('show');
  }

  function showIncomePerWorkDayModal() {
    $('#incomePerWorkDayModal').modal('show');
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
    getAverageDailyExpense();
    getTotalProfit();
    getExpenseLast12Months();
    getEstimatedData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <div class="row">
          <div class="row text-center">
            <h1>{i18n("Dashboard")}</h1>
          </div>
          <div class="col-md-4">
            <div class="dashboard-section mb-3">
              <div class="row">
                <h2>{i18n("General Stats")}</h2>
              </div>
              <div class="row">
                <p><b>{i18n("Net Worth")}:</b> {netWorth}</p>
                <p><b>{i18n("Average Monthly Expense")}:</b> {averageMonthlyExpense}</p>
                <p><b>{i18n("Average Daily Expense")}:</b> {averageDailyExpense}</p>
                <p><b>{i18n("Trading Profit") + " " + new Date().getFullYear()}:</b> {tradingProfit}</p>
              </div>
            </div>
            <div class="dashboard-section mb-3">
              <div class="row">
                <h2>{i18n("Expense Last 12 Months")}</h2>
              </div>
              <div class="row">
                {expenseLast12Months && expenseLast12Months.map((exp) => (
                  <p><b>{exp.mnth}/{exp.yr}</b> {exp.monthly_sum}€</p>
                ))}
              </div>
            </div>
          </div>
          <div class="col-md-4">
            
          </div>
          <div class="col-md-4">
            <div class="dashboard-section mb-3">
              <h2>{i18n("Estimated Data")}</h2>
              <p><b>{i18n("Income Per Hour")}: </b> {estimatedData.incomePerHour} <div class="pencil-btn" onClick={showIncomePerHourModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Day")}: </b> {estimatedData.incomePerDay} <div class="pencil-btn" onClick={showIncomePerDayModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Work Hour")}: </b> {estimatedData.incomePerWorkHour} <div class="pencil-btn" onClick={showIncomePerWorkHourModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Work Day")}: </b> {estimatedData.incomePerWorkDay} <div class="pencil-btn" onClick={showIncomePerWorkDayModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Week")}: </b> {estimatedData.incomePerWeek} <div class="pencil-btn" onClick={showIncomePerWeekModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Month")}:  </b> {estimatedData.incomePerMonth} <div class="pencil-btn" onClick={showIncomePerMonthModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Year")}: </b> {estimatedData.incomePerYear} <div class="pencil-btn" onClick={showIncomePerYearModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Net Monthly Salary")}: </b> {estimatedData.netSalaryPerMonth} <div class="pencil-btn" onClick={showNetSalaryPerMonth}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Net Annual Salary")}:  </b>{estimatedData.netSalaryPerYear} <div class="pencil-btn" onClick={showNetSalaryPerYear}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Gross Monthly Salary")}: </b> {estimatedData.grossSalaryPerMonth} <div class="pencil-btn" onClick={showGrossSalaryPerMonth}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Gross Annual Salary")}: </b> {estimatedData.grossSalaryPerYear} <div class="pencil-btn" onClick={showGrossSalaryPerYear}><i class="fa-solid fa-pencil"></i></div></p>
            </div>
          </div>
        </div>
      </div>
      <TextInputModal
        id="incomePerHourModal"
        value={estimatedData.incomePerHour}
        setValue={changeIncomePerHour}
        updateField={() => updateField("incomePerHour", estimatedData.incomePerHour)}
      />
      <TextInputModal
        id="incomePerDayModal"
        value={estimatedData.incomePerDay}
        setValue={changeIncomePerDay}
        updateField={() => updateField("incomePerDay", estimatedData.incomePerDay)}
      />
      <TextInputModal
        id="incomePerWorkHourModal"
        value={estimatedData.incomePerWorkHour}
        setValue={changeIncomePerWorkHour}
        updateField={() => updateField("incomePerWorkHour", estimatedData.incomePerWorkHour)}
      />
      <TextInputModal
        id="incomePerWorkDayModal"
        value={estimatedData.incomePerWorkDay}
        setValue={changeIncomePerWorkDay}
        updateField={() => updateField("incomePerWorkDay", estimatedData.incomePerWorkDay)}
      />
      <TextInputModal
        id="incomePerWeekModal"
        value={estimatedData.incomePerWeek}
        setValue={changeIncomePerWeek}
        updateField={() => updateField("incomePerWeek", estimatedData.incomePerWeek)}
      />
      <TextInputModal
        id="incomePerMonthModal"
        value={estimatedData.incomePerMonth}
        setValue={changeIncomePerMonth}
        updateField={() => updateField("incomePerMonth", estimatedData.incomePerMonth)}
      />
      <TextInputModal
        id="incomePerYearModal"
        value={estimatedData.incomePerYear}
        setValue={changeIncomePerYear}
        updateField={() => updateField("incomePerYear", estimatedData.incomePerYear)}
      />
      <TextInputModal
        id="netSalaryPerMonthModal"
        value={estimatedData.netSalaryPerMonth}
        setValue={changeNetSalaryPerMonth}
        updateField={() => updateField("netSalaryPerMonth", estimatedData.netSalaryPerMonth)}
      />
      <TextInputModal
        id="netSalaryPerYearModal"
        value={estimatedData.netSalaryPerYear}
        setValue={changeNetSalaryPerYear}
        updateField={() => updateField("netSalaryPerYear", estimatedData.netSalaryPerYear)}
      />
      <TextInputModal
        id="grossSalaryPerMonthModal"
        value={estimatedData.grossSalaryPerMonth}
        setValue={changeGrossSalaryPerMonth}
        updateField={() => updateField("grossSalaryPerMonth", estimatedData.grossSalaryPerMonth)}
      />
      <TextInputModal
        id="grossSalaryPerYearModal"
        value={estimatedData.grossSalaryPerYear}
        setValue={changeGrossSalaryPerYear}
        updateField={() => updateField("grossSalaryPerYear", estimatedData.grossSalaryPerYear)}
      />
    </>
  )
}
