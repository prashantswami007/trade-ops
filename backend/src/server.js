const express = require("express");
const cors = require("cors");
const multer = require("multer");
const xml2js = require("xml2js");
const { Pool } = require("pg");
const fs = require("fs").promises;
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure PostgreSQL connection (Neon DB)
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://trade-ops.onrender.com' // Add your actual frontend URL
  ],
  credentials: true
}));
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });
// Utility: Calculate T+2 Settlement Date (skip weekends)
function calculateSettlementDate(tradeDate) {
  const date = new Date(tradeDate);
  let businessDaysAdded = 0;

  while (businessDaysAdded < 2) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    // Skip Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysAdded++;
    }
  }

  return date.toISOString().split("T")[0]; // Return YYYY-MM-DD format
}

// Utility: Calculate Commission (0.5% of total value)
function calculateCommission(totalValue) {
  return (parseFloat(totalValue) * 0.005).toFixed(2);
}

// API Route: Upload and Process Trades
app.post("/api/upload-trades", upload.single("trades"), async (req, res) => {
  let client;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read and parse XML file
    const xmlData = await fs.readFile(req.file.path, "utf-8");
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    const orders = result.trades?.order || [];
    if (!orders.length) {
      return res.status(400).json({ error: "No trade orders found in XML" });
    }

    client = await pool.connect();
    let processedCount = 0;
    let failedCount = 0;

    for (const order of orders) {
      const clientId = parseInt(order.client_id[0]);
      const stockSymbol = order.stock_symbol[0];
      const type = order.type[0].toUpperCase();
      const quantity = parseInt(order.quantity[0]);
      const price = parseFloat(order.price[0]);
      const tradeDate = order.trade_date[0];

      const totalValue = (price * quantity).toFixed(2);
      const commission = calculateCommission(totalValue);
      const settlementDate = calculateSettlementDate(tradeDate);

      let status = "SETTLED";
      let failureReason = null;

      try {
        await client.query("BEGIN");

        // Check if client exists
        const clientCheck = await client.query(
          "SELECT cash_balance FROM clients WHERE id = $1",
          [clientId]
        );

        if (clientCheck.rows.length === 0) {
          status = "FAILED";
          failureReason = "Client does not exist";
        } else if (type === "BUY") {
          const cashBalance = parseFloat(clientCheck.rows[0].cash_balance);
          const totalCost = parseFloat(totalValue) + parseFloat(commission);

          if (cashBalance < totalCost) {
            status = "FAILED";
            failureReason = "Insufficient funds";
            failedCount++;
          } else {
            // Deduct cash from client
            await client.query(
              "UPDATE clients SET cash_balance = cash_balance - $1 WHERE id = $2",
              [totalCost, clientId]
            );

            // Update holdings (upsert)
            await client.query(
              `INSERT INTO holdings (client_id, stock_symbol, quantity)
               VALUES ($1, $2, $3)
               ON CONFLICT (client_id, stock_symbol)
               DO UPDATE SET quantity = holdings.quantity + $3, updated_at = CURRENT_TIMESTAMP`,
              [clientId, stockSymbol, quantity]
            );

            processedCount++;
          }
        } else if (type === "SELL") {
          // Check if client has enough holdings
          const holdingCheck = await client.query(
            "SELECT quantity FROM holdings WHERE client_id = $1 AND stock_symbol = $2",
            [clientId, stockSymbol]
          );

          if (
            holdingCheck.rows.length === 0 ||
            holdingCheck.rows[0].quantity < quantity
          ) {
            status = "FAILED";
            failureReason = "Insufficient holdings";
            failedCount++;
          } else {
            // Add cash to client
            const totalCredit = parseFloat(totalValue) - parseFloat(commission);
            await client.query(
              "UPDATE clients SET cash_balance = cash_balance + $1 WHERE id = $2",
              [totalCredit, clientId]
            );

            // Update holdings
            await client.query(
              `UPDATE holdings SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP
               WHERE client_id = $2 AND stock_symbol = $3`,
              [quantity, clientId, stockSymbol]
            );

            processedCount++;
          }
        }

        // Insert trade record
        await client.query(
          `INSERT INTO trades (client_id, stock_symbol, type, quantity, price, total_value,
           commission, trade_date, settlement_date, status, failure_reason)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            clientId,
            stockSymbol,
            type,
            quantity,
            price,
            totalValue,
            commission,
            tradeDate,
            settlementDate,
            status,
            failureReason,
          ]
        );

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("Trade processing error:", err);
        status = "FAILED";
        failureReason = "Processing error";
        failedCount++;
      }
    }

    res.json({
      success: true,
      message: `Processed ${orders.length} trade orders. ${processedCount} settled, ${failedCount} failed.`,
      processed: processedCount,
      failed: failedCount,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to process trades: " + err.message });
  } finally {
    if (client) client.release();
  }
});

// API Route: Get All Trades
app.get("/api/trades", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, c.name as client_name
       FROM trades t
       JOIN clients c ON t.client_id = c.id
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch trades error:", err);
    res.status(500).json({ error: "Failed to fetch trades" });
  }
});

// API Route: Get Dashboard Stats
app.get("/api/dashboard-stats", async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN status = 'SETTLED' THEN total_value ELSE 0 END), 0) as total_volume_settled,
        COALESCE(SUM(CASE WHEN status = 'SETTLED' THEN commission ELSE 0 END), 0) as total_commissions_earned,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_trade_count
       FROM trades`
    );
    res.json(stats.rows[0]);
  } catch (err) {
    console.error("Fetch stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(
    `🚀 TradeOps Settlement Engine running on http://localhost:${PORT}`
  );
});
