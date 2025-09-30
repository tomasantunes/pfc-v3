var express = require('express');
var router = express.Router();
var {getMySQLConnections} = require('../libs/database');
var secretConfig = require('../secret-config');

var {con2} = getMySQLConnections();

router.post('/external/upsert-inventory', async function(req, res) {
    if (req.body.api_key !== secretConfig.EXTERNAL_API_KEY) {
        return res.json({status: "NOK", error: "Invalid Authorization."});
    }

    var inventory = req.body.inventory;
    if (!inventory || !Array.isArray(inventory)) {
        return res.json({status: "NOK", error: "Invalid inventory data."});
    }

    try {
        for (var i in inventory) {
            var item = inventory[i];
            if (!item.item_name || !item.description) {
                return res.json({status: "NOK", error: "Item name and description are required."});
            }

            const [rows] = await con2.execute('SELECT id FROM inventory WHERE item_name = ?', [item.item_name]);
            if (rows.length > 0) {
                // Update existing item
                await con2.execute(
                    'UPDATE inventory SET description = ? WHERE item_name = ?',
                    [item.description, item.item_name]
                );
            }
            else {
                // Insert new item
                await con2.execute(
                    'INSERT INTO inventory (item_name, description) VALUES (?, ?)',
                    [item.item_name, item.description]
                );
            }
            res.json({status: "OK", data: "Inventory imported successfully."});
        }
    } catch (error) {
        console.error("Error processing inventory:", error);
        return res.json({status: "NOK", error: "An error occurred while importing inventory."});
    }
});

module.exports = router;