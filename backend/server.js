const express = require('express');
const app = express();
app.use(express.json());

// In-Memory Database for OX App
let workers = [
  { id: 1, name: "Ramesh", phone: "9876543210", language: "hi", cash_in_hand: 200.00 },
  { id: 2, name: "Suresh", phone: "9876543211", language: "en", cash_in_hand: 50.00 }
];

let expenses = [];

// 1. Get All Workers & Balances (Boss Dashboard)
app.get('/api/boss/workers', (req, res) => {
  res.json({ status: "success", workers: workers });
});

// 2. Add New Worker (Unlimited Workers)
app.post('/api/boss/add-worker', (req, res) => {
  const { name, phone, language } = req.body;
  const newWorker = {
    id: workers.length + 1,
    name,
    phone,
    language: language || "hi",
    cash_in_hand: 0.00
  };
  workers.push(newWorker);
  res.json({ message: "Worker Added Successfully", worker: newWorker });
});

// 3. Send Fund to Worker (Boss)
app.post('/api/boss/send-fund', (req, res) => {
  const { worker_id, amount } = req.body;
  let worker = workers.find(w => w.id === parseInt(worker_id));
  if (worker) {
    worker.cash_in_hand += parseFloat(amount);
    res.json({ message: "Fund Transferred", new_balance: worker.cash_in_hand });
  } else {
    res.status(404).json({ error: "Worker Not Found" });
  }
});

// 4. Add Expense (Worker - Live Camera or UPI Screenshot)
app.post('/api/worker/add-expense', (req, res) => {
  const { worker_id, amount, payment_mode, proof_type, image_url } = req.body;
  let worker = workers.find(w => w.id === parseInt(worker_id));
  
  if (worker) {
    const newExpense = {
      id: expenses.length + 1,
      worker_id,
      amount: parseFloat(amount),
      payment_mode, // CASH or UPI
      proof_type,   // LIVE_CAMERA or UPI_SCREENSHOT
      image_url,
      timestamp: new Date().toISOString(),
      status: "PENDING"
    };
    expenses.push(newExpense);
    
    // Auto Deduction from Cash in Hand
    worker.cash_in_hand -= parseFloat(amount);
    
    res.json({ message: "Expense Submitted for Approval", remaining_cash: worker.cash_in_hand });
  } else {
    res.status(404).json({ error: "Worker Not Found" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`OX App Backend running on port ${PORT}`));
