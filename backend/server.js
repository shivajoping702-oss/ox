const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Multi-Worker State
let workers = {
  1: { id: 1, name: "Ramesh", cash_in_hand: 200.00 }
};

let expenses = [];

// Boss API: Fetch Workers & Expenses History
app.get('/api/boss/dashboard', (req, res) => {
  res.json({
    workers: Object.values(workers),
    expenses: expenses
  });
});

// Boss API: Reset or Add Cash to Worker
app.post('/api/boss/update-cash', (req, res) => {
  const { worker_id, cash_amount } = req.body;
  if (workers[worker_id]) {
    workers[worker_id].cash_in_hand = parseFloat(cash_amount) || 0;
    return res.json({ success: true, worker: workers[worker_id] });
  }
  res.status(404).json({ error: "Worker not found" });
});

// Worker API: Submit Expense with Proof
app.post('/api/worker/add-expense', (req, res) => {
  const { worker_id, amount, payment_mode, proof_type, image_url } = req.body;
  const numericAmount = parseFloat(amount);

  if (!numericAmount || isNaN(numericAmount)) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const worker = workers[worker_id] || { id: worker_id, name: "Worker " + worker_id, cash_in_hand: 0 };
  
  if (payment_mode === "CASH") {
    worker.cash_in_hand -= numericAmount;
  }

  const newExpense = {
    id: expenses.length + 1,
    worker_id: worker.id,
    worker_name: worker.name,
    amount: numericAmount,
    payment_mode,
    proof_type,
    image_url,
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  };

  expenses.unshift(newExpense);
  workers[worker_id] = worker;

  res.json({
    message: "Expense saved successfully",
    remaining_cash: worker.cash_in_hand,
    expense: newExpense
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OX Server running on port ${PORT}`));