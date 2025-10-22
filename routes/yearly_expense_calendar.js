var express = require('express');
var router = express.Router();
const readerXLS = require('xlsx');
const utils = require('../libs/utils');
const database = require('../libs/database');

var {con, con2} = database.getMySQLConnections();

router.post("/api/yearly-expense-calendar/add", (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({status: "NOK", error: "Invalid Authorization."});
  }

	var yedate = req.body.yedate;
	var description = req.body.description;

	var sql = "INSERT INTO yearly_expense_calendar (yedate, description) VALUES (? ?)";

	con2.query(sql, []);

	res.json({status: 'OK', data: con2[0][insertId]});
});

router.post("/api/yearly-expense-calendar/list", (req, res) => {
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

module.exports = router;