const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// --- HABITS API ---

// Get all habits
app.get('/api/habits', (req, res) => {
  db.all('SELECT * FROM habits', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Convert SQLite 0/1 back to boolean for React
    const habits = rows.map(r => ({ ...r, completed: !!r.completed }));
    res.json(habits);
  });
});

// Add a habit
app.post('/api/habits', (req, res) => {
  const { name, category } = req.body;
  db.run('INSERT INTO habits (name, category, completed) VALUES (?, ?, 0)', [name, category], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, category, completed: false });
  });
});

// Toggle habit completion
app.put('/api/habits/:id/toggle', (req, res) => {
  const { id } = req.params;
  // First get current status
  db.get('SELECT completed FROM habits WHERE id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Not found' });
    const newStatus = row.completed ? 0 : 1;
    db.run('UPDATE habits SET completed = ? WHERE id = ?', [newStatus, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, completed: !!newStatus });
    });
  });
});

// Delete a habit
app.delete('/api/habits/:id', (req, res) => {
  db.run('DELETE FROM habits WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- TASKS API (Matrix & Kanban) ---

// Get all tasks
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add task
app.post('/api/tasks', (req, res) => {
  const { content, quadrant } = req.body;
  db.run('INSERT INTO tasks (content, quadrant, status) VALUES (?, ?, "todo")', [content, quadrant], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, content, quadrant, status: 'todo' });
  });
});

// Update task quadrant (Drag and drop)
app.put('/api/tasks/:id', (req, res) => {
  const { quadrant } = req.body;
  db.run('UPDATE tasks SET quadrant = ? WHERE id = ?', [quadrant, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
