const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let workers = {
  1: { id: 1, name: "Ramesh", cash_in_hand: 200.00 }
};

let expenses = [];

app.get('/api/boss/dashboard', (req, res) => {
  res.json({
    workers: Object.values(workers),
    expenses: expenses
  });
});

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));