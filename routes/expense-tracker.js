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

  var sql = `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(amount) AS total_expense
             FROM expense_tracker
             GROUP BY month
             ORDER BY month DESC`;

  con.query(sql, (err, result) => {
    if (err) {
      console.log("Error fetching monthly expenses:", err);
      res.json({status: "NOK", error: "Database error."});
    }

    res.json({status: "OK", data: result});
  });
});

module.exports = router;