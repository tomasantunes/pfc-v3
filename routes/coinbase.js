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

router.post("/insert-portfolio-snapshot-coinbase", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var balance = req.body.balance;
  var assets = req.body.assets;

  var sql1 = "INSERT INTO coinbase_portfolio_snapshot_headers (balance) VALUES (?)";
  var result1 = await con2.query(sql1, [balance]);
  var headerId = result1[0].insertId;

  for (var i in assets) {
    var sql2 = "INSERT INTO coinbase_portfolio_snapshot_assets (snapshot_id, name, deposit, quantity, value) VALUES (?, ?, ?, ?, ?)";
    await con2.query(sql2, [headerId, assets[i].name, assets[i].deposit, assets[i].quantity, assets[i].value]);
  }

  res.json({status: "OK", data: "Portfolio snapshot has been inserted successfully."});
});

router.get("/get-last-snapshot-coinbase", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = "SELECT * FROM coinbase_portfolio_snapshot_assets WHERE snapshot_id = (SELECT MAX(snapshot_id) FROM coinbase_portfolio_snapshot_assets)";

  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "There was an error getting the last snapshot."});
      return;
    }
    res.json({status: "OK", data: result});
  });
});

router.post("/insert-expense-coinbase", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var date = req.body.date;
  var description = req.body.description;
  var value = req.body.value;

  var sql = "INSERT INTO coinbase_expenses (date, description, value) VALUES (?, ?, ?)";
  await con2.query(sql, [date, description, value]);

  res.json({status: "OK", data: "Expense has been inserted successfully."});
});

router.get("/get-expenses-coinbase", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = "SELECT * FROM coinbase_expenses";
  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "There was an error getting the expenses."});
      return;
    }
    res.json({status: "OK", data: result});
  });
});

module.exports = router;