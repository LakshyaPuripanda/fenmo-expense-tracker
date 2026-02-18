import { useEffect, useState } from "react";

const API = "https://fenmo-expense-tracker-1hho.onrender.com/api";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchExpenses = async () => {
    try {
      const res = await fetch(
        `${API}/expenses?category=${filter}&sort=date_desc`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load expenses");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const addExpense = async () => {
    if (!amount || !category || !date) {
      alert("Amount, category and date are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          category,
          description,
          date,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save expense");
      }

      setAmount("");
      setCategory("");
      setDescription("");
      setDate("");
      await fetchExpenses();
    } catch (e) {
      console.error(e);
      setError("Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1>Expense Tracker</h1>

      <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={addExpense} disabled={loading}>
          {loading ? "Saving..." : "Add Expense"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr />

      <input
        placeholder="Filter by category"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <h3>Total: ₹{total}</h3>

      <ul>
        {expenses.map((e) => (
          <li key={e._id || e.id}>
            ₹{e.amount} – {e.category} – {e.description || "—"} – {e.date}
          </li>
        ))}
      </ul>
    </div>
  );
}
