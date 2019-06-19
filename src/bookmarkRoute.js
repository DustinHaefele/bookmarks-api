const express = require('express');
const logger = require('./logger');
const uuid = require('uuid/v4');
const bookmarks = require('./store');
const BookmarkService = require('./bookmark-service');

const bookmarkRouter = express.Router();

bookmarkRouter
  .route('/')
  .get((req, res, next) => {
    const db = req.app.get('db');
    BookmarkService.getAllBookmarks(db)
      .then(bookmarks => {
        res.json(bookmarks);
      })
      .catch(next);
  })
  .post((req, res) => {
    const { title, url, rating, description } = req.body;
    if (!title || !url || !rating) {
      logger.error('invalid bookmark');
      return res.status(400).json({ message: 'Invalid Input' });
    }
    const myRating = parseInt(rating);

    const newBookmark = {
      title,
      url,
      rating: myRating,
      description,
      id: uuid()
    };
    bookmarks.push(newBookmark);
    res.status(201).json(newBookmark);
  });

bookmarkRouter
  .route('/:id')
  .delete((req, res) => {
    const { id } = req.params;
    if (!id) {
      logger.error('Invalid bookmark id');
      return res.status(400).send('Invalid data');
    }
    const index = bookmarks.findIndex(b => b.id === id);
    bookmarks.splice(index, 1);
    res.status(202).json(bookmarks);
  })
  .get((req,res,next) => {
    const db = req.app.get('db');
    const { id } = req.params;
    if (!id) {
      logger.error('No ID given');
      return res.status(400).send('Invalid data');
    }
    BookmarkService.getById(db, id)
      .then(bm=>{
        if(!bm){
          logger.error(`No bookmark found with id ${id}`);
          return res.status(404).send('Bookmark not found');
        }
        return res.status(200).json(bm);
      })
      .catch(next);
  });

module.exports = bookmarkRouter;
