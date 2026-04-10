const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'blinkit_db'
});

db.connect((err) => {
    if (err) {
        console.error('('.') Database connection fail:', err);
        return;
    }
    console.log(' MySQL Connected (blinkit_db)!');
});

// 1. Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 2. Products API (for 100+ data comes
app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM products";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3. Register API
app.post('/register', (req, res) => {
    const { name, email, mobile, address, password } = req.body;
    const sql = "INSERT INTO users (name, email, mobile, address, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
    
    db.query(sql, [name, email, mobile, address, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, error: "Bhai, ye Email pehle se register hai!" });
            }
            return res.status(500).json({ success: false, error: err.message });
        }
        res.status(200).json({ success: true, message: "Registration Successful" });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Blinkit Clone Live: http://localhost:${PORT}`);
});
