var express = require('express');
var router = express.Router();
const readerXLS = require('xlsx');
const utils = require('../libs/utils');
const database = require('../libs/database');

var {con, con2} = database.getMySQLConnections();

router.post("/api/yearly-expense-calendar", (req, res) {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
	}

	var yedate = req.body.yedate;
	var description = req.body.description;

	var sql = "INSERT INTO yearly_expense_calendar (yedate, description) VALUES (? ?)";

	con2.query(sql, []);

	res.json({status: 'OK', data: con2[0][insertId]});
});

module.exports = router;