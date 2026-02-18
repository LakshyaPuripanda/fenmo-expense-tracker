const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

// Root route for Render health check
app.get("/", (req, res) => {
  res.send("Fenmo Expense Tracker Backend is running ");
});

// Use absolute DB path so Render disk works properly
const db = new sqlite3.Database("/opt/render/project/src/backend/data.db");

// Create table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount INTEGER,
      category TEXT,
      description TEXT,
      date TEXT,
      created_at TEXT
    )
  `);
});

// Add Expense (Idempotent)
app.post("/expenses", (req, res) => {
  const { amount, category, description, date, idempotencyKey } = req.body;

  if (!amount || !category || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const expenseId = idempotencyKey || uuidv4();

  db.get(
    "SELECT * FROM expenses WHERE id = ?",
    [expenseId],
    (err, row) => {
      if (row) {
        return res.json(row); // retry-safe
      }

      const expense = {
        id: expenseId,
        amount: Math.round(amount * 100), // store in paise
        category,
        description: description || "",
        date,
        created_at: new Date().toISOString(),
      };

      db.run(
        "INSERT INTO expenses VALUES (?, ?, ?, ?, ?, ?)",
        [
          expense.id,
          expense.amount,
          expense.category,
          expense.description,
          expense.date,
          expense.created_at,
        ],
        (err) => {
          if (err) {
            return res.status(500).json({ error: "DB insert failed" });
          }
          res.json(expense);
        }
      );
    }
  );
});

// Get Expenses with filter & sort
app.get("/expenses", (req, res) => {
  const { category, sort } = req.query;

  let query = "SELECT * FROM expenses";
  const params = [];

  if (category) {
    query += " WHERE category = ?";
    params.push(category);
  }

  if (sort === "date_desc") {
    query += " ORDER BY date DESC";
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "DB fetch failed" });
    }
    res.json(rows);
  });
});

// Dynamic port for Render
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
