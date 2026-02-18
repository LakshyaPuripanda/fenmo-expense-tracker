const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

// Root route for Render health check
app.get("/", (req, res) => {
  res.send("Fenmo Expense Tracker Backend is running 🚀");
});

// Use absolute DB path for Render disk
const db = new sqlite3.Database("/opt/render/project/src/backend/data.db");

// Create table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL
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

  db.get("SELECT * FROM expenses WHERE id = ?", [expenseId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "DB lookup failed" });
    }

    if (row) {
      return res.json(row); // retry-safe
    }

    const expense = {
      id: expenseId,
      amount: Math.round(Number(amount) * 100), // store in paise
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
  });
});

// Get Expenses (with filter + sort)
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

// Update Expense
app.put("/expenses/:id", (req, res) => {
  const { id } = req.params;
  const { amount, category, description, date } = req.body;

  if (!amount || !category || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.run(
    "UPDATE expenses SET amount = ?, category = ?, description = ?, date = ? WHERE id = ?",
    [Math.round(Number(amount) * 100), category, description || "", date, id],
    function (err) {
      if (err) return res.status(500).json({ error: "DB update failed" });
      res.json({ updated: this.changes });
    }
  );
});

// Delete Expense
app.delete("/expenses/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM expenses WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "DB delete failed" });
    res.json({ deleted: this.changes });
  });
});

// Dynamic port for Render
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
