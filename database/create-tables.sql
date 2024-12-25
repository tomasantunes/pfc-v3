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