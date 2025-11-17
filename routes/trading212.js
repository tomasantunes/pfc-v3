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

router.post("/insert-portfolio-snapshot-t212", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  try {
    var balance = req.body.balance;
    var profit = req.body.profit;
    var positions = req.body.positions;

    var sql1 = "INSERT INTO t212_portfolio_snapshot_headers (balance, profit) VALUES (?, ?)";
    var result1 = await con2.query(sql1, [balance, profit]);
    var headerId = result1[0].insertId;

    for (var i in positions) {
      var sql2 = "INSERT INTO t212_portfolio_snapshot_positions (snapshot_id, name, price, quantity, value, `return`) VALUES (?, ?, ?, ?, ?, ?)";
      await con2.query(sql2, [headerId, positions[i].name, positions[i].price, positions[i].quantity, positions[i].value, positions[i].return]);
    }
  }
  catch (err) {
    console.log(err);
  }

  res.json({status: "OK", data: "Portfolio snapshot has been inserted successfully."});
});

router.post("/insert-account-movement-t212", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var date = req.body.date;
  var type = req.body.type;
  var name = req.body.name;
  var quantity = req.body.quantity;
  var price = req.body.price;
  var value = req.body.value;
  var ret = req.body.return;

  var sql = "INSERT INTO t212_account_activity (date_mov, type, name, quantity, price, value, `return`) VALUES (?, ?, ?, ?, ?, ?, ?)";
  con.query(sql, [date, type, name, quantity, price, value, ret], function(err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "There was an error inserting the account movement."});
      return;
    }
    res.json({status: "OK", data: "Account movement has been inserted successfully."});
  });
});

router.get("/get-account-activity-t212", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  const [rows] = await con2.execute(`
        SELECT
            id,
            date_mov,
            name,
            type,
            quantity,
            price,
            value,
            \`return\`,
            YEAR(date_mov) as year
        FROM t212_account_activity
        ORDER BY date_mov DESC, id DESC
    `);

    const groupedByYear = rows.reduce((acc, row) => {
        const year = row.year.toString();

        if (!acc[year]) {
            acc[year] = [];
        }

        const { year: _, ...rowData } = row;
        acc[year].push(rowData);

        return acc;
    }, {});

    res.json({status: "OK", data: groupedByYear});
});

router.post("/update-account-movement-t212", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }
  var id = req.body.id;
  var updatedValues = {
    date_mov: req.body.date_mov,
    type: req.body.type,
    name: req.body.name,
    quantity: req.body.quantity,
    price: req.body.price,
    value: req.body.value,
    return: req.body.return
  };

  var sql = "UPDATE t212_account_activity SET date_mov = ?, type = ?, name = ?, quantity = ?, price = ?, value = ?, `return` = ? WHERE id = ?";
  con.query(sql, [updatedValues.date_mov, updatedValues.type, updatedValues.name, updatedValues.quantity, updatedValues.price, updatedValues.value, updatedValues.return, id], function(err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "There was an error updating the account movement."});
      return;
    }
    res.json({status: "OK", data: "Account movement has been updated successfully."});
  });
});

router.get("/get-portfolio-snapshots-t212", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  const query = `
      SELECT
          h.id,
          DATE_FORMAT(h.created_at, '%Y-%m-%d') as snapshot_date,
          h.balance,
          h.profit,
          p.name,
          p.price,
          p.quantity,
          p.value,
          p.\`return\`
      FROM t212_portfolio_snapshot_headers h
      LEFT JOIN t212_portfolio_snapshot_positions p ON h.id = p.snapshot_id
      ORDER BY h.created_at DESC, p.name ASC
  `;

  const [rows] = await con2.execute(query);

  const groupedData = {};

  rows.forEach(row => {
      const key = `${row.snapshot_date} - Balance: ${row.balance} - Profit: ${row.profit}`;

      if (!groupedData[key]) {
          groupedData[key] = [];
      }

      if (row.name) {
          groupedData[key].push({
              id: row.id,
              name: row.name,
              price: parseFloat(row.price),
              quantity: parseFloat(row.quantity),
              value: parseFloat(row.value),
              return: parseFloat(row.return)
          });
      }
  });

  res.json({status: "OK", data: groupedData});
});

router.get("/get-t212-yearly-profit", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  try {
    const [rows] = await con2.execute(`
          SELECT
              YEAR(date_mov) as year,
              SUM(\`return\`) as total_profit
          FROM t212_account_activity
          WHERE type = 'sell'
          GROUP BY YEAR(date_mov)
          ORDER BY year DESC
      `);

      res.json({status: "OK", data: rows[0] ? Number(rows[0].total_profit).toFixed(2) : "0.00"});
  } catch (err) {
    console.log(err);
    res.json({status: "NOK", error: "Error getting T212 yearly profit."});
  }
});

router.get("/get-t212-current-return", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql1 = "SELECT * FROM t212_portfolio_snapshot_headers ORDER BY created_at DESC LIMIT 1";
  var result1 = await con2.query(sql1);
  var profit_t212 = 0;
  if (result1[0].length > 0) {
    profit_t212 = Number(result1[0][0].profit);
  }

  res.json({status: "OK", data: Number(profit_t212).toFixed(2)});
});

module.exports = router;
