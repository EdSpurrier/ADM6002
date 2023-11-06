
const express = require('express');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

// Create an Express app
const app = express();

// Serve static files from the www/ directory
app.use(express.static('www'));

// Add livereload middleware to the Express app
const livereloadServer = livereload.createServer();
livereloadServer.watch(__dirname + '/www');
app.use(connectLivereload());

// Start the Express app and livereload server
app.listen(3003, () => {
  console.log('App listening on http://localhost:3003');
  livereloadServer.server.once('connection', () => {
    setTimeout(() => {
      livereloadServer.refresh('/');
    }, 100);
  });
});
