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
          var sql2 = "INSERT INTO bpi_mov (data_mov, data_valor, desc_mov, valor, saldo) VALUES (?, ?, ?, ?, ?)";
            con.query(sql2, [data_mov, data_valor, desc_mov, valor, saldo]);
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

app.get("/get-bpi-mov", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = "SELECT * FROM bpi_mov ORDER BY data_mov DESC, id DESC LIMIT 25";
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

  var balance = req.body.balance;
  var profit = req.body.profit;
  var positions = req.body.positions;

  var sql1 = "INSERT INTO t212_portfolio_snapshot_headers (balance, profit) VALUES (?, ?)";
  var result1 = await con2.query(sql1, [balance, profit]);
  var headerId = result1[0].insertId;

  for (var i in positions) {
    var sql2 = "INSERT INTO t212_portfolio_snapshot_positions (snapshot_id, name, price, quantity, balance) VALUES (?, ?, ?, ?, ?)";
    await con2.query(sql2, [headerId, positions[i].name, positions[i].price, positions[i].quantity, positions[i].balance]);
  }

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
