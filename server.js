const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/habits', async (req, res) => {
  try {
    const habits = await db.all('SELECT * FROM habits ORDER BY id DESC');
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/habits', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const result = await db.run('INSERT INTO habits (name, created_at) VALUES (?, datetime("now"))', [name]);
    const habit = await db.get('SELECT * FROM habits WHERE id = ?', [result.lastID]);
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/habits/:id/checkin', async (req, res) => {
  try {
    const id = req.params.id;
    await db.run('INSERT INTO checkins (habit_id, created_at) VALUES (?, datetime("now"))', [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const row = await db.get('SELECT COUNT(*) as count FROM checkins WHERE habit_id = ?', [id]);
    res.json({ count: row.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
