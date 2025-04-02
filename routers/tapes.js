// Import the .env file variables
require('dotenv').config();

const express = require('express');
const db = require('../db.local');
const upload = require('../storage');
// Import the authentication file
const authenticateToken = require("../auth.jwt");

const tapesRouter = express.Router();

// Use the auth protection on all routers
tapesRouter.use(authenticateToken);

// Get all tapes from the database
tapesRouter.get('/', (req, res) => {

  // Pull the artist from the query Example: /tapes?artists=1
  const artists = req.query.artists;

  // user property is attached in "../auth.jwt.js"
  const user_id = req.user.userId;

  // This is the basic query using a JOIN for an album
  let sql = `
    SELECT albums.*, artists.name AS artist, artists.id AS artist_id
    FROM albums
    JOIN artists ON albums.artist_id = artists.id WHERE `;

  // Here we are using a queryParam array because we conditionally push to it depending on if there is the artist param or not
  const queryParams = [];

  // Check if the query param exists
  if(artists) {

    // If it does, pass it in here
    sql += `artists.id IN (?) AND `;

    // If it's an array, add each as a item to query parms
    if(Array.isArray(artists)) {
      queryParams.push(...artists);

    // If it's just number, just add it to the array
    } else {
      queryParams.push(artists);
    }
  

  }
  // Add the logged in user to the SQL query
  sql += `albums.user_id = ?`;
  
  // Push the value on to the end
  queryParams.push(user_id);

  // Run the SQL above, subbing the parameters
  db.query(sql, queryParams, (err, results) => {

    // If there is an error, log it
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred');
    }

    // Send the results back
    res.json(results);
    
  });

});

// Get a single tape from the database
tapesRouter.get('/:id', (req, res) => {

  // Get the id from the URL
  const { id } = req.params;
  
  // Get the user that was attached in the auth function
  const user_id = req.user.userId;

  // SQL for one tape
  const sql = `
    SELECT albums.*, artists.name AS artist, artists.id AS artist_id
    FROM albums
    JOIN artists ON albums.artist_id = artists.id
    WHERE albums.id = ? AND albums.user_id = ?`;

  // Substitute the '?' with the id from the URL to prevent SQL injection
  db.query(sql, [id, user_id], (err, results) => {

    if (err) {
      console.error(err);
      res.status(500).send('An error occurred');
    }

    res.json(results[0]);
  });

});

tapesRouter.delete("/:id", (req, res) => {

  // Get the id from the url placeholder here
  const { id } = req.params;

  // Get the user_id from the auth function
  const user_id = req.user.userId;

  // SQL Query to delete the album
  const sql = `DELETE FROM albums WHERE id = ? AND user_id = ? LIMIT 1`;

  // Run the above 
  db.query(sql, [id, user_id], (err, results) => {

    if(err) {
      console.log(err); 
      res.status(500).send("Interal Server Error");
    }

    // Send the response back to redirect
    res.json({message: "Tape Deleted"});

  });

});

// Update a tape entry in the database
tapesRouter.put('/:id', upload.single('image'), (req, res) => {

  // Get the id from the URL
  const { id } = req.params;
  const user_id = req.user.userId;

  // Get the title and artist ID from the request body
  const { title, description, artist_id } = req.body;

  // @NOTE: We are breaking the SQL query into multiple concatenated strings for readability to only add the image_name if a file was uploaded

  let updateAlbumSQL = `
    UPDATE albums
    SET title = ?, artist_id = ?, description = ?
  `;

  const queryParams = [title, artist_id, description];

  // The file property will only return truthy if a file was uploaded
  if (req.file) {
    updateAlbumSQL += `, image_name = ?`;
    queryParams.push(req.file.filename);
  }

  // Finish the SQL query by adding the WHERE clause to only update the tape with the matching ID
  updateAlbumSQL += ` WHERE id = ? AND user_id = ? LIMIT 1`;
  queryParams.push(id);
  queryParams.push(user_id);

  console.log(queryParams);

  // Run the query above, substituting the '?' with the title, artist ID, image (if uploaded) and ID in that order
  db.query(updateAlbumSQL, queryParams, (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred');
    }

    res.json({ message: 'Tape updated successfully' });
  });
});

// Add a new tape to the database after uploading an image that was sent in the request
tapesRouter.post('/', upload.single('image'), (req, res) => {

    // Get the artist ID and title from the request body 
    const { artist_id, title, description } = req.body;

    const user_id = req.user.userId;
  
    // The uploaded file's filename is stored in 'req.file.filename'
    const image = req.file.filename;
  
    // Create the SQL query to insert the new tape
    const addAlbumSQL = `INSERT INTO albums (artist_id, title, description, image_name, user_id) VALUES (?, ?, ?, ?, ?)`;
  
    // Run the query above, substituting the '?' with the artist ID, title and image in that order
    db.query(addAlbumSQL, [artist_id, description, title, image, user_id], (err, results) => {
  
      // If an error occurred, log it and return a 500 status code
      if (err) {
        console.error(err);
        return res.status(500).send('An error occurred');
      }
  
      res.json({ message: 'Tape added successfully' });

    });
}); 

module.exports = tapesRouter;

