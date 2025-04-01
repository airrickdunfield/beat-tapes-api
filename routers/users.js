const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db'); // Assuming you have a database connection file

const usersRouter = express.Router();

// Secret key for JWT (store this securely in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Sign-up route
usersRouter.post('/', [
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const password = req.body.password;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const [result] = await db.promise().query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });

}
);

// Login route
usersRouter.post('/sign-in', [
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const password = req.body.password;

    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });

});

module.exports = usersRouter;