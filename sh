#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up the Node.js To-Do List App..."




# Setup environment file
echo "📄 Creating .env file..."
cat <<EOT > .env
DATABASE_URL=postgresql://web:securepassword@localhost:5432/notes_db
PORT=8080
EOT

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install express pg dotenv ejs body-parser

# Create required directories
mkdir -p views public

# Create index.ejs (Frontend)
echo "📝 Creating views/index.ejs..."
cat <<EOT > views/index.ejs
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>To-Do List</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <div class="container">
        <h1>📝 To-Do List</h1>
        <form action="/add" method="POST">
            <input type="text" name="task" placeholder="Add a new task..." required>
            <button type="submit">Add</button>
        </form>
        <ul>
            <% tasks.forEach(task => { %>
                <li class="<%= task.completed ? 'completed' : '' %>">
                    <%= task.task %>
                    <div>
                        <% if (!task.completed) { %>
                            <a href="/complete/<%= task.id %>">✔</a>
                        <% } %>
                        <a href="/delete/<%= task.id %>">❌</a>
                    </div>
                </li>
            <% }) %>
        </ul>
    </div>
</body>
</html>
EOT

# Create styles.css
echo "🎨 Creating public/styles.css..."
mkdir -p public
cat <<EOT > public/styles.css
body {
    font-family: Arial, sans-serif;
    text-align: center;
    background: #f4f4f4;
    margin: 0;
    padding: 0;
}
.container {
    max-width: 400px;
    margin: 50px auto;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
h1 {
    margin-bottom: 20px;
}
form {
    display: flex;
    gap: 10px;
}
input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}
button {
    padding: 10px;
    border: none;
    background: #28a745;
    color: white;
    cursor: pointer;
    border-radius: 5px;
}
ul {
    list-style: none;
    padding: 0;
}
li {
    background: #eee;
    padding: 10px;
    margin: 5px 0;
    display: flex;
    justify-content: space-between;
    border-radius: 5px;
}
.completed {
    text-decoration: line-through;
    color: gray;
}
a {
    text-decoration: none;
    margin-left: 10px;
}
a[href*="complete"] {
    color: green;
}
a[href*="delete"] {
    color: red;
}
EOT

# Create app.js (Main Server File)
echo "📝 Creating app.js..."
cat <<EOT > app.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// PostgreSQL Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Initialize Database
async function initDB() {
    try {
        const client = await pool.connect();
        await client.query(\`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                task TEXT NOT NULL,
                completed BOOLEAN DEFAULT FALSE
            )
        \`);
        client.release();
        console.log("✅ Database initialized");
    } catch (error) {
        console.error("❌ Error initializing database:", error);
    }
}

// Route: Show All Tasks
app.get('/', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
        res.render('index', { tasks: result.rows });
    } catch (error) {
        res.status(500).send("Error fetching tasks");
    }
});

// Route: Add Task
app.post('/add', async (req, res) => {
    const { task } = req.body;
    if (task) {
        await pool.query("INSERT INTO tasks (task) VALUES ($1)", [task]);
    }
    res.redirect('/');
});

// Route: Mark Task as Completed
app.get('/complete/:id', async (req, res) => {
    await pool.query("UPDATE tasks SET completed = TRUE WHERE id = $1", [req.params.id]);
    res.redirect('/');
});

// Route: Delete Task
app.get('/delete/:id', async (req, res) => {
    await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    res.redirect('/');
});

// Start Server
app.listen(PORT, async () => {
    await initDB();
    console.log(\`🚀 Server running at http://localhost:\${PORT}\`);
});
EOT

# Start the Node.js App
