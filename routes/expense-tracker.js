var express = require('express');
var router = express.Router();
const database = require('../libs/database');

var {con, con2} = database.getMySQLConnections();

router.get("/expense-tracker/get-expenses", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = "SELECT et.*, ec.name AS category_name FROM expense_tracker et INNER JOIN expense_categories ec ON et.category_id = ec.id ORDER BY et.created_at DESC";

  con.query(sql, (err, result) => {
    if (err) {
      console.log("Error fetching expenses:", err);
      res.json({status: "NOK", error: "Database error."});
    }

    res.json({status: "OK", data: result});
  });
});

router.get("/expense-tracker/get-expense-by-month", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = `SELECT
               DATE_FORMAT(et.created_at, '%Y-%m') AS month,
               COALESCE(ec.name, 'Uncategorized') AS category_name,
               SUM(et.amount) AS category_total
             FROM expense_tracker et
             LEFT JOIN expense_categories ec ON et.category_id = ec.id
             GROUP BY month, category_name
             ORDER BY month DESC, category_total DESC`;

  con.query(sql, (err, result) => {
    if (err) {
      console.log("Error fetching monthly expenses:", err);
      return res.json({status: "NOK", error: "Database error."});
    }

    const rows = Array.isArray(result) ? result : [];
    const monthlyExpenses = rows.reduce((months, row) => {
      let month = months.find((entry) => entry.month === row.month);

      if (!month) {
        month = {
          month: row.month,
          total_expense: 0,
          categories: []
        };
        months.push(month);
      }

      const categoryTotal = Number(row.category_total);
      month.total_expense += categoryTotal;
      month.categories.push({
        category_name: row.category_name,
        total_expense: categoryTotal
      });

      return months;
    }, []);

    monthlyExpenses.forEach((month) => {
      month.categories.forEach((category) => {
        category.percentage = month.total_expense > 0
          ? (category.total_expense * 100) / month.total_expense
          : 0;
      });
    });

    res.json({status: "OK", data: monthlyExpenses});
  });
});

router.get("/expense-tracker/get-summary", async (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.json({status: "NOK", error: "Invalid Authorization."});
  }

  try {
    const [[dailyRows], [summaryRows]] = await Promise.all([
      con2.execute(`SELECT DATE(created_at) AS expense_date,
                           SUM(amount) AS total_expense
                    FROM expense_tracker
                    WHERE created_at >= CURDATE() - INTERVAL 29 DAY
                      AND created_at < CURDATE() + INTERVAL 1 DAY
                    GROUP BY DATE(created_at)
                    ORDER BY expense_date DESC`),
      con2.execute(`SELECT
                      COALESCE(SUM(amount), 0) AS total_expense,
                      DATE(MIN(created_at)) AS first_date,
                      DATE(CURDATE()) AS today
                    FROM expense_tracker`)
    ]);

    const totalsByDate = new Map(
      dailyRows.map((row) => [row.expense_date, Number(row.total_expense)])
    );
    const summary = summaryRows[0];
    const currentDate = new Date(`${summary.today}T00:00:00Z`);
    const dailyExpenses = [];

    for (let dayOffset = 0; dayOffset < 30; dayOffset += 1) {
      const date = new Date(currentDate);
      date.setUTCDate(currentDate.getUTCDate() - dayOffset);
      const expenseDate = date.toISOString().slice(0, 10);
      dailyExpenses.push({
        expense_date: expenseDate,
        total_expense: totalsByDate.get(expenseDate) || 0
      });
    }

    let averageMonthlyExpense = 0;
    let averageDailyExpense = 0;

    if (summary.first_date) {
      const firstDate = new Date(`${summary.first_date}T00:00:00Z`);
      const totalExpense = Number(summary.total_expense) || 0;
      const numberOfMonths = (
        (currentDate.getUTCFullYear() - firstDate.getUTCFullYear()) * 12
        + currentDate.getUTCMonth()
        - firstDate.getUTCMonth()
        + 1
      );
      const numberOfDays = Math.floor((currentDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;

      averageMonthlyExpense = totalExpense / Math.max(numberOfMonths, 1);
      averageDailyExpense = totalExpense / Math.max(numberOfDays, 1);
    }

    res.json({
      status: "OK",
      data: {
        daily_expenses: dailyExpenses,
        average_monthly_expense: averageMonthlyExpense,
        average_daily_expense: averageDailyExpense
      }
    });
  } catch (err) {
    console.log("Error fetching expense tracker summary:", err);
    res.json({status: "NOK", error: "Database error."});
  }
});

router.get("/expense-tracker/get-expenses-by-category", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = `SELECT ec.name AS category_name, SUM(et.amount) AS total_expense
             FROM expense_tracker et
             INNER JOIN expense_categories ec ON et.category_id = ec.id
             GROUP BY category_name
             ORDER BY total_expense DESC`;

  con.query(sql, (err, result) => {
    if (err) {
      console.log("Error fetching expenses by category:", err);
      res.json({status: "NOK", error: "Database error."});
    }

    res.json({status: "OK", data: result});
  });
});

router.get("/expense-tracker/get-current-month-by-class", async (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.json({status: "NOK", error: "Invalid Authorization."});
  }

  try {
    const selectedMonth = typeof req.query.month === 'string' ? req.query.month : '';
    const monthMatch = selectedMonth.match(/^(\d{4})-(\d{2})$/);

    if (!monthMatch || Number(monthMatch[2]) < 1 || Number(monthMatch[2]) > 12) {
      return res.json({status: "NOK", error: "Invalid month."});
    }

    const [monthRangeRows] = await con2.execute(`
      SELECT
        DATE_FORMAT(CURDATE() - INTERVAL 6 MONTH, '%Y-%m') AS earliest_month,
        DATE_FORMAT(CURDATE(), '%Y-%m') AS current_month
    `);
    const {earliest_month: earliestMonth, current_month: currentMonth} = monthRangeRows[0];

    if (selectedMonth < earliestMonth || selectedMonth > currentMonth) {
      return res.json({status: "NOK", error: "Month is outside the available range."});
    }

    const monthStart = `${selectedMonth}-01`;
    const [[rows], [budgetRows]] = await Promise.all([
      con2.execute(`
      SELECT
        COALESCE(NULLIF(TRIM(et.\`class\`), ''), 'Unclassified') AS expense_class,
        COALESCE(NULLIF(TRIM(et.unit), ''), 'Unspecified') AS expense_unit,
        SUM(et.amount) AS total_expense,
        COUNT(*) AS quantity
      FROM expense_tracker et
      WHERE et.created_at >= ?
        AND et.created_at < DATE_ADD(?, INTERVAL 1 MONTH)
      GROUP BY
        COALESCE(NULLIF(TRIM(et.\`class\`), ''), 'Unclassified'),
        COALESCE(NULLIF(TRIM(et.unit), ''), 'Unspecified')
      ORDER BY expense_class, total_expense DESC, expense_unit
      `, [monthStart, monthStart]),
      con2.execute(`
        SELECT
          unit AS expense_unit,
          SUM(quantity) AS budget_limit
        FROM budget_sub_items
        WHERE unit IS NOT NULL
        GROUP BY unit
        ORDER BY unit
      `)
    ]);

    const budgetLimits = new Map(budgetRows.map((row) => [
      String(row.expense_unit).trim().toLocaleLowerCase(),
      Number(row.budget_limit) || 0
    ]));

    const classes = [];
    const classesByName = new Map();

    rows.forEach((row) => {
      let classRow = classesByName.get(row.expense_class);
      if (!classRow) {
        classRow = {
          class_name: row.expense_class,
          total_expense: 0,
          quantity: 0,
          units: []
        };
        classesByName.set(row.expense_class, classRow);
        classes.push(classRow);
      }

      const totalExpense = Number(row.total_expense) || 0;
      const quantity = Number(row.quantity) || 0;
      classRow.total_expense += totalExpense;
      classRow.quantity += quantity;
      classRow.units.push({
        unit_name: row.expense_unit,
        total_expense: totalExpense,
        quantity,
        budget_limit: budgetLimits.get(String(row.expense_unit).trim().toLocaleLowerCase()) || 0
      });
    });

    classes.sort((first, second) => second.total_expense - first.total_expense);
    res.json({status: "OK", data: classes});
  } catch (err) {
    console.log("Error fetching monthly expenses by class:", err);
    res.json({status: "NOK", error: "Database error."});
  }
});

module.exports = router;
