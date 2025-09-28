import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {requestCheckLogin} from "../libs/auth";
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import TextInputModal from './TextInputModal';
import {i18n} from '../libs/translations';
import Chart from "react-apexcharts";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [netWorth, setNetWorth] = useState("");
  const [averageMonthlyExpense, setAverageMonthlyExpense] = useState("");
  const [averageDailyExpense, setAverageDailyExpense] = useState("");
  const [averageWeeklyExpense, setAverageWeeklyExpense] = useState("");
  const [averageHourlyExpense, setAverageHourlyExpense] = useState("");
  const [averageAnnualExpense, setAverageAnnualExpense] = useState("");
  const [cryptoProfit, setCryptoProfit] = useState("");
  const [t212YearlyProfit, setT212YearlyProfit] = useState("");
  const [t212CurrentReturn, setT212CurrentReturn] = useState("");
  const [expenseLast12Months, setExpenseLast12Months] = useState();
  const [expenseLast12MonthsChartOptions, setExpenseLast12MonthsChartOptions] = useState();
  const [expenseLast12MonthsChartSeries, setExpenseLast12MonthsChartSeries] = useState();
  const [benefitsAnnualExpense, setBenefitsAnnualExpense] = useState("0");
  const [benefitsMonthlyExpense, setBenefitsMonthlyExpense] = useState("0");
  const [benefitsWeeklyExpense, setBenefitsWeeklyExpense] = useState("0");
  const [benefitsDailyExpense, setBenefitsDailyExpense] = useState("0");
  const [benefitsHourlyExpense, setBenefitsHourlyExpense] = useState("0");
  const [totalAnnualExpense, setTotalAnnualExpense] = useState("0");
  const [totalMonthlyExpense, setTotalMonthlyExpense] = useState("0");
  const [totalWeeklyExpense, setTotalWeeklyExpense] = useState("0");
  const [totalDailyExpense, setTotalDailyExpense] = useState("0");
  const [totalHourlyExpense, setTotalHourlyExpense] = useState("0");
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
    benefitsPerYear: "",
    expenseBenefitsPerYear: "",
    foodAssistancePerYear: "",
    technologyBenefitsPerYear: "",
    grossMonthlySalaryPlusBenefits: "",
    grossAnnualSalaryPlusBenefits: "",
  });

  function getNetWorth() {
    axios.get(config.BASE_URL + "/get-net-worth")
    .then(function(response) {
      setNetWorth(response.data.data?.toString() + "€");
    })
    .catch(function(err) {
      showError(err.message);
    });
  }

  function getAverageMonthlyExpense() {
    axios.get(config.BASE_URL + "/get-average-monthly-expense")
    .then(function(response) {
      setAverageMonthlyExpense(response.data.data?.toString());
    })
    .catch(function(err) {
      showError(err.message);
    });
  }

  function getAverageDailyExpense() {
    axios.get(config.BASE_URL + "/get-average-daily-expense")
    .then(function(response) {
      setAverageDailyExpense(response.data.data?.toString());
    })
    .catch(function(err) {
      showError(err.message);
    });
  }

  function getAverageWeeklyExpense() {
    setAverageWeeklyExpense((Number(averageMonthlyExpense) / 4).toFixed(2));
  }

  function getAverageHourlyExpense() {
    setAverageHourlyExpense((Number(averageDailyExpense) / 24).toFixed(2))
  }

  function getAverageAnnualExpense() {
    setAverageAnnualExpense((Number(averageMonthlyExpense) * 12).toFixed(2));
  }

  function getCryptoProfit() {
    axios.get(config.BASE_URL + "/get-crypto-profit")
    .then(function(response) {
      setCryptoProfit(response.data.data?.toString() + "€");
    })
    .catch(function(err) {
      showError(err.message);
    });
  }

  function getExpenseLast12Months() {
    axios.get(config.BASE_URL + "/get-expense-last-12-months")
    .then(function(response) {
      setExpenseLast12Months(response.data.data);
    })
    .catch(function(err) {
      showError(err.message);
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

  function changeBenefitsPerYear(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      benefitsPerYear: newVal
    }));
  }

  function changeExpenseBenefitsPerYear(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      expenseBenefitsPerYear: newVal
    }));
  }

  function changeFoodAssistancePerYear(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      foodAssistancePerYear: newVal
    }));
  }

  function changeTechnologyBenefitsPerYear(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      technologyBenefitsPerYear: newVal
    }));
  }

  function changeGrossMonthlySalaryPlusBenefits(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      grossMonthlySalaryPlusBenefits: newVal
    }));
  }

  function changeGrossAnnualSalaryPlusBenefits(newVal) {
    setEstimatedData(prev => ({
      ...prev,
      grossAnnualSalaryPlusBenefits: newVal
    }));
  }

  function updateField(field, value) {
    axios.post("/update-estimated-data", {field, value})
    .then(function(response) {
      if (response.data.status == "OK") {
        console.log("This field has been updated.");
      }
      else {
        MySwal.fire(i18n("There has been an error updating this field."));
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
      $('#benefitsPerYearModal').modal('hide');
      $('#expenseBenefitsPerYearModal').modal('hide');
      $('#foodAssistancePerYearModal').modal('hide');
      $('#technologyBenefitsPerYearModal').modal('hide');
      $('#grossMonthlySalaryPlusBenefitsModal').modal('hide');
      $('#grossAnnualSalaryPlusBenefitsModal').modal('hide');
    })
    .catch(function(err) {
      console.log("Error: " + err.message);
      showError(err.message);
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
      showError(err.message);
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

  function showBenefitsPerYear() {
    $('#benefitsPerYearModal').modal('show');
  }

  function showExpenseBenefitsPerYear() {
    $('#expenseBenefitsPerYearModal').modal('show');
  }

  function showFoodAssistancePerYear() {
    $('#foodAssistancePerYearModal').modal('show');
  }

  function showTechnologyBenefitsPerYear() {
    $('#technologyBenefitsPerYearModal').modal('show');
  }

  function showGrossMonthlySalaryPlusBenefits() {
    $('#grossMonthlySalaryPlusBenefitsModal').modal('show');
  }

  function showGrossAnnualSalaryPlusBenefits() {
    $('#grossAnnualSalaryPlusBenefitsModal').modal('show');
  }

  function getT212YearlyProfit() {
    axios.get(config.BASE_URL + "/get-t212-yearly-profit")
    .then(function(response) {
      if (response.data.status == "OK") {
        setT212YearlyProfit(response.data.data + "€");
      }
      else {
        setT212YearlyProfit("0€");
        showError(response.data.error);
      }
    })
    .catch(function(err) {
      showError(err.message);
    });
  }

  function getT212CurrentReturn() {
    axios.get(config.BASE_URL + "/get-t212-current-return")
    .then(function(response) {
      if (response.data.status == "OK") {
        setT212CurrentReturn(response.data.data + "€");
      }
      else {
        setT212CurrentReturn("0€");
        showError(response.data.error);
      }
    })
    .catch(function(err) {
      showError(err.message);
    });
  }

  function getBenefitsExpenses() {
    if (!estimatedData.benefitsPerYear || estimatedData.benefitsPerYear == "") return;
    setBenefitsAnnualExpense(estimatedData.benefitsPerYear);
    setBenefitsMonthlyExpense((Number(estimatedData.benefitsPerYear) / 12).toFixed(2));
    setBenefitsWeeklyExpense((Number(estimatedData.benefitsPerYear) / 52).toFixed(2));
    setBenefitsDailyExpense((Number(estimatedData.benefitsPerYear) / 365).toFixed(2));
    setBenefitsHourlyExpense((Number(estimatedData.benefitsPerYear) / 8760).toFixed(2));
  }

  function getTotalAnnualExpense() {
    if (
      !averageAnnualExpense || 
      averageAnnualExpense == "" || 
      !benefitsAnnualExpense || 
      benefitsAnnualExpense == "" ||
      !averageMonthlyExpense ||
      averageMonthlyExpense == "" ||
      !averageWeeklyExpense ||
      averageWeeklyExpense == "" ||
      !averageDailyExpense ||
      averageDailyExpense == "" ||
      !averageHourlyExpense ||
      averageHourlyExpense == "" ||
      !benefitsMonthlyExpense ||
      benefitsMonthlyExpense == "" ||
      !benefitsWeeklyExpense ||
      benefitsWeeklyExpense == "" ||
      !benefitsDailyExpense ||
      benefitsDailyExpense == "" ||
      !benefitsHourlyExpense ||
      benefitsHourlyExpense == ""
    ) return;
    setTotalAnnualExpense((Number(averageAnnualExpense) + Number(benefitsAnnualExpense)).toFixed(2));
    setTotalMonthlyExpense((Number(averageMonthlyExpense) + Number(benefitsMonthlyExpense)).toFixed(2));
    setTotalWeeklyExpense(((Number(averageWeeklyExpense) + Number(benefitsWeeklyExpense))).toFixed(2));
    setTotalDailyExpense(((Number(averageDailyExpense) + Number(benefitsDailyExpense))).toFixed(2));
    setTotalHourlyExpense(((Number(averageHourlyExpense) + Number(benefitsHourlyExpense))).toFixed(2));
  }

  useEffect(() => {
    getAverageWeeklyExpense();
    getAverageAnnualExpense();
  }, [averageMonthlyExpense]);

  useEffect(() => {
    getAverageHourlyExpense();
  }, [averageDailyExpense]);

  useEffect(() => {
    getBenefitsExpenses();
  }, [estimatedData]);

  useEffect(() => {
    if (expenseLast12Months) {
      const options = {
        chart: {
          id: 'expense-last-12-months',
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: false,
          }
        },
        xaxis: {
          categories: expenseLast12Months.reverse().map(item => (item.mnth < 10 ? "0" + item.mnth : item.mnth) + "/" + item.yr)
        }
      };

      const series = [{
        name: i18n("Expense Last 12 Months"),
        data: expenseLast12Months.reverse().map(item => Number(item.monthly_sum))
      }];
      setExpenseLast12MonthsChartOptions(options);
      setExpenseLast12MonthsChartSeries(series);
    }
  }, [expenseLast12Months]);

  useEffect(() => {
    getTotalAnnualExpense();
  }, [
    averageAnnualExpense, 
    averageMonthlyExpense, 
    averageWeeklyExpense, 
    averageDailyExpense, 
    averageHourlyExpense,
    benefitsAnnualExpense, 
    benefitsMonthlyExpense, 
    benefitsWeeklyExpense, 
    benefitsDailyExpense, 
    benefitsHourlyExpense
  ]);

  function checkLogin() {
    requestCheckLogin(function(isLoggedIn) {
      if (!isLoggedIn) {
        navigate("/login");
      }
      else {
        setIsLoggedIn(true);
      }
    })
  }

  function showError(error) {
    if (!(error == "Invalid Authorization." )) {
      MySwal.fire(error)
    }
  }

  useEffect(() => {
    checkLogin();
    getNetWorth();
    getAverageMonthlyExpense();
    getAverageDailyExpense();
    getCryptoProfit();
    getT212YearlyProfit();
    getT212CurrentReturn();
    getExpenseLast12Months();
    getEstimatedData();
  }, []);

  if (isLoggedIn) {
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
                <h2>{i18n("Returns")}</h2>
              </div>
              <div class="row">
                <p><b>{i18n("Net Worth")}:</b> {netWorth}</p>
                <p><b>{i18n("T212 Sales") + " " + new Date().getFullYear()}:</b> {t212YearlyProfit}</p>
                <p><b>{i18n("T212 Current Return")}:</b> {t212CurrentReturn}</p>
                <p><b>{i18n("Crypto Profit")}:</b> {cryptoProfit}</p>
              </div>
            </div>
            <div class="dashboard-section mb-3">
              <h2>{i18n("Earnings")}</h2>
              <p><b>{i18n("Income Per Hour")}: </b> {estimatedData.incomePerHour}€ <div class="pencil-btn" onClick={showIncomePerHourModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Day")}: </b> {estimatedData.incomePerDay}€ <div class="pencil-btn" onClick={showIncomePerDayModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Work Hour")}: </b> {estimatedData.incomePerWorkHour}€ <div class="pencil-btn" onClick={showIncomePerWorkHourModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Work Day")}: </b> {estimatedData.incomePerWorkDay}€ <div class="pencil-btn" onClick={showIncomePerWorkDayModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Week")}: </b> {estimatedData.incomePerWeek}€ <div class="pencil-btn" onClick={showIncomePerWeekModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Month")}:  </b> {estimatedData.incomePerMonth}€ <div class="pencil-btn" onClick={showIncomePerMonthModal}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Year")}: </b> {estimatedData.incomePerYear}€ <div class="pencil-btn" onClick={showIncomePerYearModal}><i class="fa-solid fa-pencil"></i></div></p>
              <hr />
              <p><b>{i18n("Net Monthly Salary")}: </b> {estimatedData.netSalaryPerMonth}€ <div class="pencil-btn" onClick={showNetSalaryPerMonth}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Net Annual Salary")}:  </b>{estimatedData.netSalaryPerYear}€ <div class="pencil-btn" onClick={showNetSalaryPerYear}><i class="fa-solid fa-pencil"></i></div></p>
              <hr />
              <p><b>{i18n("Gross Monthly Salary")}: </b> {estimatedData.grossSalaryPerMonth}€ <div class="pencil-btn" onClick={showGrossSalaryPerMonth}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Gross Annual Salary")}: </b> {estimatedData.grossSalaryPerYear}€ <div class="pencil-btn" onClick={showGrossSalaryPerYear}><i class="fa-solid fa-pencil"></i></div></p>
              <hr />
              <p><b>{i18n("Gross Monthly Salary Plus Benefits")}: </b> {estimatedData.grossMonthlySalaryPlusBenefits}€ <div class="pencil-btn" onClick={showGrossMonthlySalaryPlusBenefits}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Gross Annual Salary Plus Benefits")}: </b> {estimatedData.grossAnnualSalaryPlusBenefits}€ <div class="pencil-btn" onClick={showGrossAnnualSalaryPlusBenefits}><i class="fa-solid fa-pencil"></i></div></p>
              <hr />
              <p><b>{i18n("Total Benefits Per Year")}: </b> {estimatedData.benefitsPerYear}€ <div class="pencil-btn" onClick={showBenefitsPerYear}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Expense Benefits Per Year")}: </b> {estimatedData.expenseBenefitsPerYear}€ <div class="pencil-btn" onClick={showExpenseBenefitsPerYear}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Food Assistance Per Year")}: </b> {estimatedData.foodAssistancePerYear}€ <div class="pencil-btn" onClick={showFoodAssistancePerYear}><i class="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Technology Benefits Per Year")}: </b> {estimatedData.technologyBenefitsPerYear}€ <div class="pencil-btn" onClick={showTechnologyBenefitsPerYear}><i class="fa-solid fa-pencil"></i></div></p>
            </div>
          </div>
          <div class="col-md-8">
            <div class="dashboard-section mb-3">
              <h2>{i18n("Expenses")}</h2>
              <div class="row">
                <h3>{i18n("Expense Last 12 Months")}</h3>
              </div>
              <div class="row">
                {expenseLast12MonthsChartOptions && expenseLast12MonthsChartSeries && (
                  <Chart
                    options={expenseLast12MonthsChartOptions}
                    series={expenseLast12MonthsChartSeries}
                    type="bar"
                    width="800"
                    height="500"
                  />
                )}
              </div>
              <hr />
              <h3>{i18n("Total Expenses")}</h3>
              <div class="row">
                <p><b>{i18n("Total Annual Expense")}:</b> {totalAnnualExpense}€</p>
                <p><b>{i18n("Total Monthly Expense")}:</b> {totalMonthlyExpense}€</p>
                <p><b>{i18n("Total Weekly Expense")}:</b> {totalWeeklyExpense}€</p>
                <p><b>{i18n("Total Daily Expense")}:</b> {totalDailyExpense}€</p>
                <p><b>{i18n("Total Hourly Expense")}:</b> {totalHourlyExpense}€</p>
              </div>
              <hr />
              <h3>{i18n("Average Cash Expenses")}</h3>
              <div class="row">
                <p><b>{i18n("Average Annual Expense")}:</b> {averageAnnualExpense}€</p>
                <p><b>{i18n("Average Monthly Expense")}:</b> {averageMonthlyExpense}€</p>
                <p><b>{i18n("Average Weekly Expense")}:</b> {averageWeeklyExpense}€</p>
                <p><b>{i18n("Average Daily Expense")}:</b> {averageDailyExpense}€</p>
                <p><b>{i18n("Average Hourly Expense")}:</b> {averageHourlyExpense}€</p>
              </div>
              <hr />
              <h3>{i18n("Benefits Expenses")}</h3>
              <div class="row">
                <p><b>{i18n("Benefits Annual Expense")}:</b> {benefitsAnnualExpense}€</p>
                <p><b>{i18n("Benefits Monthly Expense")}:</b> {benefitsMonthlyExpense}€</p>
                <p><b>{i18n("Benefits Weekly Expense")}:</b> {benefitsWeeklyExpense}€</p>
                <p><b>{i18n("Benefits Daily Expense")}:</b> {benefitsDailyExpense}€</p>
                <p><b>{i18n("Benefits Hourly Expense")}:</b> {benefitsHourlyExpense}€</p>
              </div>
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
      <TextInputModal
        id="benefitsPerYearModal"
        value={estimatedData.benefitsPerYear}
        setValue={changeBenefitsPerYear}
        updateField={() => updateField("benefitsPerYear", estimatedData.benefitsPerYear)}
      />
      <TextInputModal
        id="expenseBenefitsPerYearModal"
        value={estimatedData.expenseBenefitsPerYear}
        setValue={changeExpenseBenefitsPerYear}
        updateField={() => updateField("expenseBenefitsPerYear", estimatedData.expenseBenefitsPerYear)}
      />
      <TextInputModal
        id="foodAssistancePerYearModal"
        value={estimatedData.foodAssistancePerYear}
        setValue={changeFoodAssistancePerYear}
        updateField={() => updateField("foodAssistancePerYear", estimatedData.foodAssistancePerYear)}
      />
      <TextInputModal
        id="technologyBenefitsPerYearModal"
        value={estimatedData.technologyBenefitsPerYear}
        setValue={changeTechnologyBenefitsPerYear}
        updateField={() => updateField("technologyBenefitsPerYear", estimatedData.technologyBenefitsPerYear)}
      />
      <TextInputModal
        id="grossMonthlySalaryPlusBenefitsModal"
        value={estimatedData.grossMonthlySalaryPlusBenefits}
        setValue={changeGrossMonthlySalaryPlusBenefits}
        updateField={() => updateField("grossMonthlySalaryPlusBenefits", estimatedData.grossMonthlySalaryPlusBenefits)}
      />
      <TextInputModal
        id="grossAnnualSalaryPlusBenefitsModal"
        value={estimatedData.grossAnnualSalaryPlusBenefits}
        setValue={changeGrossAnnualSalaryPlusBenefits}
        updateField={() => updateField("grossAnnualSalaryPlusBenefits", estimatedData.grossAnnualSalaryPlusBenefits)}
      />
    </>
  )
  }
  else {
    return (<></>);
  }
}
