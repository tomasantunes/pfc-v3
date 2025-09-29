var express = require('express');
var router = express.Router();
const database = require('../libs/database');

var {con, con2} = database.getMySQLConnections();

router.post('/save-budget', async function(req, res, next) {
    const {title, income, expense, balance, rows} = req.body;
    console.log(title);
    console.log(income);
    console.log(expense);
    console.log(balance);
    console.log(rows);
    try {
        const [result] = await con2.execute(
            'INSERT INTO budgets (title, income, expense, balance) VALUES (?, ?, ?, ?)', 
            [title, income, expense, balance]
        );
        const budgetId = result.insertId;

        // Insert budget items
        for (const row of rows) {
            await con2.execute(
                'INSERT INTO budget_items (budget_id, category, amount) VALUES (?, ?, ?)',
                [budgetId, row.category, row.amount]
            );
        }

        res.json({status: "OK", data: "Budget saved successfully."});
    } catch (error) {
        console.error(error);
        res.json({status: "NOK", error: "Error saving budget."});
    }
});

router.get('/load-budgets', async function(req, res, next) {
    try {
        const [budgets] = await con2.execute('SELECT * FROM budgets INNER JOIN budget_items ON budgets.id = budget_items.budget_id');
        res.json({status: "OK", data: budgets});
    } catch (error) {
        console.error(error);
        res.json({status: "NOK", error: "Error loading budgets."});
    }
});

module.exports = router;