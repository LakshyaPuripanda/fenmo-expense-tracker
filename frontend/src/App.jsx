import { useEffect, useState } from "react";
import "./App.css";

// Use environment variable for backend URL
const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchExpenses = async () => {
    const res = await fetch(
      `${API}/expenses?category=${filter}&sort=date_desc`
    );
    const data = await res.json();
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const resetForm = () => {
    setAmount("");
    setCategory("Food");
    setDescription("");
    setDate("");
    setEditingId(null);
  };

  const addOrUpdateExpense = async () => {
    if (!amount || !category || !date) {
      alert("Amount, category and date are required");
      return;
    }

    setLoading(true);

    const payload = {
      amount: Number(amount),
      category,
      description,
      date,
      idempotencyKey: crypto.randomUUID(),
    };

    if (editingId) {
      await fetch(`${API}/expenses/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${API}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    fetchExpenses();
    setLoading(false);
  };

  const deleteExpense = async (id) => {
    if (!confirm("Delete this expense?")) return;
    await fetch(`${API}/expenses/${id}`, { method: "DELETE" });
    fetchExpenses();
  };

  const startEdit = (e) => {
    setEditingId(e.id);
    setAmount(e.amount / 100);
    setCategory(e.category);
    setDescription(e.description);
    setDate(e.date);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0) / 100;

  return (
    <div className="container">
      <h1>Fenmo Expense Tracker</h1>

      <div className="card">
        <h3>{editingId ? "Edit Expense" : "Add Expense"}</h3>

        <input
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Others</option>
        </select>

        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <button onClick={addOrUpdateExpense} disabled={loading}>
          {loading ? "Saving..." : editingId ? "Update Expense" : "Add Expense"}
        </button>

        {editingId && (
          <button className="secondary" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </div>

      <div className="summary">
        <h3>Total Spent: ₹{total}</h3>
        <input
          placeholder="Filter by category"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {expenses.length === 0 ? (
        <p className="empty">No expenses yet. Add your first one 👆</p>
      ) : (
        <ul className="list">
          {expenses.map((e) => (
            <li key={e.id} className="item">
              <div>
                <b>₹{e.amount / 100}</b> — {e.category}
                <div className="muted">
                  {e.description || "—"} • {e.date}
                </div>
              </div>

              <div className="actions">
                <button onClick={() => startEdit(e)}>✏️</button>
                <button onClick={() => deleteExpense(e.id)}>🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
