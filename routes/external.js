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

    for (var i = 0; i < inventory.length; i++) {
        if (!inventory[i].item_name || !inventory[i].description) {
            return res.json({status: "NOK", error: "Error importing inventory."});
        }
    }

    var connection;
    try {
        connection = await con2.getConnection();
        await connection.beginTransaction();

        for (var i = 0; i < inventory.length; i++) {
            var item = inventory[i];

            const [rows] = await connection.execute('SELECT id FROM inventory WHERE item_name = ?', [item.item_name]);
            if (rows.length > 0) {
                // Update existing item
                await connection.execute(
                    'UPDATE inventory SET description = ?, qtt = ? WHERE item_name = ?',
                    [item.description, item.qtt, item.item_name]
                );
            }
            else {
                // Insert new item
                await connection.execute(
                    'INSERT INTO inventory (item_name, description, qtt) VALUES (?, ?, ?)',
                    [item.item_name, item.description, item.qtt]
                );
            }
        }

        var importedItemNames = [...new Set(inventory.map(function(item) {
            return item.item_name;
        }))];

        if (importedItemNames.length === 0) {
            await connection.execute('DELETE FROM inventory');
        }
        else {
            var placeholders = importedItemNames.map(function() {
                return '?';
            }).join(', ');
            await connection.execute(
                'DELETE FROM inventory WHERE item_name NOT IN (' + placeholders + ')',
                importedItemNames
            );
        }

        await connection.commit();
        res.json({status: "OK", data: "Inventory imported successfully."});
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Error importing inventory:", error);
        return res.json({status: "NOK", error: "An error occurred while importing inventory."});
    }
    finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
