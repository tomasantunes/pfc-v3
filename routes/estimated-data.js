var express = require('express');
var router = express.Router();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require("mysql2");
var mysql2 = require('mysql2/promise');
var secretConfig = require('../secret-config');
var session = require('express-session');
const readerXLS = require('xlsx');
var fileUpload = require('express-fileupload');
const fs = require("fs");
const csv = require('fast-csv');
const utils = require('../libs/utils');
const database = require('../libs/database');

var {con, con2} = database.getMySQLConnections();

router.post("/update-estimated-data", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var field = req.body.field;
  var value = req.body.value;

  var sql1 = "SELECT * FROM estimated_data ORDER BY id DESC LIMIT 1";

  const [lastEstimatedDataSnapshot] = await con2.execute(sql1);

  console.log(lastEstimatedDataSnapshot);

  if (lastEstimatedDataSnapshot.length === 0) {
    lastEstimatedDataSnapshot[0] = {
      incomePerHour: 0,
      incomePerDay: 0,
      incomePerWorkHour: 0,
      incomePerWorkDay: 0,
      incomePerWeek: 0,
      incomePerMonth: 0,
      incomePerYear: 0,
      netSalaryPerMonth: 0,
      netSalaryPerYear: 0,
      grossSalaryPerMonth: 0,
      grossSalaryPerYear: 0,
      benefitsPerYear: 0,
      expenseBenefitsPerYear: 0,
      foodAssistancePerYear: 0,
      technologyBenefitsPerYear: 0,
      grossMonthlySalaryPlusBenefits: 0,
      grossAnnualSalaryPlusBenefits: 0
    };
  }

  var sql2 = `
    INSERT INTO
      estimated_data
    (
      incomePerHour,
      incomePerDay,
      incomePerWorkHour,
      incomePerWorkDay,
      incomePerWeek,
      incomePerMonth,
      incomePerYear,
      netSalaryPerMonth,
      netSalaryPerYear,
      grossSalaryPerMonth,
      grossSalaryPerYear,
      benefitsPerYear,
      expenseBenefitsPerYear,
      foodAssistancePerYear,
      technologyBenefitsPerYear,
      grossMonthlySalaryPlusBenefits,
      grossAnnualSalaryPlusBenefits
    )
    VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?
    )
  `;

  var fields_not_affected = [
    {key: "incomePerHour", val: lastEstimatedDataSnapshot[0].incomePerHour},
    {key: "incomePerDay", val: lastEstimatedDataSnapshot[0].incomePerDay},
    {key: "incomePerWorkHour", val: lastEstimatedDataSnapshot[0].incomePerWorkHour},
    {key: "incomePerWorkDay", val: lastEstimatedDataSnapshot[0].incomePerWorkDay},
    {key: "incomePerWeek", val: lastEstimatedDataSnapshot[0].incomePerWeek},
    {key: "incomePerMonth", val: lastEstimatedDataSnapshot[0].incomePerMonth},
    {key: "incomePerYear", val: lastEstimatedDataSnapshot[0].incomePerYear},
    {key: "netSalaryPerMonth", val: lastEstimatedDataSnapshot[0].netSalaryPerMonth},
    {key: "netSalaryPerYear", val: lastEstimatedDataSnapshot[0].netSalaryPerYear},
    {key: "grossSalaryPerMonth", val: lastEstimatedDataSnapshot[0].grossSalaryPerMonth},
    {key: "grossSalaryPerYear", val: lastEstimatedDataSnapshot[0].grossSalaryPerYear},
    {key: "benefitsPerYear", val: lastEstimatedDataSnapshot[0].benefitsPerYear},
    {key: "expenseBenefitsPerYear", val: lastEstimatedDataSnapshot[0].expenseBenefitsPerYear},
    {key: "foodAssistancePerYear", val: lastEstimatedDataSnapshot[0].foodAssistancePerYear},
    {key: "technologyBenefitsPerYear", val: lastEstimatedDataSnapshot[0].technologyBenefitsPerYear},
    {key: "grossMonthlySalaryPlusBenefits", val: lastEstimatedDataSnapshot[0].grossMonthlySalaryPlusBenefits},
    {key: "grossAnnualSalaryPlusBenefits", val: lastEstimatedDataSnapshot[0].grossAnnualSalaryPlusBenefits},
  ];
  var fields_to_affect = [];

  for (var i in fields_not_affected) {
    if (fields_not_affected[i].key == field) {
      fields_not_affected[i].val = value;
    }
  }

  fields_to_affect = fields_not_affected;

  await con2.execute(sql2, fields_to_affect.map(f => f.val));
  res.json({
    status: "OK",
    data: "Estimated data has been updated."
  });
});

router.get("/get-estimated-data", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql1 = "SELECT * FROM estimated_data ORDER BY id DESC LIMIT 1";

  const [lastEstimatedDataSnapshot] = await con2.execute(sql1);

  if (lastEstimatedDataSnapshot.length === 0) {
    res.json({status: "OK", data: {
      incomePerHour: 0,
      incomePerDay: 0,
      incomePerWorkHour: 0,
      incomePerWorkDay: 0,
      incomePerWeek: 0,
      incomePerMonth: 0,
      incomePerYear: 0,
      netSalaryPerMonth: 0,
      netSalaryPerYear: 0,
      grossSalaryPerMonth: 0,
      grossSalaryPerYear: 0,
      benefitsPerYear: 0,
      expenseBenefitsPerYear: 0,
      foodAssistancePerYear: 0,
      technologyBenefitsPerYear: 0,
      grossMonthlySalaryPlusBenefits: 0,
      grossAnnualSalaryPlusBenefits: 0
    }});
    return;
  }

  res.json({status: "OK", data: lastEstimatedDataSnapshot[0]});
});

module.exports = router;