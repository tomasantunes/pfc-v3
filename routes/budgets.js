var express = require('express');
var router = express.Router();
const database = require('../libs/database');

var {con, con2} = database.getMySQLConnections();

router.post('/save-budget', async function(req, res, next) {
    const {title, income, expense, balance, rows} = req.body;
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
        const [budgets] = await con2.execute('SELECT * FROM budgets');
        
        for (let i in budgets) {
            const [items] = await con2.execute('SELECT * FROM budget_items WHERE budget_id = ?', [budgets[i].id]);
            budgets[i].rows = items;
        }

        res.json({status: "OK", data: budgets});
    } catch (error) {
        console.error(error);
        res.json({status: "NOK", error: "Error loading budgets."});
    }
});

router.post('/delete-budget', async function(req, res, next) {
    const {id} = req.body;

    if (!id) {
        return res.json({status: "NOK", error: "Invalid budget ID."});
    }

    try {
        await con2.execute('DELETE FROM budget_items WHERE budget_id = ?', [id]);
        await con2.execute('DELETE FROM budgets WHERE id = ?', [id]);
        res.json({status: "OK"});
    } catch (error) {
        console.error(error);
        res.json({status: "NOK", error: "Error deleting budget."});
    }
});

module.exports = router;