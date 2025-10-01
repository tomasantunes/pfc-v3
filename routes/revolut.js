var express = require('express');
var router = express.Router();
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

router.post("/insert-account-movement-revolut", (req, res) => {
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

  var sql = "INSERT INTO revolut_account_activity (date_mov, type, name, quantity, price, value, `return`) VALUES (?, ?, ?, ?, ?, ?, ?)";
  con.query(sql, [date, type, name, quantity, price, value, req.body.return], function(err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "There was an error inserting the account movement."});
      return;
    }
    res.json({status: "OK", data: "Account movement has been inserted successfully."});
  });
});

router.get("/get-account-activity-revolut", async (req, res) => {
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
        FROM revolut_account_activity 
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

router.post("/update-account-movement-revolut", (req, res) => {
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

  var sql = "UPDATE revolut_account_activity SET date_mov = ?, type = ?, name = ?, quantity = ?, price = ?, value = ?, `return` = ? WHERE id = ?";
  con.query(sql, [updatedValues.date_mov, updatedValues.type, updatedValues.name, updatedValues.quantity, updatedValues.price, updatedValues.value, updatedValues.return, id], function(err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "There was an error updating the account movement."});
      return;
    }
    res.json({status: "OK", data: "Account movement has been updated successfully."});
  });
});

router.post("/insert-portfolio-snapshot-revolut", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  try {
    var balance = req.body.balance;
    var profit = req.body.profit;
    var positions = req.body.positions;

    var sql1 = "INSERT INTO revolut_portfolio_snapshot_headers (balance, profit) VALUES (?, ?)";
    var result1 = await con2.query(sql1, [balance, profit]);
    var headerId = result1[0].insertId;

    for (var i in positions) {
      var sql2 = "INSERT INTO revolut_portfolio_snapshot_positions (snapshot_id, name, price, quantity, value, `return`) VALUES (?, ?, ?, ?, ?, ?)";
      await con2.query(sql2, [headerId, positions[i].name, positions[i].price, positions[i].quantity, positions[i].value, positions[i].return]);
    }
  }
  catch (err) {
    console.log(err);
  }

  res.json({status: "OK", data: "Portfolio snapshot has been inserted successfully."});
});

router.get("/get-portfolio-snapshots-revolut", async (req, res) => {
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
      FROM revolut_portfolio_snapshot_headers h
      LEFT JOIN revolut_portfolio_snapshot_positions p ON h.id = p.snapshot_id
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

router.get("/get-revolut-yearly-profit", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  try {
    const [rows] = await con2.execute(`
          SELECT
              YEAR(date_mov) as year,
              SUM(\`return\`) as total_profit
          FROM revolut_account_activity
          WHERE type = 'sell'
          GROUP BY YEAR(date_mov)
          ORDER BY year DESC
      `);

      res.json({status: "OK", data: rows[0] ? Number(rows[0].total_profit).toFixed(2) : "0.00"});
  } catch (err) {
    console.log(err);
    res.json({status: "NOK", error: "Error getting Revolut yearly profit."});
  }
});

router.get("/get-revolut-current-return", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql1 = "SELECT * FROM revolut_portfolio_snapshot_headers ORDER BY created_at DESC LIMIT 1";
  var result1 = await con2.query(sql1);
  var profit_revolut = 0;
  if (result1[0].length > 0) {
    profit_revolut = Number(result1[0][0].profit);
  }

  res.json({status: "OK", data: Number(profit_revolut).toFixed(2)});
});

module.exports = router;