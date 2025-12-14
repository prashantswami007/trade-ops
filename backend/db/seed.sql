-- Insert dummy clients with realistic balances
INSERT INTO clients (name, cash_balance, currency) VALUES
('Acme Corporation', 10000.00, 'USD'),
('Global Investments LLC', 25000.00, 'USD'),
('Tech Ventures Ltd', 18000.00, 'USD'),
('Blue Horizon Capital', 50000.00, 'USD'),
('Orion Wealth Partners', 75000.00, 'USD'),
('Vertex Financials', 32000.00, 'USD'),
('Nova Growth Fund', 42000.00, 'USD'),
('Apex Holdings', 15000.00, 'USD'),
('Pioneer Traders', 28000.00, 'USD'),
('Summit Equity Group', 60000.00, 'USD');


-- Insert initial stock holdings
INSERT INTO holdings (client_id, stock_symbol, quantity) VALUES
(1, 'AAPL', 50),
(1, 'TSLA', 20),

(2, 'GOOGL', 30),
(2, 'AMZN', 15),

(3, 'MSFT', 40),
(3, 'NVDA', 25),

(4, 'META', 60),
(4, 'AAPL', 100),

(5, 'BRK.B', 10),
(5, 'JPM', 80),

(6, 'NFLX', 35),
(6, 'AMD', 70),

(7, 'TSLA', 120),
(7, 'NVDA', 50),

(8, 'INTC', 90),
(8, 'ORCL', 45),

(9, 'IBM', 55),
(9, 'CSCO', 75),

(10, 'AAPL', 200),
(10, 'MSFT', 150);
