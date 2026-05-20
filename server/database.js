const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database file (or open if it exists)
const dbPath = path.resolve(__dirname, 'habitflow.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Initialize schema
    db.serialize(() => {
      // Habits Table
      db.run(`CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0
      )`);

      // Tasks Table (For Eisenhower Matrix & Kanban)
      db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        quadrant TEXT NOT NULL,
        status TEXT DEFAULT 'todo'
      )`);

      // Insert some default data if empty
      db.get('SELECT COUNT(*) as count FROM habits', (err, row) => {
        if (row && row.count === 0) {
          const insertHabit = db.prepare('INSERT INTO habits (name, category, completed) VALUES (?, ?, ?)');
          insertHabit.run('Morning Workout', '🏋️ Fitness', 0);
          insertHabit.run('Read 10 Pages', '📚 Study', 0);
          insertHabit.run('Drink 2L Water', '💧 Health', 0);
          insertHabit.finalize();
          console.log('Inserted default habits.');
        }
      });
      
      db.get('SELECT COUNT(*) as count FROM tasks', (err, row) => {
        if (row && row.count === 0) {
          const insertTask = db.prepare('INSERT INTO tasks (content, quadrant, status) VALUES (?, ?, ?)');
          insertTask.run('Finish HCI essay draft', 'urgent-important', 'todo');
          insertTask.run('Review algorithms chapter', 'important-not-urgent', 'in-progress');
          insertTask.finalize();
          console.log('Inserted default tasks.');
        }
      });
    });
  }
});

module.exports = db;
