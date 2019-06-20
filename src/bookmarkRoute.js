const express = require('express');
const logger = require('./logger');
const xss = require('xss');
const BookmarkService = require('./bookmark-service');

const bookmarkRouter = express.Router();
const jsonParser = express.json();

const safeBookmark = article => ({
  id: article.id,
  title: xss(article.title),
  description: xss(article.description),
  rating: article.rating,
  url: xss(article.url)
});

bookmarkRouter
  .route('/')
  .get((req, res, next) => {
    const db = req.app.get('db');
    BookmarkService.getAllBookmarks(db)
      .then(bookmarks => {
        res.json(bookmarks.map(safeBookmark));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const db = req.app.get('db');
    const { title, url, rating, description } = req.body;
    const myRating = parseInt(rating);
    const newBookmark = {
      title,
      url,
      rating: myRating,
      description
    };
    if (!title || !url || !rating || rating > 5 || rating < 1) {
      logger.error('invalid bookmark');
      return res.status(400).json({ message: 'Invalid Input' });
    }
    //Getting a 500 internal error or a can't set headers after they are already set.
    BookmarkService.insertBookmark(db, newBookmark)
      .then(bm => {
        res.status(201).json(safeBookmark(bm));
      })
      .catch(next);
  });

bookmarkRouter
  .route('/:id')

  .delete((req, res, next) => {
    const db = req.app.get('db');
    const { id } = req.params;
    if (!id) {
      logger.error('Invalid bookmark id');
      return res.status(400).send('Invalid data');
    }
    BookmarkService.deleteBookmark(db, id)
      .then(bm => {
        res.status(204).end();
      })
      .catch(next);
  })

  .get((req, res, next) => {
    const db = req.app.get('db');
    const { id } = req.params;
    if (!id) {
      logger.error('No ID given');
      return res.status(400).send('Invalid data');
    }
    BookmarkService.getById(db, id)
      .then(bm => {
        if (!bm) {
          logger.error(`No bookmark found with id ${id}`);
          return res.status(404).send('Bookmark not found');
        }
        return res.status(200).json(safeBookmark(bm));
      })
      .catch(next);
  });

module.exports = bookmarkRouter;
