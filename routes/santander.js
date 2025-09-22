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

router.post("/import-santander-xls", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }
  if (!req.files) {
    console.log("No file has been detected.");
    res.json({status: "NOK", error: "No file has been detected."});
    return;
  }

  try {
    const file = req.files.excelFile.tempFilePath;
    const xlsFile = readerXLS.readFile(file);
    let xls = [];
    const sheets = xlsFile.SheetNames;

    for(let i = 0; i < sheets.length; i++) {
      const temp = readerXLS.utils.sheet_to_json(xlsFile.Sheets[xlsFile.SheetNames[i]])
      temp.forEach((res) => {
        xls.push(res);
      });
    }

    xls.reverse();

    const today = new Date();
    let todayVerbose = formatDatePtVerbose(today).trim();
    console.log(todayVerbose);

    console.log("Before loop.");
    for (var i in xls) {
      if (
        xls[i].hasOwnProperty(todayVerbose) && 
        xls[i].hasOwnProperty("__EMPTY") && 
        xls[i].hasOwnProperty("__EMPTY_1") &&
        xls[i].hasOwnProperty("__EMPTY_2") &&
        xls[i].hasOwnProperty("__EMPTY_3") &&
        xls[i][todayVerbose] != "Data Operação"
      ) {
        console.log("+1 entered loop.")
        var data_mov = convertExcelDate(xls[i][todayVerbose]);
        var data_valor = convertExcelDate(xls[i]["__EMPTY"]);
        var desc_mov = xls[i]["__EMPTY_1"];
        var valor = xls[i]["__EMPTY_2"];
        var saldo = xls[i]["__EMPTY_3"];
        var sql1 = "SELECT * FROM santander_mov WHERE data_mov = ? AND data_valor = ? AND desc_mov = ? AND valor = ? AND saldo = ?";
        var result = await con2.query(sql1, [data_mov, data_valor, desc_mov, valor, saldo]);
        if (result[0].length < 1) {
          var is_expense = (Number(valor) < 0) ? 1 : 0;
          var sql2 = "INSERT INTO santander_mov (data_mov, data_valor, desc_mov, valor, saldo, is_expense) VALUES (?, ?, ?, ?, ?, ?)";
          con.query(sql2, [data_mov, data_valor, desc_mov, valor, saldo, is_expense], function(err, result) {
            if (err) {
              console.log("Error inserting to MySQL.");
              console.log(err.message);
              throw new Error("Error inserting to MySQL.");
            }
            console.log("Successfully inserted to MySQL");
          });
        }
      }
    }
    console.log("After loop.");
  } catch(exception) {
    console.log(exception);
    res.json({status: "NOK", error: "Error importing file."});
    return;
  }
  
  res.json({status: "OK", data: "XLS has been imported successfully."});
});

router.post("/add-santander-mov", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var data_mov = req.body.data_mov;
  var data_valor = req.body.data_valor;
  var desc_mov = req.body.desc_mov;
  var valor = req.body.valor;
  var saldo = req.body.saldo;
  var is_expense = req.body.is_expense == true ? 1 : 0;

  var sql = "INSERT INTO santander_mov (data_mov, data_valor, desc_mov, valor, saldo, is_expense, is_original) VALUES (?, ?, ?, ?, ?, ?, ?)";
  con.query(sql, [data_mov, data_valor, desc_mov, Number(valor), Number(saldo), is_expense, 0], function(err, result) {
    if (err) {
      console.log("Error inserting to MySQL.");
      console.log(err.message);
      res.json({status: "NOK", error: "Error inserting to MySQL."});
    }
    res.json({status: "OK", data: "Santander movement has been added."});
  });
});

router.get("/get-santander-mov", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = "SELECT * FROM santander_mov ORDER BY data_mov DESC, id DESC";
  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "There was an error getting movements."});
      return;
    }
    res.json({status: "OK", data: result});
  });
});

router.post("/insert-santander-balance", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var balance = req.body.balance;

  var sql1 = "INSERT INTO santander (balance) VALUES (?)";
  await con2.query(sql1, [balance]);

  res.json({status: "OK", data: "Santander Balance has been submitted."});
});

router.get("/get-santander-balance", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql6 = "SELECT * FROM santander ORDER BY created_at DESC LIMIT 1";
  var result6 = await con2.query(sql6);
  var saldo_santander = 0;
  if (result6[0].length > 0) {
    saldo_santander = result6[0][0].balance;
  }

  res.json({status: "OK", data: saldo_santander});
});

router.post("/santander/toggle-is-expense", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var id = req.body.id;

  var sql = "SELECT * FROM santander_mov WHERE id = ?";
  con.query(sql, [id], function(err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "There was an error getting the movement."});
      return;
    }
    if (result.length < 1) {
      res.json({status: "NOK", error: "Movement not found."});
      return;
    }

    var is_expense = (result[0].is_expense == 1) ? 0 : 1;
    var sql2 = "UPDATE santander_mov SET is_expense = ? WHERE id = ?";
    con.query(sql2, [is_expense, id], function(err, result2) {
      if (err) {
        console.log(err);
        res.json({status: "NOK", error: "There was an error updating the movement."});
        return;
      }
      res.json({status: "OK", data: "Movement updated successfully."});
    });
  });
});

module.exports = router;