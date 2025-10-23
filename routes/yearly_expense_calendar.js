var express = require('express');
var router = express.Router();
const readerXLS = require('xlsx');
const utils = require('../libs/utils');
const database = require('../libs/database');

var {con, con2} = database.getMySQLConnections();

router.post("/api/yearly-expense-calendar/add", async (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({status: "NOK", error: "Invalid Authorization."});
  }

  try {
    var yeday = req.body.yeday;
    var yemonth = req.body.yemonth;
    var description = req.body.description;
    var amount = req.body.amount;

    if (req.body.isMonthly) {
      yemonth = null;

      for (let month = 1; month <= 12; month++) {
        var sql = "INSERT INTO yearly_expense_calendar (yeday, yemonth, description, amount) VALUES (?, ?, ?, ?)";
        await con2.query(sql, [yeday, month, description, amount]);
      }

      return res.json({status: 'OK', data: 'Monthly expenses added.'});
    }
    else {
      var sql = "INSERT INTO yearly_expense_calendar (yeday, yemonth, description, amount) VALUES (?, ?, ?, ?)";

      await con2.query(sql, [yeday, yemonth, description, amount]);

      res.json({status: 'OK', data: "Expense has been added."});
    }
  } catch (error) {
    console.log("Error adding yearly expense calendar entry:", error);
    res.json({status: "NOK", error: "Error: " + error.message});
  }
});

router.get("/api/yearly-expense-calendar/list", (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({status: "NOK", error: "Invalid Authorization."});
  }

  var sql = "SELECT * FROM yearly_expense_calendar";

  con.query(sql, function(err, result) {
    if (err) {
      console.log("Error fetching data from database");
      return res.json({status: "NOK", error: "Error fetching data from database."});
    }

    res.json({status: "OK", data: result});
  });
});

router.post("/api/yearly-expense-calendar/delete/:id", async (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({status: "NOK", error: "Invalid Authorization."});
  }

  try {
    var id = req.params.id;

    var sql = "DELETE FROM yearly_expense_calendar WHERE id = ?";
    var result = await con2.query(sql, [id]);

    res.json({status: 'OK', data: result.affectedRows});
  } catch (error) {
    console.log("Error deleting yearly expense calendar entry:", error);
    res.json({status: "NOK", error: "Error: " + error.message});
  }
});

module.exports = router;