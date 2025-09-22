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

router.get("/get-revolut-mov", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = "SELECT * FROM revolut_mov ORDER BY data_inicio DESC, id DESC";
  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "There was an error getting movements."});
      return;
    }
    res.json({status: "OK", data: result});
  });
});

router.post("/import-revolut-csv", (req, res) => {
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
    .on("data", async function (row) {
      var data_inicio = utils.convertRevolutDate(row["Data de início"]);
      var data_fim = utils.convertRevolutDate(row["Data de Conclusão"]);
      var tipo = row["Tipo"];
      var produto = row["Produto"];
      var descricao = row["Descrição"];
      var montante = row["Montante"];
      var comissao = row["Comissão"];
      var moeda = row["Moeda"];
      var estado = row["Estado"];
      var saldo = row["Saldo"];
      var is_expense = (Number(montante) < 0) ? 1 : 0;

      var sql1 = "SELECT * FROM revolut_mov WHERE data_inicio = ? AND data_fim = ? AND tipo = ? AND produto = ? AND descricao = ? AND montante = ? AND comissao = ? AND moeda = ? AND estado = ? AND saldo = ?";
      var result = await con2.query(sql1, [data_inicio, data_fim, tipo, produto, descricao, montante, comissao, moeda, estado, saldo]);
      if (result[0].length < 1) {
        var sql2 = "INSERT INTO revolut_mov (data_inicio, data_fim, tipo, produto, descricao, montante, comissao, moeda, estado, saldo, is_expense) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        con.query(sql2, [data_inicio, data_fim, tipo, produto, descricao, montante, comissao, moeda, estado, saldo, is_expense], function(err, result) {
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

router.post("/revolut/toggle-is-expense", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var id = req.body.id;

  var sql = "SELECT * FROM revolut_mov WHERE id = ?";
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
    var sql2 = "UPDATE revolut_mov SET is_expense = ? WHERE id = ?";
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