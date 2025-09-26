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

router.post("/api/check-login", (req, res) => {
  var user = req.body.user;
  var pass = req.body.pass;

  var sql = "SELECT * FROM logins WHERE is_valid = 0 AND created_at > (NOW() - INTERVAL 1 HOUR);";

  con.query(sql, function (err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: err.message});
      return;
    }
    if (result.length <= 5) {
      if (user == secretConfig.USER && pass == secretConfig.PASS) {
        req.session.isLoggedIn = true;
        var sql2 = "INSERT INTO logins (is_valid) VALUES (1);";
        con.query(sql2);
        res.json({status: "OK", data: "Login successful."});
      }
      else {
        var sql2 = "INSERT INTO logins (is_valid) VALUES (0);";
        con.query(sql2);
        req.session.isLoggedIn = false;
        res.json({status: "NOK", error: "Wrong username/password."});
      }
    }
    else {
      req.session.isLoggedIn = false;
      res.json({status: "NOK", error: "Too many login attempts."});
    }
  });
});

router.get("/check-login", (req, res) => {
  if (req.session.isLoggedIn) {
    res.json({status: "OK"});
  }
  else {
    res.json({status: "NOK"});
  }
});

router.get("/api/logout", (req, res) => {
  if (req.session.isLoggedIn) {
    req.session.isLoggedIn = false;
    res.redirect("/");
  }
  else {
    res.json({status: "NOK", error: "You can't logout because you are not logged in."});
  }
});

module.exports = router;