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

router.get("/get-savings", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql1 = "SELECT * FROM savings ORDER BY id DESC LIMIT 1";

  try {
    const [savings] = await con2.execute(sql1);

    if (savings.length === 0) {
      res.json({status: "OK", data: {
        cash: 0,
        vouchers: 0,
        gift_cards: 0,
        savings_accounts_total: 0
      }});
      return;
    }

    res.json({status: "OK", data: savings[0]});
  } catch (err) {
    console.log(err);
    res.json({status: "NOK", error: "Error getting savings."});
  }
});

router.post("/insert-savings", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var cash = req.body.cash;
  var vouchers = req.body.vouchers;
  var gift_cards = req.body.giftCards;
  var savings_accounts_total = req.body.savingsAccountsTotal;

  var sql = "INSERT INTO savings (cash, vouchers, gift_cards, savings_accounts_total) VALUES (?, ?, ?, ?)";
  con.query(sql, [cash, vouchers, gift_cards, savings_accounts_total], function (err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "Error inserting savings."});
      return;
    }
    res.json({status: "OK", data: "Savings inserted successfully."});
  });
});

module.exports = router;