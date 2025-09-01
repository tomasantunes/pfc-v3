var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require("mysql2");
var mysql2 = require('mysql2/promise');
var secretConfig = require('./secret-config');
var session = require('express-session');
const readerXLS = require('xlsx');
var fileUpload = require('express-fileupload');
const fs = require("fs");
const csv = require('fast-csv');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));

app.use(session({
  secret: secretConfig.SESSION_KEY,
  resave: false,
  saveUninitialized: true
}));

var con;
var con2;
if (secretConfig.ENVIRONMENT == "WINDOWS" || secretConfig.ENVIRONMENT == "MACOS") {
  con = mysql.createPool({
    connectionLimit : 90,
    connectTimeout: 1000000,
    host: secretConfig.DB_HOST,
    user: secretConfig.DB_USER,
    password: secretConfig.DB_PASSWORD,
    database: secretConfig.DB_NAME,
    timezone: '+01:00',
    port: 3306,
    dateStrings: true
  });

  con2 = mysql2.createPool({
    connectionLimit : 90,
    connectTimeout: 1000000,
    host: secretConfig.DB_HOST,
    user: secretConfig.DB_USER,
    password: secretConfig.DB_PASSWORD,
    database: secretConfig.DB_NAME,
    timezone: '+01:00',
    port: 3306,
    dateStrings: true
  });
}
else if (secretConfig.ENVIRONMENT == "UBUNTU") {
  con = mysql.createPool({
    connectionLimit : 90,
    connectTimeout: 1000000,
    host: secretConfig.DB_HOST,
    user: secretConfig.DB_USER,
    password: secretConfig.DB_PASSWORD,
    database: secretConfig.DB_NAME,
    socketPath: '/var/run/mysqld/mysqld.sock',
    timezone: '+01:00',
    dateStrings: true
  });

  con2 = mysql2.createPool({
    connectionLimit : 90,
    connectTimeout: 1000000,
    host: secretConfig.DB_HOST,
    user: secretConfig.DB_USER,
    password: secretConfig.DB_PASSWORD,
    database: secretConfig.DB_NAME,
    socketPath: '/var/run/mysqld/mysqld.sock',
    timezone: '+01:00',
    dateStrings: true
  });
}

function convertBpiDate(dateStr) {
  if (dateStr == "") return "1900-01-01";
  const [day, month, year] = dateStr.split('-'); // Split the input string by '-'
  return `${year}-${month}-${day}`; // Rearrange and return the new format
}

function convertPaypalDate(dateStr) {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

app.post("/import-bpi-xls", async (req, res) => {
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

    for (var i in xls) {
      if (
        xls[i].hasOwnProperty("BPI Net") && 
        xls[i].hasOwnProperty("__EMPTY") && 
        xls[i].hasOwnProperty("__EMPTY_1") &&
        xls[i].hasOwnProperty("__EMPTY_2") &&
        xls[i].hasOwnProperty("__EMPTY_3") &&
        xls[i]["BPI Net"] != "Data Mov."
      ) {
        var data_mov = convertBpiDate(xls[i]["BPI Net"]);
        var data_valor = convertBpiDate(xls[i]["__EMPTY"]);
        var desc_mov = xls[i]["__EMPTY_1"];
        var valor = xls[i]["__EMPTY_2"];
        var saldo = xls[i]["__EMPTY_3"];
        var sql1 = "SELECT * FROM bpi_mov WHERE data_mov = ? AND data_valor = ? AND desc_mov = ? AND valor = ? AND saldo = ?";
        var result = await con2.query(sql1, [data_mov, data_valor, desc_mov, valor, saldo]);
        if (result[0].length < 1) {
          var is_expense = (Number(valor) < 0) ? 1 : 0;
          var sql2 = "INSERT INTO bpi_mov (data_mov, data_valor, desc_mov, valor, saldo, is_expense) VALUES (?, ?, ?, ?, ?, ?)";
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
  } catch(exception) {
    console.log(exception);
    res.json({status: "NOK", error: "Error importing file."});
    return;
  }
  res.json({status: "OK", data: "XLS has been imported successfully."});
});

app.post("/add-bpi-mov", (req, res) => {
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

  var sql = "INSERT INTO bpi_mov (data_mov, data_valor, desc_mov, valor, saldo, is_expense, is_original) VALUES (?, ?, ?, ?, ?, ?, ?)";
  con.query(sql, [data_mov, data_valor, desc_mov, Number(valor), Number(saldo), is_expense, 0], function(err, result) {
    if (err) {
      console.log("Error inserting to MySQL.");
      console.log(err.message);
      res.json({status: "NOK", error: "Error inserting to MySQL."});
    }
    res.json({status: "OK", data: "BPI movement has been added."});
  });
});

app.get("/get-bpi-mov", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = "SELECT * FROM bpi_mov ORDER BY data_mov DESC, id DESC";
  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "There was an error getting movements."});
      return;
    }
    res.json({status: "OK", data: result});
  });
});

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
      var date = convertPaypalDate(row["Date"]);
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

app.post("/insert-santander-balance", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var balance = req.body.balance;

  var sql1 = "INSERT INTO santander (balance) VALUES (?)";
  await con2.query(sql1, [balance]);

  res.json({status: "OK", data: "Santander Balance has been submitted."});
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

app.post("/insert-portfolio-snapshot-t212", async (req, res) => {
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

app.post("/insert-portfolio-snapshot-polymarket", async (req, res) => {
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

app.post("/insert-portfolio-snapshot-coinbase", async (req, res) => {
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

app.get("/get-last-snapshot-coinbase", (req, res) => {
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

app.post("/insert-portfolio-snapshot-binance", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var balance = req.body.balance;
  var assets = req.body.assets;

  var sql1 = "INSERT INTO binance_portfolio_snapshot_headers (balance) VALUES (?)";
  var result1 = await con2.query(sql1, [balance]);
  var headerId = result1[0].insertId;

  for (var i in assets) {
    var sql2 = "INSERT INTO binance_portfolio_snapshot_assets (snapshot_id, name, deposit, quantity, value) VALUES (?, ?, ?, ?, ?)";
    await con2.query(sql2, [headerId, assets[i].name, assets[i].deposit, assets[i].quantity, assets[i].value]);
  }

  res.json({status: "OK", data: "Portfolio snapshot has been inserted successfully."});
});

app.get("/get-last-snapshot-binance", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = "SELECT * FROM binance_portfolio_snapshot_assets WHERE snapshot_id = (SELECT MAX(snapshot_id) FROM binance_portfolio_snapshot_assets)";

  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      res.json({status: "NOK", error: "There was an error getting the last snapshot."});
      return;
    }
    res.json({status: "OK", data: result});
  });
});

app.get("/get-net-worth", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql1 = "SELECT * FROM bpi_mov ORDER BY data_mov DESC, id DESC LIMIT 1";
  var result1 = await con2.query(sql1);
  var saldo_bpi = 0;
  if (result1[0].length > 0) {
    saldo_bpi = result1[0][0].saldo;
  }
  

  var sql2 = "SELECT * FROM t212_portfolio_snapshot_headers ORDER BY created_at DESC LIMIT 1";
  var result2 = await con2.query(sql2);
  var saldo_t212 = 0;
  if (result2[0].length > 0) {
    saldo_t212 = result2[0][0].balance;
  }
  

  var sql3 = "SELECT * FROM coinbase_portfolio_snapshot_headers ORDER BY created_at DESC LIMIT 1";
  var result3 = await con2.query(sql3);
  var saldo_coinbase = 0;
  if (result3[0].length > 0) {
    saldo_coinbase = result3[0][0].balance;
  }

  var sql4 = "SELECT * FROM binance_portfolio_snapshot_headers ORDER BY created_at DESC LIMIT 1";
  var result4 = await con2.query(sql4);
  var saldo_binance = 0;
  if (result4[0].length > 0) {
    saldo_binance = result4[0][0].balance;
  }

  var sql5 = "SELECT * FROM polymarket_portfolio_snapshot ORDER BY created_at DESC LIMIT 1";
  var result5 = await con2.query(sql5);
  var saldo_polymarket = 0;
  if (result5[0].length > 0) {
    saldo_polymarket = result5[0][0].balance;
  }

  var sql6 = "SELECT * FROM santander ORDER BY created_at DESC LIMIT 1";
  var result6 = await con2.query(sql6);
  var saldo_santander = 0;
  if (result6[0].length > 0) {
    saldo_santander = result6[0][0].balance;
  }

  var total = (Number(saldo_bpi) + Number(saldo_t212) + Number(saldo_coinbase) + Number(saldo_binance) + Number(saldo_polymarket) + Number(saldo_santander)).toFixed(2);

  res.json({status: "OK", data: total});

});

app.get("/get-average-monthly-expense", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  const [rows] = await con2.execute(`
    SELECT
        AVG(monthly_expenses.monthly_sum) AS average_monthly_expense
    FROM (
        SELECT
            YEAR(data_mov) AS yr,
            MONTH(data_mov) AS mnth,
            SUM(ABS(valor)) AS monthly_sum
        FROM bpi_mov
        WHERE
          valor < 0
          AND is_expense = 1
          AND (
              YEAR(data_mov) <> YEAR(CURDATE())
              OR MONTH(data_mov) <> MONTH(CURDATE())
          )
        GROUP BY YEAR(data_mov), MONTH(data_mov)
    ) AS monthly_expenses
  `);

  const averageMonthlyExpense = Number(rows[0].average_monthly_expense).toFixed(2) || 0;
  res.json({status: "OK", data: averageMonthlyExpense});
});

app.get("/get-expense-last-12-months", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  const [rows] = await con2.execute(`
    SELECT 
        YEAR(data_mov) AS yr,
        MONTH(data_mov) AS mnth,
        SUM(ABS(valor)) AS monthly_sum
    FROM bpi_mov
    WHERE
        valor < 0
        AND is_expense = 1
        AND (
          YEAR(data_mov) <> YEAR(CURDATE())
          OR MONTH(data_mov) <> MONTH(CURDATE())
        )
    GROUP BY YEAR(data_mov), MONTH(data_mov)
    ORDER BY yr DESC, mnth DESC
    LIMIT 12;
  `);

  const expenseLast12Months = rows;
  res.json({status: "OK", data: expenseLast12Months});
});

app.get("/get-total-profit", async (req, res) => {
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

  var sql2 = "SELECT * FROM polymarket_portfolio_snapshot ORDER BY created_at DESC LIMIT 1";
  var result2 = await con2.query(sql2);
  var profit_polymarket = 0;
  if (result2[0].length > 0) {
    profit_polymarket = Number(result2[0][0].profit);
  }

  const [lastCoinbaseSnapshotRows] = await con2.execute(
    `SELECT id, balance, created_at 
     FROM coinbase_portfolio_snapshot_headers
     ORDER BY created_at DESC
     LIMIT 1`
  );

  var coinbaseProfit = 0;

  if (lastCoinbaseSnapshotRows.length > 0) {
    const lastCoinbaseSnapshot = lastCoinbaseSnapshotRows[0];

    const [coinbaseAssetRows] = await con2.execute(
      `SELECT deposit, value
      FROM coinbase_portfolio_snapshot_assets
      WHERE snapshot_id = ?`,
      [lastCoinbaseSnapshot.id]
    );

    for (const asset of coinbaseAssetRows) {
      coinbaseProfit += (Number(asset.value) - Number(asset.deposit));
    }
  }

  const [lastBinanceSnapshotRows] = await con2.execute(
    `SELECT id, balance, created_at 
     FROM binance_portfolio_snapshot_headers
     ORDER BY created_at DESC
     LIMIT 1`
  );

  var binanceProfit = 0;

  if (lastBinanceSnapshotRows.length > 0) {
    const lastBinanceSnapshot = lastBinanceSnapshotRows[0];

    const [binanceAssetRows] = await con2.execute(
      `SELECT deposit, value
      FROM binance_portfolio_snapshot_assets
      WHERE snapshot_id = ?`,
      [lastBinanceSnapshot.id]
    );

    for (const asset of binanceAssetRows) {
      binanceProfit += (Number(asset.value) - Number(asset.deposit));
    }
  }

  var total_profit = (profit_t212 + profit_polymarket + coinbaseProfit + binanceProfit).toFixed(2);
  res.json({status: "OK", data: total_profit});
});

app.post("/update-estimated-data", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var field = req.body.field;
  var value = req.body.value;

  var sql1 = "SELECT * FROM estimated_data ORDER BY id DESC LIMIT 1";

  const [lastEstimatedDataSnapshot] = await con2.execute(sql1);

  console.log(lastEstimatedDataSnapshot);

  if (lastEstimatedDataSnapshot.length === 0) {
    lastEstimatedDataSnapshot[0] = {
      incomePerHour: 0,
      incomePerDay: 0,
      incomePerWeek: 0,
      incomePerMonth: 0,
      incomePerYear: 0,
      netSalaryPerMonth: 0,
      netSalaryPerYear: 0,
      grossSalaryPerMonth: 0,
      grossSalaryPerYear: 0
    };
  }

  var sql2 = `
    INSERT INTO
      estimated_data
    (
      incomePerHour,
      incomePerDay,
      incomePerWeek,
      incomePerMonth,
      incomePerYear,
      netSalaryPerMonth,
      netSalaryPerYear,
      grossSalaryPerMonth,
      grossSalaryPerYear
    )
    VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?
    )
  `;

  var fields_not_affected = [
    {key: "incomePerHour", val: lastEstimatedDataSnapshot[0].incomePerHour},
    {key: "incomePerDay", val: lastEstimatedDataSnapshot[0].incomePerDay},
    {key: "incomePerWeek", val: lastEstimatedDataSnapshot[0].incomePerWeek},
    {key: "incomePerMonth", val: lastEstimatedDataSnapshot[0].incomePerMonth},
    {key: "incomePerYear", val: lastEstimatedDataSnapshot[0].incomePerYear},
    {key: "netSalaryPerMonth", val: lastEstimatedDataSnapshot[0].netSalaryPerMonth},
    {key: "netSalaryPerYear", val: lastEstimatedDataSnapshot[0].netSalaryPerYear},
    {key: "grossSalaryPerMonth", val: lastEstimatedDataSnapshot[0].grossSalaryPerMonth},
    {key: "grossSalaryPerYear", val: lastEstimatedDataSnapshot[0].grossSalaryPerYear}
  ];
  var fields_to_affect = [];

  for (var i in fields_not_affected) {
    if (fields_not_affected[i].key == field) {
      fields_not_affected[i].val = value;
    }
  }

  fields_to_affect = fields_not_affected;

  await con2.execute(sql2, fields_to_affect.map(f => f.val));
  res.json({
    status: "OK",
    data: "Estimated data has been updated."
  });
});

app.get("/get-estimated-data", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql1 = "SELECT * FROM estimated_data ORDER BY id DESC LIMIT 1";

  const [lastEstimatedDataSnapshot] = await con2.execute(sql1);

  console.log(lastEstimatedDataSnapshot);

  if (lastEstimatedDataSnapshot.length === 0) {
    res.json({status: "OK", data: {
      incomePerHour: 0,
      incomePerDay: 0,
      incomePerWeek: 0,
      incomePerMonth: 0,
      incomePerYear: 0,
      netSalaryPerMonth: 0,
      netSalaryPerYear: 0,
      grossSalaryPerMonth: 0,
      grossSalaryPerYear: 0
    }});
    return;
  }

  res.json({status: "OK", data: lastEstimatedDataSnapshot[0]});
});

app.post("/api/check-login", (req, res) => {
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
        res.json({status: "NOK", error: "Wrong username/password."});
      }
    }
    else {
      res.json({status: "NOK", error: "Too many login attempts."});
    }
  });
});

app.get("/api/logout", (req, res) => {
  if (req.session.isLoggedIn) {
    req.session.isLoggedIn = false;
    res.redirect("/");
  }
  else {
    res.json({status: "NOK", error: "You can't logout because you are not logged in."});
  }
});

app.post("/toggle-is-expense", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var id = req.body.id;

  var sql = "SELECT * FROM bpi_mov WHERE id = ?";
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
    var sql2 = "UPDATE bpi_mov SET is_expense = ? WHERE id = ?";
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

app.get("/", function(req, res) {
  res.redirect("/home");
});

app.use(express.static(path.resolve(__dirname) + '/frontend/build'));

app.get('/login', (req, res) => {
  res.sendFile(path.resolve(__dirname) + '/frontend/build/index.html');
});

app.get('/home', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.resolve(__dirname) + '/frontend/build/index.html');
  }
  else {
    res.redirect('/login');
  }
});

app.get('/bpi', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.resolve(__dirname) + '/frontend/build/index.html');
  }
  else {
    res.redirect('/login');
  }
});

app.get('/paypal', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.resolve(__dirname) + '/frontend/build/index.html');
  }
  else {
    res.redirect('/login');
  }
});

app.get('/trading212', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.resolve(__dirname) + '/frontend/build/index.html');
  }
  else {
    res.redirect('/login');
  }
});

app.get('/coinbase', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.resolve(__dirname) + '/frontend/build/index.html');
  }
  else {
    res.redirect('/login');
  }
});

app.get('/binance', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.resolve(__dirname) + '/frontend/build/index.html');
  }
  else {
    res.redirect('/login');
  }
});

app.get('/polymarket', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.resolve(__dirname) + '/frontend/build/index.html');
  }
  else {
    res.redirect('/login');
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
