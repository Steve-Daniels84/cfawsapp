const express = require('express');
const path = require('path');
const actions = require('../controllers/actions');
const fileUpload = require("express-fileupload");

// Middleware for handling file uploads
app.use(fileUpload());

const router = express.Router();

// Route to documentation page as default
router.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../public/docs.html'));
});

// Route to documentation page
router.get('/documentation', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../public/docs.html'));
});

//list objects
router.get('/objects', (req, res) => {
    actions.getObjects(req, res);
});

//add new object
router.post('/objects', (req, res) => {
    actions.addObject(req, res);
});

//get object
router.get('/objects/:key', (req, res) => {
    actions.getObject(req, res);
}
);

module.exports = router; // Export the router