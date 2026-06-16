var express = require('express');
var router = express.Router();
const database = require('../libs/database');
const {SimplePdf, formatCurrency, formatPercent} = require('../libs/simple-pdf');

var {con2} = database.getMySQLConnections();

function numberValue(value) {
  return Number(value || 0);
}

function monthLabel(row) {
  return `${String(row.mnth).padStart(2, "0")}/${row.yr}`;
}

async function getLast12MonthsExpenses() {
  const queries = [
    `SELECT YEAR(data_mov) AS yr, MONTH(data_mov) AS mnth, SUM(ABS(valor)) AS monthly_sum
     FROM bpi_mov
     WHERE valor < 0 AND is_expense = 1 AND (YEAR(data_mov) <> YEAR(CURDATE()) OR MONTH(data_mov) <> MONTH(CURDATE()))
     GROUP BY YEAR(data_mov), MONTH(data_mov)
     ORDER BY yr DESC, mnth DESC
     LIMIT 12`,
    `SELECT YEAR(data_mov) AS yr, MONTH(data_mov) AS mnth, SUM(ABS(valor)) AS monthly_sum
     FROM santander_mov
     WHERE valor < 0 AND is_expense = 1 AND (YEAR(data_mov) <> YEAR(CURDATE()) OR MONTH(data_mov) <> MONTH(CURDATE()))
     GROUP BY YEAR(data_mov), MONTH(data_mov)
     ORDER BY yr DESC, mnth DESC
     LIMIT 12`,
    `SELECT YEAR(data_inicio) AS yr, MONTH(data_inicio) AS mnth, SUM(ABS(montante)) AS monthly_sum
     FROM revolut_mov
     WHERE montante < 0 AND is_expense = 1 AND (YEAR(data_inicio) <> YEAR(CURDATE()) OR MONTH(data_inicio) <> MONTH(CURDATE()))
     GROUP BY YEAR(data_inicio), MONTH(data_inicio)
     ORDER BY yr DESC, mnth DESC
     LIMIT 12`,
    `SELECT YEAR(date) AS yr, MONTH(date) AS mnth, SUM(ABS(value)) AS monthly_sum
     FROM coinbase_expenses
     WHERE YEAR(date) <> YEAR(CURDATE()) OR MONTH(date) <> MONTH(CURDATE())
     GROUP BY YEAR(date), MONTH(date)
     ORDER BY yr DESC, mnth DESC
     LIMIT 12`,
    `SELECT YEAR(date) AS yr, MONTH(date) AS mnth, SUM(ABS(amount)) AS monthly_sum
     FROM extra_expenses
     WHERE YEAR(date) <> YEAR(CURDATE()) OR MONTH(date) <> MONTH(CURDATE())
     GROUP BY YEAR(date), MONTH(date)
     ORDER BY yr DESC, mnth DESC
     LIMIT 12`
  ];

  const results = await Promise.all(queries.map((query) => con2.execute(query)));
  const sourceRows = results.map(([rows]) => rows);
  const expenses = [];

  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (i + 1));
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const total = sourceRows.reduce((sum, rows) => {
      const entry = rows.find((row) => row.yr === year && row.mnth === month);
      return sum + numberValue(entry?.monthly_sum);
    }, 0);

    expenses.push({yr: year, mnth: month, monthly_sum: total});
  }

  return expenses;
}

async function getLatestRows() {
  const [
    [estimatedRows],
    [creditRows],
    [inventoryRows],
    [budgetRows],
    [netWorthRows],
    [salesRows],
    [distributionRows],
    [cryptoRows],
    [savingsRows]
  ] = await Promise.all([
    con2.execute("SELECT * FROM estimated_data ORDER BY id DESC LIMIT 1"),
    con2.execute("SELECT * FROM credit_and_debt ORDER BY id DESC LIMIT 1"),
    con2.execute("SELECT SUM(total_value) AS total_inventory_value FROM inventory"),
    con2.execute("SELECT * FROM budgets WHERE title = ? ORDER BY created_at DESC, id DESC LIMIT 1", ["Regular Monthly Expense"]),
    con2.execute("SELECT net_worth, created_at FROM net_worth_snapshots ORDER BY created_at DESC LIMIT 4"),
    con2.execute(`
      SELECT SUM(total_profit) AS stock_sales
      FROM (
        SELECT SUM(\`return\`) AS total_profit
        FROM t212_account_activity
        WHERE type = 'sell' AND YEAR(date_mov) = YEAR(CURDATE())
        UNION ALL
        SELECT SUM(\`return\`) AS total_profit
        FROM revolut_account_activity
        WHERE type = 'sell' AND YEAR(date_mov) = YEAR(CURDATE())
      ) stock_sales
    `),
    con2.execute(`
      SELECT COALESCE(asset_type, 'Uncategorized') AS asset_type, SUM(value) AS amount
      FROM (
        SELECT p.asset_type, p.value
        FROM t212_portfolio_snapshot_positions p
        WHERE p.snapshot_id = (SELECT id FROM t212_portfolio_snapshot_headers ORDER BY created_at DESC LIMIT 1)
        UNION ALL
        SELECT p.asset_type, p.value
        FROM revolut_portfolio_snapshot_positions p
        WHERE p.snapshot_id = (SELECT id FROM revolut_portfolio_snapshot_headers ORDER BY created_at DESC LIMIT 1)
      ) portfolio_positions
      GROUP BY COALESCE(asset_type, 'Uncategorized')
      ORDER BY asset_type
    `),
    con2.execute(`
      SELECT
        COALESCE((SELECT balance FROM coinbase_portfolio_snapshot_headers ORDER BY created_at DESC LIMIT 1), 0) +
        COALESCE((SELECT balance FROM binance_portfolio_snapshot_headers ORDER BY created_at DESC LIMIT 1), 0) AS cryptocurrency
    `),
    con2.execute("SELECT cash, savings_accounts_total, other_wallets_balance FROM savings ORDER BY created_at DESC LIMIT 1")
  ]);

  return {
    estimated: estimatedRows[0] || {},
    credit: creditRows[0] || {},
    totalInventoryValue: numberValue(inventoryRows[0]?.total_inventory_value),
    budget: budgetRows[0] || {},
    netWorthSnapshots: netWorthRows.slice().reverse(),
    currentYearStockSales: numberValue(salesRows[0]?.stock_sales),
    distributionRows,
    cryptocurrency: numberValue(cryptoRows[0]?.cryptocurrency),
    savings: savingsRows[0] || {}
  };
}

function buildPortfolioDistribution(rows, cryptocurrency, savings) {
  const distribution = rows.map((row) => ({
    assetType: row.asset_type || "Uncategorized",
    amount: numberValue(row.amount)
  }));

  distribution.push({
    assetType: "Cryptocurrency",
    amount: cryptocurrency
  });
  distribution.push({
    assetType: "Savings",
    amount: numberValue(savings.savings_accounts_total) + numberValue(savings.other_wallets_balance)
  });
  distribution.push({
    assetType: "Cash",
    amount: numberValue(savings.cash)
  });

  const grouped = distribution.reduce((acc, item) => {
    acc[item.assetType] = (acc[item.assetType] || 0) + item.amount;
    return acc;
  }, {});
  const total = Object.values(grouped).reduce((sum, amount) => sum + amount, 0);

  return Object.entries(grouped)
    .map(([assetType, amount]) => ({
      assetType,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
    .filter((row) => row.amount !== 0)
    .sort((a, b) => b.amount - a.amount);
}

function createdAtLabel(value, fallbackIndex) {
  if (!value) return `Snapshot ${fallbackIndex + 1}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `Snapshot ${fallbackIndex + 1}`;
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

router.get("/export-monthly-report", async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.json({status: "NOK", error: "Invalid Authorization."});
    return;
  }

  try {
    const reportData = await getLatestRows();
    const expenses = await getLast12MonthsExpenses();
    const lastMonthExpense = numberValue(expenses[0]?.monthly_sum);
    const incomePerMonth = numberValue(reportData.estimated.incomePerMonth);
    const expenseBenefitsMonthly = numberValue(reportData.estimated.benefitsPerYear) / 12;
    const portfolioDistribution = buildPortfolioDistribution(
      reportData.distributionRows,
      reportData.cryptocurrency,
      reportData.savings
    );

    const pdf = new SimplePdf("Monthly Report");
    const generatedAt = new Date().toISOString().slice(0, 10);

    pdf.text("Monthly Report", 42, 48, {size: 22, bold: true});
    pdf.text(`Generated ${generatedAt}`, 42, 70, {size: 10});
    pdf.y = 100;

    pdf.heading("Returns");
    pdf.lineChart(
      "Last 4 Net Worth Snapshots",
      reportData.netWorthSnapshots.map((snapshot, index) => ({
        label: createdAtLabel(snapshot.created_at, index),
        value: numberValue(snapshot.net_worth)
      }))
    );
    pdf.keyValue("Current-year T212 + Revolut stock sales", formatCurrency(reportData.currentYearStockSales));
    pdf.keyValue("Income per month", formatCurrency(incomePerMonth));
    pdf.keyValue("Total inventory value", formatCurrency(reportData.totalInventoryValue));

    pdf.heading("Expenses");
    pdf.keyValue("Income per month minus last month's expense", formatCurrency(incomePerMonth - lastMonthExpense));
    pdf.barChart(
      "Last 4 Months Expense Value",
      expenses.slice(0, 4).reverse().map((expense) => ({
        label: monthLabel(expense),
        value: numberValue(expense.monthly_sum)
      }))
    );
    pdf.keyValue("Total debt", formatCurrency(reportData.credit.total_debt));
    pdf.keyValue("Regular Monthly Expense budget", formatCurrency(reportData.budget.expense));
    pdf.keyValue("Last credit payment", formatCurrency(reportData.credit.last_credit_payment));
    pdf.keyValue("Expense benefits per month", formatCurrency(expenseBenefitsMonthly));

    pdf.addPage();
    pdf.heading("Portfolio Distribution");
    pdf.table(
      ["Asset Type", "Amount", "Percentage"],
      portfolioDistribution.map((row) => [
        row.assetType,
        formatCurrency(row.amount),
        formatPercent(row.percentage)
      ]),
      [230, 150, 110]
    );

    const filename = `monthly-report-${generatedAt}.pdf`;
    const buffer = pdf.build();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error("Error exporting monthly report:", err);
    res.status(500).json({status: "NOK", error: "Error exporting monthly report."});
  }
});

module.exports = router;
