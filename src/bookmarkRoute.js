const express = require('express');
const logger = require('./logger');
const uuid = require('uuid/v4');
const bookmarks = require('./store');

const bookmarkRouter = express.Router();

bookmarkRouter
  .get('/', (req, res) => {
    res.json(bookmarks);
  })
  .post('/', (req, res) => {
    const { title, url, rating, description } = req.body;
    const myRating = parseInt(rating);
    const newBookmark = { title, url, rating: myRating, description, id: uuid() };
    bookmarks.push(newBookmark);
    res.status(201).json(newBookmark);
  });

// bookmarkRouter.delete('/:id', (req, res) => {
//   //FUNCTIONALITY
// });

module.exports = bookmarkRouter;
