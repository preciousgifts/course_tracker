const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT,
        status TEXT DEFAULT 'Upcoming',
        progress INTEGER DEFAULT 0
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS deadlines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER,
        title TEXT NOT NULL,
        due_date TEXT NOT NULL,
        description TEXT,
        FOREIGN KEY (course_id) REFERENCES courses (id)
      )
    `);
  }
});

// API Endpoints

// Get all courses (with optional status filter)
app.get('/api/courses', (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM courses';
  if (status && status !== 'all') {
    query += ` WHERE status = '${status}'`;
  }
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add a new course
app.post('/api/courses', (req, res) => {
  const { name, description, start_date, end_date } = req.body;
  const query = `INSERT INTO courses (name, description, start_date, end_date) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, description, start_date, end_date], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: 'Course added successfully!' });
  });
});

// Update a course
app.put('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, start_date, end_date, status, progress } = req.body;
  const query = `
    UPDATE courses
    SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, progress = ?
    WHERE id = ?
  `;
  db.run(query, [name, description, start_date, end_date, status, progress, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Course updated successfully!' });
  });
});

// Delete a course
app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM courses WHERE id = ?';
  db.run(query, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Course deleted successfully!' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});