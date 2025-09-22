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

router.post("/insert-portfolio-snapshot-polymarket", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var balance = req.body.balance;
  var profit = req.body.profit;
  var deposit = req.body.deposit;

  var sql1 = "INSERT INTO polymarket_portfolio_snapshot (balance, profit, deposit) VALUES (?, ?, ?)";
  await con2.query(sql1, [balance, profit, deposit]);

  res.json({status: "OK", data: "Portfolio snapshot has been inserted successfully."});
});

module.exports = router;