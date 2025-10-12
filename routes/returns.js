var express = require('express');
var router = express.Router();
const database = require('../libs/database');

var {con, con2} = database.getMySQLConnections();

router.get("/get-net-worth", async (req, res) => {
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

  var sql7 = "SELECT cash + vouchers + gift_cards + savings_accounts_total AS balance FROM savings ORDER BY created_at DESC LIMIT 1";
  var result7 = await con2.query(sql7);
  var saldo_savings = 0;
  if (result7[0].length > 0) {
    saldo_savings = result7[0][0].balance;
  }

  var sql8 = "SELECT * FROM revolut_portfolio_snapshot_headers ORDER BY created_at DESC LIMIT 1";
  var result8 = await con2.query(sql8);
  var saldo_revolut_stocks = 0;
  if (result8[0].length > 0) {
    saldo_revolut_stocks = result8[0][0].balance;
  }

  var sql9 = "SELECT * FROM revolut_mov ORDER BY id DESC LIMIT 1";
  var result9 = await con2.query(sql9);
  var saldo_revolut = 0;
  if (result9[0].length > 0) {
    saldo_revolut = result9[0][0].saldo;
  }

  var total = (Number(saldo_bpi) + Number(saldo_t212) + Number(saldo_coinbase) + Number(saldo_binance) + Number(saldo_polymarket) + Number(saldo_santander) + Number(saldo_savings) + Number(saldo_revolut_stocks) + Number(saldo_revolut)).toFixed(2);

  res.json({status: "OK", data: total});
});

router.post("/save-net-worth", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  const { net_worth } = req.body;

  console.log("Received net worth to save:", net_worth);

  if (isNaN(net_worth)) {
    res.json({status: "NOK", error: "Invalid net worth value."});
    return;
  }

  var sql = "INSERT INTO net_worth_snapshots (net_worth) VALUES (?)";
  await con2.query(sql, [net_worth]);

  res.json({status: "OK", data: "Net worth saved successfully."});
});

router.get("/get-net-worth-snapshots", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = "SELECT * FROM net_worth_snapshots WHERE YEAR(created_at) = YEAR(NOW()) ORDER BY created_at DESC LIMIT 12";
  var result = await con2.query(sql);
  var snapshots = [];
  if (result[0].length > 0) {
    snapshots = result[0];
  }

  res.json({status: "OK", data: snapshots});
});

router.get("/get-crypto-profit", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
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

  var total_profit = (profit_polymarket + coinbaseProfit + binanceProfit).toFixed(2);
  res.json({status: "OK", data: total_profit});
});

module.exports = router;