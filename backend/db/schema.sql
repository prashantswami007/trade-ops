-- Drop existing tables if they exist
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS holdings CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Create Clients Table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    cash_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Holdings Table
CREATE TABLE holdings (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    stock_symbol TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, stock_symbol)
);

-- Create Trades Table
CREATE TABLE trades (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    stock_symbol TEXT NOT NULL,
    type VARCHAR(4) NOT NULL CHECK (type IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    total_value DECIMAL(15, 2) NOT NULL,
    commission DECIMAL(15, 2) NOT NULL,
    trade_date DATE NOT NULL,
    settlement_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('SETTLED', 'FAILED')),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_trades_client_id ON trades(client_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_holdings_client_id ON holdings(client_id);
