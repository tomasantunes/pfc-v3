var express = require('express');
var router = express.Router();
const database = require('../libs/database');

var {con, con2} = database.getMySQLConnections();

router.post("/update-credit-and-debt-data", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var field = req.body.field;
  var value = req.body.value;

  var sql1 = "SELECT * FROM credit_and_debt ORDER BY id DESC LIMIT 1";

  const [lastCreditAndDebtSnapshot] = await con2.execute(sql1);

  if (lastCreditAndDebtSnapshot.length === 0) {
    lastCreditAndDebtSnapshot[0] = {
      credit_limit: 0,
      total_debt: 0,
      monthly_debt_payment: 0,
      interest_rate: 0,
      time_to_payoff_months: 0
    };
  }

  var sql2 = `
    INSERT INTO
      credit_and_debt
    (
        credit_limit,
        total_debt,
        monthly_debt_payment,
        interest_rate,
        time_to_payoff_months
    )
    VALUES (
      ?,
      ?,
      ?,
      ?,
      ?
    )
  `;

  var fields_not_affected = [
    {key: "credit_limit", val: lastCreditAndDebtSnapshot[0].credit_limit},
    {key: "total_debt", val: lastCreditAndDebtSnapshot[0].total_debt},
    {key: "monthly_debt_payment", val: lastCreditAndDebtSnapshot[0].monthly_debt_payment},
    {key: "interest_rate", val: lastCreditAndDebtSnapshot[0].interest_rate},
    {key: "time_to_payoff_months", val: lastCreditAndDebtSnapshot[0].time_to_payoff_months}
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
    data: "Credit and debt data has been updated."
  });
});

router.get("/get-credit-and-debt-data", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  var sql1 = "SELECT * FROM credit_and_debt ORDER BY id DESC LIMIT 1";

  const [lastCreditAndDebtSnapshot] = await con2.execute(sql1);

  if (lastCreditAndDebtSnapshot.length === 0) {
    res.json({status: "OK", data: {
      credit_limit: 0,
      total_debt: 0,
      monthly_debt_payment: 0,
      interest_rate: 0,
      time_to_payoff_months: 0
    }});
    return;
  }

  res.json({status: "OK", data: lastCreditAndDebtSnapshot[0]});
});

module.exports = router;