const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL connection setup
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Serve static files (CSS, JS, Images)
app.use('/css', express.static(path.join(__dirname, '../Front-End/CSS')));
app.use('/js', express.static(path.join(__dirname, '../Front-End/JS')));
app.use('/images', express.static(path.join(__dirname, '../Front-End/Images')));

// Routes for different pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Front-End/HTML/index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../Front-End/HTML/signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../Front-End/HTML/login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../Front-End/HTML/dashboard.html'));
});

app.get('/expense-list', (req, res) => {
    res.sendFile(path.join(__dirname, '../Front-End/HTML/expense-list.html'));
});

// Register new user
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        await db.execute(query, [name, email, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('Error inserting user:', err);
        res.status(500).json({ error: 'Error saving user' });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [results] = await db.execute(query, [email]);
        if (results.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        res.status(200).json({ message: 'Login successful', name: user.name });
    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).json({ error: 'Error logging in user' });
    }
});
let transactions = [];

// Endpoint to get all transactions
app.get('/api/transactions', (req, res) => {
    res.json(transactions);
});

// Endpoint to add a new transaction
app.post('/api/transactions', (req, res) => {
    const { type, category, name, description, amount, date } = req.body;
    const newTransaction = { type, category, name, description, amount, date, id: Date.now() };
    transactions.push(newTransaction);
    res.status(201).json(newTransaction);
});


// Add new expense
app.post('/api/add-expense', async (req, res) => {
    const { description, amount, category, date } = req.body;
    console.log('Incoming data:', req.body); // Log request data
    try {
        const query = 'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)';
        await db.execute(query, [description, amount, category, date]);
        res.status(201).json({ message: 'Expense added successfully' });
    } catch (err) {
        console.error('Error inserting expense:', err);
        res.status(500).json({ error: 'Error saving expense' });
    }
});


// Retrieve all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const query = 'SELECT * FROM expenses';
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error retrieving expenses:', err);
        res.status(500).json({ error: 'Error retrieving expenses' });
    }
});

// Edit existing expense
app.put('/api/edit-expense/:id', async (req, res) => {
    const { id } = req.params;
    const { description, amount, category, date } = req.body;
    try {
        const query = 'UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?';
        await db.execute(query, [description, amount, category, date, id]);
        res.status(200).json({ message: 'Expense updated successfully' });
    } catch (err) {
        console.error('Error updating expense:', err);
        res.status(500).json({ error: 'Error updating expense' });
    }
});

// Delete expense
app.delete('/api/delete-expense/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM expenses WHERE id = ?';
        await db.execute(query, [id]);
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).json({ error: 'Error deleting expense' });
    }
});
// API to add a transaction
app.post('/api/transactions', (req, res) => {
    const transaction = req.body;
    const sql = 'INSERT INTO transactions SET ?';
    db.query(sql, transaction, (err, result) => {
        if (err) throw err;
        res.send({ id: result.insertId, ...transaction });
    });
});

// API to get all transactions
app.get('/api/transactions', (req, res) => {
    const sql = 'SELECT * FROM transactions';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

// API to delete a transaction
app.delete('/api/transactions/:id', (req, res) => {
    const sql = 'DELETE FROM transactions WHERE id = ?';
    db.query(sql, req.params.id, (err, result) => {
        if (err) throw err;
        res.send({ deletedId: req.params.id });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
