var express = require('express');
var router = express.Router();
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

        UNION ALL

        SELECT date, ABS(value) * -1 AS amount
        FROM coinbase_expenses
      ) t
      WHERE date < DATE_FORMAT(CURDATE(), '%Y-%m-01')
      GROUP BY ym
    ) m
  `);

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
        IFNULL((SELECT MIN(data_inicio) FROM revolut_mov), CURDATE()),
        IFNULL((SELECT MIN(date) FROM coinbase_expenses), CURDATE())
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
        UNION ALL
        SELECT SUM(ABS(value)) AS valor FROM coinbase_expenses
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

  const [rows4] = await con2.execute(`
    SELECT 
        YEAR(date) AS yr,
        MONTH(date) AS mnth,
        SUM(ABS(value)) AS monthly_sum
    FROM coinbase_expenses
    WHERE
        (
          YEAR(date) <> YEAR(CURDATE())
          OR MONTH(date) <> MONTH(CURDATE())
        )
    GROUP BY YEAR(date), MONTH(date)
    ORDER BY yr DESC, mnth DESC
    LIMIT 12;
  `);

  const expenseLast12MonthsBpi = rows1;
  const expenseLast12MonthsSantander = rows2;
  const expenseLast12MonthsRevolut = rows3;
  const expenseLast12MonthsCoinbase = rows4;
  const expenseLast12Months = [];

  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (i + 1));
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const bpiEntry = expenseLast12MonthsBpi.find(entry => entry.yr === year && entry.mnth === month);
    const santanderEntry = expenseLast12MonthsSantander.find(entry => entry.yr === year && entry.mnth === month);
    const revolutEntry = expenseLast12MonthsRevolut.find(entry => entry.yr === year && entry.mnth === month);
    const coinbaseEntry = expenseLast12MonthsCoinbase.find(entry => entry.yr === year && entry.mnth === month);

    const totalExpense = (bpiEntry ? Number(bpiEntry.monthly_sum) : 0) +
                        (santanderEntry ? Number(santanderEntry.monthly_sum) : 0) +
                        (revolutEntry ? Number(revolutEntry.monthly_sum) : 0) +
                        (coinbaseEntry ? Number(coinbaseEntry.monthly_sum) : 0);

    expenseLast12Months.push({
      yr: year,
      mnth: month,
      monthly_sum: totalExpense.toFixed(2)
    });
  }

  res.json({status: "OK", data: expenseLast12Months});
});

router.get("/get-yearly-outflows", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  try {
    // Get years that have at least one positive value in January
    const [yearsWithJanuaryNegatives] = await con2.execute(`
      SELECT DISTINCT YEAR(data_mov) AS year
      FROM bpi_mov
      WHERE MONTH(data_mov) = 1 
        AND valor < 0
      ORDER BY year
    `);

    if (yearsWithJanuaryNegatives.length === 0) {
      res.json({status: "OK", data: {years: [], outflows: []}});
      return;
    }

    // Create list of years for the WHERE IN clause
    const years = yearsWithJanuaryNegatives.map(row => row.year);
    const yearsList = years.join(',');

    // Get sum of negative values grouped by year for those years only
    const [outflowData] = await con2.execute(`
      SELECT 
        YEAR(data_mov) AS year,
        SUM(ABS(valor)) AS total_outflow
      FROM bpi_mov
      WHERE valor < 0 
        AND YEAR(data_mov) IN (${yearsList})
      GROUP BY YEAR(data_mov)
      ORDER BY year
    `);

    // Prepare the response data
    const responseYears = [];
    const responseOutflows = [];

    // Ensure we have data for all years that had January positives
    years.forEach(year => {
      const outflowEntry = outflowData.find(entry => entry.year === year);
      responseYears.push(year);
      responseOutflows.push(outflowEntry ? Number(outflowEntry.total_outflow) : 0);
    });

    res.json({
      status: "OK", 
      data: {
        years: responseYears,
        outflows: responseOutflows
      }
    });
  } catch(err) {
    console.log(err);
    res.json({status: "NOK", error: "Error getting yearly outflows."});
  }
});

module.exports = router;