// Get the ENV configuration file
require("dotenv").config();

const express = require("express");

// Get the required functions from the validator
const { body, validationResult } = require("express-validator");

// Use BCRYPT for password hashing
const bcrypt = require("bcrypt");

// Use jwt for user sessions
const jwt = require("jsonwebtoken");
const db = require("../db");

// Store the secret there to use later for ease of use
const JWT_SECRET = process.env.JWT_SECRET;

const usersRouter = express.Router();

// Validate the information sent across using the validor middleware
usersRouter.post("/", [
    body("email").isEmail().withMessage("Invalid Email").normalizeEmail(),
    body("password").isLength( { min: 8 } ).withMessage("Must be at least 8 characters long")
], async (req, res) => {

    // Collect the errors
    const errors = validationResult(req);

    // If there are errors send a 400 level back
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() })
    }

    const email = req.body.email; 
    const password = req.body.password;

    // Hash the password using bcrypt npm package
    const hashedPassword = await bcrypt.hash(password, 10);

    // Run the query
    db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword], 
        (err, result) => {

            if(err) {
                console.log(err);
                return res.status(500).send();
            }

            res.status(201).json({
                message: "User Created!",
                userId: result.insertId
            })

        }
    );

});

usersRouter.post("/sign-in", async (req, res) => {

    const email = req.body.email;
    const password = req.body.password; 

    // Find user by email
    db.query("SELECT * FROM users WHERE email=?", [email], async (err, result)=> {

        if(err) {
            return res.status(401).json({ "message" : "Invalid Email or Password" })
        }

        const userData = result[0];

        // Using the bcrypt package to compare the saved password
        const passwordMatch = await bcrypt.compare(password, userData.password);

        // Return an error if there is a mismatched password
        if(!passwordMatch) {
            return res.status(401).json({"message" : "Invalid Email or Password"});
        }

        // Create the JWT token and send it back, last for 4 hours
        const token = jwt.sign( {
            userId: userData.id, 
            email: userData.email 
        }, JWT_SECRET, { expiresIn: "4hr" });

        res.json({ message: "Success!", jwt: token });
    })

})

module.exports = usersRouter;