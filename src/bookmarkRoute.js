const express = require('express');
const logger = require('./logger');
const uuid = require('uuid/v4');
const bookmarks = require('./store');

const bookmarkRouter = express.Router();

bookmarkRouter
  .get('/', (req, res) => {
    //Any Validation??
    res.json(bookmarks);
  });
//   .post((req, res) => {
//     //FUNCTIONALITY
//   });

// bookmarkRouter.delete('/:id', (req, res) => {
//   //FUNCTIONALITY
// });

module.exports = bookmarkRouter;