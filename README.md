# Fenmo Expense Tracker

Fenmo Expense Tracker is a full-stack web application designed to help users track, manage, and analyze their daily expenses in a simple and intuitive way. The app allows users to add, edit, delete, and filter expenses by category and date, with all data stored persistently in a database.

The frontend is built using React with a clean and responsive UI, while the backend is powered by Node.js and Express, using SQLite for lightweight persistent storage. The application follows production-ready practices such as RESTful APIs, idempotent writes for safe retries, proper CORS handling, and environment-based configuration.

The complete application is deployed on , making it accessible as a live, hosted product.

---

##  Features
- Add, edit, and delete expenses  
- Filter expenses by category  
- Sort expenses by date  
- Persistent storage using SQLite  
- Idempotent API requests for safe retries  
- Responsive and user-friendly UI  
- Fully deployed backend and frontend  

---

##  Tech Stack
**Frontend:** React, CSS  
**Backend:** Node.js, Express  
**Database:** SQLite  

---

## ⚙️ Project Structure

/frontend
└── src
├── App.jsx
├── main.jsx
├── App.css
└── index.css

/backend
└── index.js
└── data.db

## 🔗 Live Demo

Frontend URL: https://fenmo-expense-tracker-1.onrender.com
Backend API: https://fenmo-expense-tracker-1hho.onrender.com

---

##  Features

- Add expenses with amount, category, description, and date
- Edit and delete existing expenses
- Filter expenses by category
- View total spending
- Persistent storage using SQLite
- Idempotent API writes (safe retries)
- Deployed backend and frontend
- Clean, responsive UI

---

##  Tech Stack

**Frontend**
- React (Vite)
- CSS

**Backend**
- Node.js
- Express
- SQLite

**Deployment**
- Backend: Render
- Frontend: Render

---

##  API Endpoints

- `GET /expenses` – Fetch all expenses (supports category filter & sorting)
- `POST /expenses` – Add a new expense (idempotent)
- `PUT /expenses/:id` – Update an expense
- `DELETE /expenses/:id` – Delete an expense

---

##  Run Locally

### Backend

```bash
cd backend
npm install
npm start

```
### Backend runs on : http://localhost:4000

### Frontend : cd frontend
npm install
npm run dev

### Frontend runs on : http://localhost:5173

