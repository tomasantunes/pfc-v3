CREATE TABLE logins (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    is_valid BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bpi_mov (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    data_mov DATE,
    data_valor DATE,
    desc_mov VARCHAR(256),
    valor DECIMAL(17, 2),
    saldo DECIMAL(17, 2)
);

CREATE TABLE santander_mov (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    data_mov DATE,
    data_valor DATE,
    desc_mov VARCHAR(256),
    valor DECIMAL(17, 2),
    saldo DECIMAL(17, 2),
    is_expense BOOLEAN DEFAULT 0,
    is_original BOOLEAN DEFAULT 1
);

CREATE TABLE paypal_mov (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(256),
    value DECIMAL(17,2),
    date_mov DATE
);

CREATE TABLE t212_portfolio_snapshot_headers (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    balance DECIMAL(17,2),
    profit DECIMAL(17,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t212_portfolio_snapshot_positions (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    snapshot_id INT(11) NOT NULL,
    name VARCHAR(256),
    price DECIMAL(17,2),
    quantity DECIMAL(17, 5),
    balance DECIMAL(17, 2)
);

CREATE TABLE coinbase_portfolio_snapshot_headers (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    balance DECIMAL(17,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coinbase_portfolio_snapshot_assets (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    snapshot_id INT(11) NOT NULL,
    name VARCHAR(256),
    deposit DECIMAL(17, 2),
    quantity DECIMAL(17, 10),
    value DECIMAL(17, 2)
);

CREATE TABLE binance_portfolio_snapshot_headers (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    balance DECIMAL(17,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE binance_portfolio_snapshot_assets (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    snapshot_id INT(11) NOT NULL,
    name VARCHAR(256),
    deposit DECIMAL(17, 2),
    quantity DECIMAL(17, 10),
    value DECIMAL(17, 2)
);

CREATE TABLE polymarket_portfolio_snapshot (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    balance DECIMAL(17,2),
    profit DECIMAL(17,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE santander (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    balance DECIMAL(17,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estimated_data (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    incomePerHour DECIMAL(17, 2) NOT NULL,
    incomePerDay DECIMAL(17, 2) NOT NULL,
    incomePerWeek DECIMAL(17, 2) NOT NULL,
    incomePerMonth DECIMAL(17, 2) NOT NULL,
    incomePerYear DECIMAL(17, 2) NOT NULL,
    netSalaryPerMonth DECIMAL(17, 2) NOT NULL,
    netSalaryPerYear DECIMAL(17, 2) NOT NULL,
    grossSalaryPerMonth DECIMAL(17, 2) NOT NULL,
    grossSalaryPerYear DECIMAL(17, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bpi_mov ADD COLUMN is_expense BOOLEAN DEFAULT 0;
ALTER TABLE polymarket_portfolio_snapshot ADD COLUMN deposit DECIMAL(17, 2) DEFAULT 0;
ALTER TABLE t212_portfolio_snapshot_positions RENAME COLUMN balance TO value;
ALTER TABLE t212_portfolio_snapshot_positions ADD COLUMN `return` DECIMAL(17, 2) DEFAULT NULL;
ALTER TABLE bpi_mov ADD COLUMN is_original BOOLEAN DEFAULT 1;