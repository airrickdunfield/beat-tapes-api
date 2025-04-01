const express = require('express');
const db = require('../db');

const artistsRouter = express.Router();

artistsRouter.get('/', (req, res) => {

  const sql = `SELECT * FROM artists`;

  db.query(sql, (err, results) => {

    if (err) {
      console.error(err);
      res.status(500).send('An error occurred');
    }

    res.json(results);

  });
});

// Handle POST requests to add a new artist
artistsRouter.post('/', (req, res) => {
  // Get the new artist name from the request body
  const { new_artist } = req.body;

  // Create the SQL query to insert the new artist
  const addArtistSQL = `INSERT INTO artists (name) VALUES (?)`;

  // Execute the SQL query, but subsistute the '?' with the new artist name
  db.query(addArtistSQL, [new_artist], (err, results) => {

    // If an error occurred, log it and return a 500 status code
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred');
    }
    // If the query was successful, return a JSON response with the new artist ID to be used later
    res.json({ message: 'Artist added successfully', artistId: results.insertId });
  });
});

module.exports = artistsRouter;