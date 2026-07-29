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

module.exports = router;
