var express = require('express');
var router = express.Router();
const {getMySQLConnections} = require('../libs/database');

var {con, con2} = getMySQLConnections();

router.post("/update-item-price", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  const {id, unit_price, total_price} = req.body;

  if (!id || !unit_price || !total_price) {
    res.json({status: "NOK", error: "Missing parameters."});
    return;
  }

  var sql = "UPDATE inventory SET unit_value = ?, total_value = ? WHERE id = ?";
  try {
    await con2.execute(sql, [unit_price, total_price, id]);
    res.json({status: "OK"});
  } catch (error) {
    console.error("Error updating item price:", error);
    res.json({status: "NOK", error: "Database error."});
  }
});

router.get("/get-inventory", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = "SELECT id, item_name, description, qtt, total_value AS total_price, unit_value AS unit_price FROM inventory";
  try {
    const [rows] = await con2.query(sql);
    res.json({status: "OK", data: rows});
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.json({status: "NOK", error: "Database error."});
  }
});

router.get("/get-inventory-value", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql = "SELECT SUM(total_value) AS total_inventory_value FROM inventory";
  try {
    const [rows] = await con2.query(sql);
    res.json({status: "OK", data: rows[0].total_inventory_value || 0});
  } catch (error) {
    console.error("Error fetching inventory value:", error);
    res.json({status: "NOK", error: "Database error."});
  }
});

module.exports = router;