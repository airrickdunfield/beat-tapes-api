const jwt = require('jsonwebtoken');

// Secret key for JWT (store securely in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || '👁️👁️';

// Middleware to verify JWT
function authenticateToken(req, res, next) {
    
    const authHeader = req.headers['authorization'];

    // Check if the Authorization header exists and starts with "Bearer"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, user) => {

        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        // Attach the decoded token payload to the request object
        req.user = user;
        next();
    });

}

module.exports = authenticateToken;