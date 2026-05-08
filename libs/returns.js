const database = require('./database');

var {con, con2} = database.getMySQLConnections();

function getT212BalancePercentage(cb) {
  var sql = `
    SELECT
        ROUND(
            (
                (
                    SUM(CASE WHEN type = 'sell' THEN value ELSE 0 END)
                    +
                    SUM(COALESCE(\`return\`, 0))
                )
                -
                SUM(CASE WHEN type = 'buy' THEN value ELSE 0 END)
            )
            /
            NULLIF(SUM(CASE WHEN type = 'buy' THEN value ELSE 0 END), 0)
            * 100,
            2
        ) AS balance_percentage
    FROM t212_account_activity
    WHERE YEAR(date_mov) = YEAR(CURDATE());
  `;

  con.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      cb(false);
    }
    console.log(result);
    cb(result[0].balance_percentage);
  });
}

module.exports = {
  getT212BalancePercentage,
  default: {
    getT212BalancePercentage
  }
}