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
    saldo DECIMAL(17, 2),
    is_expense BOOLEAN DEFAULT 0,
    is_original BOOLEAN DEFAULT 1
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

CREATE TABLE revolut_mov (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    data_inicio DATETIME,
    data_fim DATETIME,
    tipo VARCHAR(256),
    produto VARCHAR(256),
    descricao VARCHAR(256),
    montante DECIMAL(17, 2),
    comissao DECIMAL(17, 2),
    moeda VARCHAR(10),
    estado VARCHAR(50),
    saldo DECIMAL(17, 2),
    is_expense BOOLEAN DEFAULT 0
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
    value DECIMAL(17, 2),
    `return` DECIMAL(17, 2) DEFAULT NULL
);

CREATE TABLE revolut_portfolio_snapshot_headers (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    balance DECIMAL(17,2),
    profit DECIMAL(17,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE revolut_portfolio_snapshot_positions (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    snapshot_id INT(11) NOT NULL,
    name VARCHAR(256),
    price DECIMAL(17,2),
    quantity DECIMAL(17, 5),
    value DECIMAL(17, 2),
    `return` DECIMAL(17, 2) DEFAULT NULL
);

CREATE TABLE t212_account_activity (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    date_mov DATE,
    type VARCHAR(256),
    name VARCHAR(256),
    quantity DECIMAL(17, 5),
    price DECIMAL(17,2),
    value DECIMAL(17,2),
    `return` DECIMAL(17, 2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE revolut_account_activity (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    date_mov DATE,
    type VARCHAR(256),
    name VARCHAR(256),
    quantity DECIMAL(17, 5),
    price DECIMAL(17,2),
    value DECIMAL(17,2),
    `return` DECIMAL(17, 2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

CREATE TABLE coinbase_expenses (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    value DECIMAL(17,2),
    description VARCHAR(256),
    date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    deposit DECIMAL(17, 2) DEFAULT 0,
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
    incomePerWorkHour DECIMAL(17, 2) DEFAULT 0,
    incomePerWorkHour DECIMAL(17, 2) DEFAULT 0,
    incomePerWorkDay DECIMAL(17, 2) DEFAULT 0,
    incomePerWorkDay DECIMAL(17, 2) DEFAULT 0,
    incomePerWorkDay DECIMAL(17, 2) DEFAULT 0,
    benefitsPerYear DECIMAL(17, 2) DEFAULT 0,
    expenseBenefitsPerYear DECIMAL(17, 2) DEFAULT 0,
    foodAssistancePerYear DECIMAL(17, 2) DEFAULT 0,
    technologyBenefitsPerYear DECIMAL(17, 2) DEFAULT 0,
    grossMonthlySalaryPlusBenefits DECIMAL(17, 2) DEFAULT 0,
    grossAnnualSalaryPlusBenefits DECIMAL(17, 2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budgets (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(256),
    income DECIMAL(17,2),
    expense DECIMAL(17,2),
    balance DECIMAL(17,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budget_items (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    budget_id INT(11) NOT NULL,
    category VARCHAR(256),
    amount DECIMAL(17,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE goals (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE savings (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    cash DECIMAL(17,2),
    vouchers DECIMAL(17, 2),
    gift_cards DECIMAL(17, 2),
    savings_accounts_total DECIMAL(17, 2),
    loyalty_balance DECIMAL(17, 2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    qtt INT(11) DEFAULT 1,
    unit_value DECIMAL(17,2) DEFAULT 0,
    total_value DECIMAL(17,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);