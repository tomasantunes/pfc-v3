var express = require('express');
var router = express.Router();
const database = require('../libs/database');

var {con, con2} = database.getMySQLConnections();

router.post('/save-budget', async function(req, res, next) {
    const {id, title, income, expense, balance, rows} = req.body;
    try {
        if (!id) {
            const [result] = await con2.execute(
                'INSERT INTO budgets (title, income, expense, balance) VALUES (?, ?, ?, ?)', 
                [title, income, expense, balance]
            );
            const budgetId = result.insertId;

            for (const row of rows) {
                const [itemResult] = await con2.execute(
                    'INSERT INTO budget_items (budget_id, category, amount) VALUES (?, ?, ?)',
                    [budgetId, row.category, row.amount]
                );
                for (const subItem of (row.subItems || [])) {
                    await con2.execute(
                        'INSERT INTO budget_sub_items (budget_item_id, name, unit, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)',
                        [itemResult.insertId, subItem.name, subItem.unit || null, subItem.quantity, subItem.unitPrice, subItem.totalPrice]
                    );
                }
            }

            res.json({status: "OK", data: "Budget saved successfully."});
        } else {
            await con2.execute(
                'UPDATE budgets SET title = ?, income = ?, expense = ?, balance = ? WHERE id = ?', 
                [title, income, expense, balance, id]
            );
            await con2.execute(
                'DELETE budget_sub_items FROM budget_sub_items INNER JOIN budget_items ON budget_sub_items.budget_item_id = budget_items.id WHERE budget_items.budget_id = ?',
                [id]
            );
            await con2.execute('DELETE FROM budget_items WHERE budget_id = ?', [id]);

            for (const row of rows) {
                const [itemResult] = await con2.execute(
                    'INSERT INTO budget_items (budget_id, category, amount) VALUES (?, ?, ?)',
                    [id, row.category, row.amount]
                );
                for (const subItem of (row.subItems || [])) {
                    await con2.execute(
                        'INSERT INTO budget_sub_items (budget_item_id, name, unit, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)',
                        [itemResult.insertId, subItem.name, subItem.unit || null, subItem.quantity, subItem.unitPrice, subItem.totalPrice]
                    );
                }
            }
            res.json({status: "OK", data: "Budget updated successfully."});
        }
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
            for (const item of items) {
                const [subItems] = await con2.execute(
                    'SELECT id, name, unit, quantity, unit_price AS unitPrice, total_price AS totalPrice FROM budget_sub_items WHERE budget_item_id = ? ORDER BY id',
                    [item.id]
                );
                item.subItems = subItems;
            }
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
        await con2.execute(
            'DELETE budget_sub_items FROM budget_sub_items INNER JOIN budget_items ON budget_sub_items.budget_item_id = budget_items.id WHERE budget_items.budget_id = ?',
            [id]
        );
        await con2.execute('DELETE FROM budget_items WHERE budget_id = ?', [id]);
        await con2.execute('DELETE FROM budgets WHERE id = ?', [id]);
        res.json({status: "OK"});
    } catch (error) {
        console.error(error);
        res.json({status: "NOK", error: "Error deleting budget."});
    }
});

module.exports = router;
