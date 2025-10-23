import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {requestCheckLogin} from "../libs/auth";
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import TextInputModal from './TextInputModal';
import NetWorthChart from './NetWorthChart';
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
  const [revolutYearlyProfit, setRevolutYearlyProfit] = useState("");
  const [revolutCurrentReturn, setRevolutCurrentReturn] = useState("");
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
  const [totalInventoryValue, setTotalInventoryValue] = useState("0");
  const [netWorthSnapshots, setNetWorthSnapshots] = useState([]);
  const [netWorthChartData, setNetWorthChartData] = useState(Array(12).fill(null));
  const [xpValue, setXpValue] = useState("0");
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
  const [creditAndDebtData, setCreditAndDebtData] = useState({
    credit_limit: "",
    total_debt: "",
    monthly_debt_payment: "",
    interest_rate: "",
    time_to_payoff_months: ""
  });
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  function getNetWorth() {
    axios.get(config.BASE_URL + "/get-net-worth")
    .then(function(response) {
      setNetWorth(response.data.data?.toString());
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

  function changeCreditLimit(newVal) {
    setCreditAndDebtData(prev => ({
      ...prev,
      credit_limit: newVal
    }));
  }

  function changeTotalDebt(newVal) {
    setCreditAndDebtData(prev => ({
      ...prev,
      total_debt: newVal
    }));
  }
  
  function changeMonthlyDebtPayment(newVal) {
    setCreditAndDebtData(prev => ({
      ...prev,
      monthly_debt_payment: newVal
    }));
  }

  function changeInterestRate(newVal) {
    setCreditAndDebtData(prev => ({
      ...prev,
      interest_rate: newVal
    }));
  }

  function changeTimeToPayoffMonths(newVal) {
    setCreditAndDebtData(prev => ({
      ...prev,
      time_to_payoff_months: newVal
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
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerHourModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerDayModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerWorkHourModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerWorkDayModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerWeekModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerMonthModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerYearModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#netSalaryPerMonthModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#netSalaryPerYearModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#grossSalaryPerMonthModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#grossSalaryPerYearModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#benefitsPerYearModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#expenseBenefitsPerYearModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#foodAssistancePerYearModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#technologyBenefitsPerYearModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#grossMonthlySalaryPlusBenefitsModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#grossAnnualSalaryPlusBenefitsModal'))
      modal.hide();
    })
    .catch(function(err) {
      console.log("Error: " + err.message);
      showError(err.message);
    });
  }

  function updateCreditAndDebtField(field, value) {
    axios.post("/update-credit-and-debt-data", {field, value})
    .then(function(response) {
      if (response.data.status == "OK") {
        console.log("This field has been updated.");
      }
      else {
        MySwal.fire(i18n("There has been an error updating this field."));
      }
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#creditLimitModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#totalDebtModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#monthlyDebtPaymentModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#creditLimitModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#interestRateModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#creditLimitModal'))
      modal.hide();
      var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#timeToPayoffMonthsModal'))
      modal.hide();
    })
    .catch(function(err) {
      console.log("Error: " + err.message);
      showError(err.message);
    });
  }

  function getEstimatedData() {
    axios.get("/get-estimated-data")
    .then(function(response) {
      setEstimatedData(response.data.data);
    })
    .catch(function(err) {
      console.log(err);
      showError(err.message);
    });
  }

  function getCreditAndDebtData() {
    axios.get("/get-credit-and-debt-data")
    .then(function(response) {
      setCreditAndDebtData(response.data.data);
    })
    .catch(function(err) {
      console.log(err);
      showError(err.message);
    });
  }

  function showIncomePerHourModal() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerHourModal'))
    modal.show();
  }

  function showIncomePerDayModal() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerDayModal'))
    modal.show();
  }

  function showIncomePerWorkHourModal() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerWorkHourModal'))
    modal.show();
  }

  function showIncomePerWorkDayModal() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerWorkDayModal'))
    modal.show();
  }

  function showIncomePerWeekModal() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerWeekModal'))
    modal.show();
  }

  function showIncomePerMonthModal() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerMonthModal'))
    modal.show();
  }

  function showIncomePerYearModal() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#incomePerYearModal'))
    modal.show();
  }

  function showNetSalaryPerMonth() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#netSalaryPerMonthModal'))
    modal.show();
  }

  function showNetSalaryPerYear() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#netSalaryPerYearModal'))
    modal.show();
  }

  function showGrossSalaryPerMonth() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#grossSalaryPerMonthModal'))
    modal.show();
  }

  function showGrossSalaryPerYear() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#grossSalaryPerYearModal'))
    modal.show();
  }

  function showBenefitsPerYear() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#benefitsPerYearModal'))
    modal.show();
  }

  function showCreditLimit() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#creditLimitModal'))
    modal.show();
  }

  function showTotalDebt() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#totalDebtModal'))
    modal.show();
  }

  function showMonthlyDebtPayment() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#monthlyDebtPaymentModal'))
    modal.show();
  }

  function showInterestRate() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#interestRateModal'))
    modal.show();
  }

  function showTimeToPayoffMonths() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#timeToPayoffMonthsModal'))
    modal.show();
  }

  function showExpenseBenefitsPerYear() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#expenseBenefitsPerYearModal'))
    modal.show();
  }

  function showFoodAssistancePerYear() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#foodAssistancePerYearModal'))
    modal.show();
  }

  function showTechnologyBenefitsPerYear() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#technologyBenefitsPerYearModal'))
    modal.show();
  }

  function showGrossMonthlySalaryPlusBenefits() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#grossMonthlySalaryPlusBenefitsModal'))
    modal.show();
  }

  function showGrossAnnualSalaryPlusBenefits() {
    var modal = bootstrap.Modal.getOrCreateInstance(document.querySelector('#grossAnnualSalaryPlusBenefitsModal'))
    modal.show();
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

  function getRevolutYearlyProfit() {
    axios.get(config.BASE_URL + "/get-revolut-yearly-profit")
    .then(function(response) {
      if (response.data.status == "OK") {
        setRevolutYearlyProfit(response.data.data + "€");
      }
      else {
        setRevolutYearlyProfit("0€");
        showError(response.data.error);
      }
    })
    .catch(function(err) {
      showError(err.message);
    });
  }

  function getRevolutCurrentReturn() {
    axios.get(config.BASE_URL + "/get-revolut-current-return")
    .then(function(response) {
      if (response.data.status == "OK") {
        setRevolutCurrentReturn(response.data.data + "€");
      }
      else {
        setRevolutCurrentReturn("0€");
        showError(response.data.error);
      }
    })
    .catch(function(err) {
      showError(err.message);
    });
  }

  function getTotalInventoryValue() {
    axios.get(config.BASE_URL + "/get-inventory-value")
    .then(function(response) {
      if (response.data.status == "OK") {
        setTotalInventoryValue(Number(response.data.data).toFixed(2));
      }
      else {
        setTotalInventoryValue("0€");
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

  function getNetWorthSnapshots() {
    axios.get(config.BASE_URL + "/get-net-worth-snapshots")
    .then(function(response) {
      if (response.data.status == "OK") {
        setNetWorthSnapshots(response.data.data);
      }
      else {
        setNetWorthSnapshots([]);
        showError(response.data.error);
      }
    })
    .catch(function(err) {
      showError(err.message);
    });
  }

  function saveCurrentNetWorth() {
    axios.post(config.BASE_URL + "/save-net-worth", { net_worth: Number(netWorth) })
    .then(function(response) {
      if (response.data.status == "OK") {
        MySwal.fire(i18n("Net worth has been saved."));
        getNetWorthSnapshots();
      }
      else {
        showError(response.data.error);
      }
    })
    .catch(function(err) {
      showError(err.message);
    });
  }

  function getXpValue() {
    axios.get(config.BASE_URL + "/get-xp")
    .then(function(response) {
      if (response.data.status == "OK") {
        setXpValue(String(response.data.data * 10));
      }
      else {
        setXpValue("0");
        showError(response.data.error);
      }
    })
    .catch(function(err) {
      showError(err.message);
    });
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
    if (netWorthSnapshots.length > 0) {
      const monthlyData = Array(12).fill(null);
      netWorthSnapshots.forEach(snapshot => {
        const month = new Date(snapshot.created_at).getMonth();
        if (monthlyData[month] === null) {
          monthlyData[month] = 0;
        }
        monthlyData[month] += snapshot.net_worth;
      });
      setNetWorthChartData(monthlyData);
    }
  }, [netWorthSnapshots]);

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
    if (expenseLast12Months && benefitsMonthlyExpense != "") {
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
          categories: expenseLast12Months.toReversed().map(item => (item.mnth < 10 ? "0" + item.mnth : item.mnth) + "/" + item.yr)
        }
      };

      const series = [{
        name: i18n("Expense Last 12 Months"),
        data: expenseLast12Months.toReversed().map(item => Math.round(Number(item.monthly_sum) + Number(benefitsMonthlyExpense)))
      }];
      setExpenseLast12MonthsChartOptions(options);
      setExpenseLast12MonthsChartSeries(series);
    }
  }, [expenseLast12Months, benefitsMonthlyExpense]);

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
    getRevolutYearlyProfit();
    getRevolutCurrentReturn();
    getTotalInventoryValue();
    getExpenseLast12Months();
    getEstimatedData();
    getCreditAndDebtData();
    getNetWorthSnapshots();
    getXpValue();
  }, []);

  if (isLoggedIn) {
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row">
          <div className="row text-center my-4">
            <h1>{i18n("Dashboard")}</h1>
          </div>
          <div className="col-md-4">
            <div className="dashboard-section mb-3">
              <div className="row">
                <h2>{i18n("Returns")}</h2>
              </div>
              <div className="row">
                <p><b>{i18n("Net Worth")}:</b> {netWorth}€</p>
                <p><b>{i18n("T212 Sales" + " " + new Date().getFullYear())}:</b> {t212YearlyProfit}</p>
                <p><b>{i18n("T212 Current Return")}:</b> {t212CurrentReturn}</p>
                <p><b>{i18n("Revolut Sales" + " " + new Date().getFullYear())}:</b> {revolutYearlyProfit}</p>
                <p><b>{i18n("Revolut Current Return")}:</b> {revolutCurrentReturn}</p>
                <p><b>{i18n("Crypto Profit")}:</b> {cryptoProfit}</p>
                <p><b>{i18n("Total Inventory Value")}:</b> {totalInventoryValue}€</p>
                <p><b>{i18n("XP Value")}:</b> {xpValue}€</p>
              </div>
            </div>
            <div className="dashboard-section mb-3">
              <h2>{i18n("Earnings")}</h2>
              <p><b>{i18n("Income Per Hour")}: </b> {estimatedData.incomePerHour}€ <div className="pencil-btn" onClick={showIncomePerHourModal}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Day")}: </b> {estimatedData.incomePerDay}€ <div className="pencil-btn" onClick={showIncomePerDayModal}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Work Hour")}: </b> {estimatedData.incomePerWorkHour}€ <div className="pencil-btn" onClick={showIncomePerWorkHourModal}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Work Day")}: </b> {estimatedData.incomePerWorkDay}€ <div className="pencil-btn" onClick={showIncomePerWorkDayModal}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Week")}: </b> {estimatedData.incomePerWeek}€ <div className="pencil-btn" onClick={showIncomePerWeekModal}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Month")}:  </b> {estimatedData.incomePerMonth}€ <div className="pencil-btn" onClick={showIncomePerMonthModal}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Income Per Year")}: </b> {estimatedData.incomePerYear}€ <div className="pencil-btn" onClick={showIncomePerYearModal}><i className="fa-solid fa-pencil"></i></div></p>
              <hr />
              <p><b>{i18n("Net Monthly Salary")}: </b> {estimatedData.netSalaryPerMonth}€ <div className="pencil-btn" onClick={showNetSalaryPerMonth}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Net Annual Salary")}:  </b>{estimatedData.netSalaryPerYear}€ <div className="pencil-btn" onClick={showNetSalaryPerYear}><i className="fa-solid fa-pencil"></i></div></p>
              <hr />
              <p><b>{i18n("Gross Monthly Salary")}: </b> {estimatedData.grossSalaryPerMonth}€ <div className="pencil-btn" onClick={showGrossSalaryPerMonth}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Gross Annual Salary")}: </b> {estimatedData.grossSalaryPerYear}€ <div className="pencil-btn" onClick={showGrossSalaryPerYear}><i className="fa-solid fa-pencil"></i></div></p>
              <hr />
              <p><b>{i18n("Gross Monthly Salary Plus Benefits")}: </b> {estimatedData.grossMonthlySalaryPlusBenefits}€ <div className="pencil-btn" onClick={showGrossMonthlySalaryPlusBenefits}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Gross Annual Salary Plus Benefits")}: </b> {estimatedData.grossAnnualSalaryPlusBenefits}€ <div className="pencil-btn" onClick={showGrossAnnualSalaryPlusBenefits}><i className="fa-solid fa-pencil"></i></div></p>
              <hr />
              <p><b>{i18n("Total Benefits Per Year")}: </b> {estimatedData.benefitsPerYear}€ <div className="pencil-btn" onClick={showBenefitsPerYear}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Expense Benefits Per Year")}: </b> {estimatedData.expenseBenefitsPerYear}€ <div className="pencil-btn" onClick={showExpenseBenefitsPerYear}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Food Assistance Per Year")}: </b> {estimatedData.foodAssistancePerYear}€ <div className="pencil-btn" onClick={showFoodAssistancePerYear}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Technology Benefits Per Year")}: </b> {estimatedData.technologyBenefitsPerYear}€ <div className="pencil-btn" onClick={showTechnologyBenefitsPerYear}><i className="fa-solid fa-pencil"></i></div></p>
            </div>
            <div className="dashboard-section mb-3">
              <h2>{i18n("Credit and Debt")}</h2>
              <p><b>{i18n("Credit Limit")}: </b> {creditAndDebtData.credit_limit}€ <div className="pencil-btn" onClick={showCreditLimit}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Total Debt")}: </b> {creditAndDebtData.total_debt}€ <div className="pencil-btn" onClick={showTotalDebt}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Monthly Debt Payment")}: </b> {creditAndDebtData.monthly_debt_payment}€ <div className="pencil-btn" onClick={showMonthlyDebtPayment}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Interest Rate")}: </b> {creditAndDebtData.interest_rate}% <div className="pencil-btn" onClick={showInterestRate}><i className="fa-solid fa-pencil"></i></div></p>
              <p><b>{i18n("Time to Payoff (Months)")}: </b> {creditAndDebtData.time_to_payoff_months} <div className="pencil-btn" onClick={showTimeToPayoffMonths}><i className="fa-solid fa-pencil"></i></div></p>
            </div>
            <div className="dashboard-section mb-3">
              <h2>{i18n("Expenses")}</h2>
              <h3>{i18n("Total Expenses")}</h3>
              <div className="row">
                <p><b>{i18n("Total Annual Expense")}:</b> {totalAnnualExpense}€</p>
                <p><b>{i18n("Total Monthly Expense")}:</b> {totalMonthlyExpense}€</p>
                <p><b>{i18n("Total Weekly Expense")}:</b> {totalWeeklyExpense}€</p>
                <p><b>{i18n("Total Daily Expense")}:</b> {totalDailyExpense}€</p>
                <p><b>{i18n("Total Hourly Expense")}:</b> {totalHourlyExpense}€</p>
              </div>
              <hr />
              <h3>{i18n("Average Cash Expenses")}</h3>
              <div className="row">
                <p><b>{i18n("Average Annual Expense")}:</b> {averageAnnualExpense}€</p>
                <p><b>{i18n("Average Monthly Expense")}:</b> {averageMonthlyExpense}€</p>
                <p><b>{i18n("Average Weekly Expense")}:</b> {averageWeeklyExpense}€</p>
                <p><b>{i18n("Average Daily Expense")}:</b> {averageDailyExpense}€</p>
                <p><b>{i18n("Average Hourly Expense")}:</b> {averageHourlyExpense}€</p>
              </div>
              <hr />
              <h3>{i18n("Benefits Expenses")}</h3>
              <div className="row">
                <p><b>{i18n("Benefits Annual Expense")}:</b> {benefitsAnnualExpense}€</p>
                <p><b>{i18n("Benefits Monthly Expense")}:</b> {benefitsMonthlyExpense}€</p>
                <p><b>{i18n("Benefits Weekly Expense")}:</b> {benefitsWeeklyExpense}€</p>
                <p><b>{i18n("Benefits Daily Expense")}:</b> {benefitsDailyExpense}€</p>
                <p><b>{i18n("Benefits Hourly Expense")}:</b> {benefitsHourlyExpense}€</p>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="dashboard-section mb-3">
              <h2>{i18n("Net Worth Over Time")}</h2>
              <NetWorthChart title={i18n("Net Worth") + ` (${currentYear})`} netWorthData={netWorthChartData} />
              <button className="btn btn-primary" onClick={saveCurrentNetWorth}>{i18n("Save Net Worth")}</button>
            </div>
            <hr />
            <div className="dashboard-section mb-3">
              <div className="row">
                <h3>{i18n("Expense Last 12 Months")}</h3>
              </div>
              <div className="row">
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
      <TextInputModal
        id="creditLimitModal"
        value={creditAndDebtData.credit_limit}
        setValue={changeCreditLimit}
        updateField={() => updateCreditAndDebtField("credit_limit", creditAndDebtData.credit_limit)}
      />
      <TextInputModal
        id="totalDebtModal"
        value={creditAndDebtData.total_debt}
        setValue={changeTotalDebt}
        updateField={() => updateCreditAndDebtField("total_debt", creditAndDebtData.total_debt)}
      />
      <TextInputModal
        id="monthlyDebtPaymentModal"
        value={creditAndDebtData.monthly_debt_payment}
        setValue={changeMonthlyDebtPayment}
        updateField={() => updateCreditAndDebtField("monthly_debt_payment", creditAndDebtData.monthly_debt_payment)}
      />
      <TextInputModal
        id="interestRateModal"
        value={creditAndDebtData.interest_rate}
        setValue={changeInterestRate}
        updateField={() => updateCreditAndDebtField("interest_rate", creditAndDebtData.interest_rate)}
      />
      <TextInputModal
        id="timeToPayoffMonthsModal"
        value={creditAndDebtData.time_to_payoff_months}
        setValue={changeTimeToPayoffMonths}
        updateField={() => updateCreditAndDebtField("time_to_payoff_months", creditAndDebtData.time_to_payoff_months)}
      />
    </>
  )
  }
  else {
    return (<></>);
  }
}
