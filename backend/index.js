const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./data.db");

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

app.post("/expenses", (req, res) => {
  const { amount, category, description, date, idempotencyKey } = req.body;

  if (!amount || !category || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.get(
    "SELECT * FROM expenses WHERE id = ?",
    [idempotencyKey],
    (err, row) => {
      if (row) {
        return res.json(row); // retry-safe
      }

      const expense = {
        id: idempotencyKey || uuidv4(),
        amount: Math.round(amount * 100),
        category,
        description,
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
        () => {
          res.json(expense);
        }
      );
    }
  );
});

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
    res.json(rows);
  });
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
