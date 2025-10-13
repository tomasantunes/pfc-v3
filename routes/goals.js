var express = require('express');
var router = express.Router();
const database = require('../libs/database');

var {con, con2} = database.getMySQLConnections();

router.get('/load-goals', async function(req, res, next) {
    try {
        const [rows] = await con2.execute('SELECT * FROM goals');
        res.json({status: "OK", data: rows});
    } catch (error) {
        console.error(error);
        res.json({status: "NOK", error: "Error loading goals."});
    }
});

router.post('/add-goal', async function(req, res, next) {
    const { description } = req.body;
    if (!description || description.trim() === "") {
        return res.json({status: "NOK", error: "Goal description cannot be empty."});
    }

    try {
        await con2.execute('INSERT INTO goals (description) VALUES (?)', [description]);
        res.json({status: "OK"});
    } catch (error) {
        console.error(error);
        res.json({status: "NOK", error: "Error adding goal."});
    }
});

router.post('/edit-goal', async function(req, res, next) {
    const { id, description } = req.body;

    if (!id || !description || description.trim() === "") {
        return res.json({status: "NOK", error: "Invalid goal ID or description."});
    }

    try {
        await con2.execute('UPDATE goals SET description = ? WHERE id = ?', [description, id]);
        res.json({status: "OK"});
    } catch (error) {
        console.error(error);
        res.json({status: "NOK", error: "Error editing goal."});
    }
});

router.post('/delete-goal', async function(req, res, next) {
    const { id } = req.body;

    if (!id) {
        return res.json({status: "NOK", error: "Invalid goal ID."});
    }

    try {
        await con2.execute('DELETE FROM goals WHERE id = ?', [id]);
        res.json({status: "OK"});
    } catch (error) {
        console.error(error);
        res.json({status: "NOK", error: "Error deleting goal."});
    }
});

router.post('/edit-goal', async function(req, res, next) {
    const { id, description } = req.body;

    if (!id || !description || description.trim() === "") {
        return res.json({status: "NOK", error: "Invalid goal ID or description."});
    }

    try {
        await con2.execute('UPDATE goals SET description = ? WHERE id = ?', [description, id]);
        res.json({status: "OK"});
    } catch (error) {
        console.error(error);
        res.json({status: "NOK", error: "Error editing goal."});
    }
});

module.exports = router;