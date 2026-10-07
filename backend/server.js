const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const SUPABASE_URL = 'https://hkuzuyauyhadjxfjxgki.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jhfPTNFHfQjcqmevo95xEA_b06jFeH1';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Boss API: Fetch All Workers & All Expenses (Permanent Database)
app.get('/api/boss/dashboard', async (req, res) => {
  try {
    const { data: workers, error: wErr } = await supabase.from('workers').select('*');
    const { data: expenses, error: eErr } = await supabase.from('expenses').select('*').order('id', { ascending: false });

    if (wErr || eErr) throw wErr || eErr;

    res.json({ workers: workers || [], expenses: expenses || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Worker API: Submit Expense (Saves to Permanent Supabase Database)
app.post('/api/worker/add-expense', async (req, res) => {
  const { worker_id, amount, payment_mode, proof_type, image_url } = req.body;
  const numericAmount = parseFloat(amount);

  if (!numericAmount || isNaN(numericAmount)) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    // 1. Get current worker cash
    const { data: worker, error: fetchErr } = await supabase
      .from('workers')
      .select('*')
      .eq('id', worker_id)
      .single();

    let newCash = worker ? parseFloat(worker.cash_in_hand) : 0;
    let workerName = worker ? worker.name : "Worker " + worker_id;

    if (payment_mode === "CASH") {
      newCash -= numericAmount;
      await supabase.from('workers').update({ cash_in_hand: newCash }).eq('id', worker_id);
    }

    // 2. Insert expense record
    const { data: newExpense, error: expErr } = await supabase
      .from('expenses')
      .insert([{
        worker_id,
        worker_name: workerName,
        amount: numericAmount,
        payment_mode,
        proof_type,
        image_url
      }])
      .select()
      .single();

    if (expErr) throw expErr;

    res.json({
      message: "Expense saved permanently!",
      remaining_cash: newCash,
      expense: newExpense
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OX Supabase Backend running on port ${PORT}`));