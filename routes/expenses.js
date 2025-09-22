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

router.get("/get-average-monthly-expense", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  const [rows] = await con2.execute(`
    SELECT AVG(monthly_expense) AS average_monthly_expense
    FROM (
      SELECT DATE_FORMAT(date, '%Y-%m') AS ym, 
             SUM(ABS(amount)) AS monthly_expense
      FROM (
        SELECT data_mov AS date, valor AS amount
        FROM bpi_mov
        WHERE is_expense = 1 AND valor < 0

        UNION ALL

        SELECT data_mov AS date, valor AS amount
        FROM santander_mov
        WHERE is_expense = 1 AND valor < 0

        UNION ALL

        SELECT data_inicio AS date, montante AS amount
        FROM revolut_mov
        WHERE is_expense = 1 AND montante < 0
      ) t
      WHERE date < DATE_FORMAT(CURDATE(), '%Y-%m-01')
      GROUP BY ym
    ) m
  `);

  console.log(rows);
  let averageMonthlyExpense = Number(rows[0].average_monthly_expense) || 0;
  averageMonthlyExpense = averageMonthlyExpense.toFixed(2);
  res.json({status: "OK", data: averageMonthlyExpense});
});

router.get("/get-average-daily-expense", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  try {
    const [minRows] = await con2.execute(`
      SELECT LEAST(
        IFNULL((SELECT MIN(data_mov) FROM bpi_mov), CURDATE()),
        IFNULL((SELECT MIN(data_mov) FROM santander_mov), CURDATE()),
        IFNULL((SELECT MIN(data_inicio) FROM revolut_mov), CURDATE())
      ) AS first_date
    `);

    const firstDate = new Date(minRows[0].first_date);

    const lastDayPrevMonth = new Date();
    lastDayPrevMonth.setDate(0);

    const [expRows] = await con2.execute(`
      SELECT SUM(total) AS total_expenses
      FROM (
        SELECT SUM(ABS(valor)) AS total FROM bpi_mov WHERE valor < 0 AND is_expense = 1
        UNION ALL
        SELECT SUM(ABS(valor)) AS valor FROM santander_mov WHERE valor < 0 AND is_expense = 1
        UNION ALL
        SELECT SUM(ABS(montante)) AS valor FROM revolut_mov WHERE montante < 0 AND is_expense = 1
      ) t
    `);

    const totalExpenses = expRows[0].total_expenses || 0;

    const diffDays = Math.floor((lastDayPrevMonth - firstDate) / (1000 * 60 * 60 * 24)) + 1;

    const averageDailyExpense = totalExpenses / diffDays;

    res.json({status: "OK", data: averageDailyExpense.toFixed(2)});
  } catch(err) {
    console.log(err);
    res.json({status: "NOK", error: "Error getting average daily expense."});
  }
});

router.get("/get-expense-last-12-months", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  const [rows1] = await con2.execute(`
    SELECT 
        YEAR(data_mov) AS yr,
        MONTH(data_mov) AS mnth,
        SUM(ABS(valor)) AS monthly_sum
    FROM bpi_mov
    WHERE
        valor < 0
        AND is_expense = 1
        AND (
          YEAR(data_mov) <> YEAR(CURDATE())
          OR MONTH(data_mov) <> MONTH(CURDATE())
        )
    GROUP BY YEAR(data_mov), MONTH(data_mov)
    ORDER BY yr DESC, mnth DESC
    LIMIT 12;
  `);

  const [rows2] = await con2.execute(`
    SELECT 
        YEAR(data_mov) AS yr,
        MONTH(data_mov) AS mnth,
        SUM(ABS(valor)) AS monthly_sum
    FROM santander_mov
    WHERE
        valor < 0
        AND is_expense = 1
        AND (
          YEAR(data_mov) <> YEAR(CURDATE())
          OR MONTH(data_mov) <> MONTH(CURDATE())
        )
    GROUP BY YEAR(data_mov), MONTH(data_mov)
    ORDER BY yr DESC, mnth DESC
    LIMIT 12;
  `);

  const [rows3] = await con2.execute(`
    SELECT 
        YEAR(data_inicio) AS yr,
        MONTH(data_inicio) AS mnth,
        SUM(ABS(montante)) AS monthly_sum
    FROM revolut_mov
    WHERE
        montante < 0
        AND is_expense = 1
        AND (
          YEAR(data_inicio) <> YEAR(CURDATE())
          OR MONTH(data_inicio) <> MONTH(CURDATE())
        )
    GROUP BY YEAR(data_inicio), MONTH(data_inicio)
    ORDER BY yr DESC, mnth DESC
    LIMIT 12;
  `);

  const expenseLast12MonthsBpi = rows1;
  const expenseLast12MonthsSantander = rows2;
  const expenseLast12MonthsRevolut = rows3;
  const expenseLast12Months = [];

  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (i + 1));
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const bpiEntry = expenseLast12MonthsBpi.find(entry => entry.yr === year && entry.mnth === month);
    const santanderEntry = expenseLast12MonthsSantander.find(entry => entry.yr === year && entry.mnth === month);
    const revolutEntry = expenseLast12MonthsRevolut.find(entry => entry.yr === year && entry.mnth === month);

    const totalExpense = (bpiEntry ? Number(bpiEntry.monthly_sum) : 0) +
                        (santanderEntry ? Number(santanderEntry.monthly_sum) : 0) +
                        (revolutEntry ? Number(revolutEntry.monthly_sum) : 0);

    expenseLast12Months.push({
      yr: year,
      mnth: month,
      monthly_sum: totalExpense.toFixed(2)
    });
  }

  res.json({status: "OK", data: expenseLast12Months});
});

module.exports = router;