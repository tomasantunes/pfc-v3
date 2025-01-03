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