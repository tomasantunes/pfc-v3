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

app.post("/import-paypal-csv", (req, res) => {
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
    const file = req.files.csvFile.tempFilePath;

    fs.createReadStream(file)
    .pipe(csv.parse({ headers: true }))
    .on("data", function (row) {
      var date = utils.convertPaypalDate(row["Date"]);
      var value = row["Net"].replace(",", ".");
      var name = row["Name"];

      if (name != "") {
        var sql = "INSERT INTO paypal_mov (name, value, date_mov) VALUES (?, ?, ?)";
        con.query(sql, [name, value, date], function(err, result) {
          if (err) {
            console.log(err);
          }
        });
      }
    })
    .on("end", function () {
      console.log("finished");
      res.json({status: "OK", data: "CSV has been imported successfully."});
    })
    .on("error", function (error) {
      console.log(error.message);
    });

  } catch(exception) {
    console.log(exception);
    res.json({status: "NOK", error: "Error importing file."});
    return;
  }
});

app.get("/get-paypal-mov", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = "SELECT * FROM paypal_mov ORDER BY date_mov DESC, id DESC LIMIT 25";
  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "There was an error getting movements."});
      return;
    }
    res.json({status: "OK", data: result});
  });
});

module.exports = router;