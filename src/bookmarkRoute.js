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
        if(!bm){ 
          return res.status(404).end();
        }
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
  })
  .patch(jsonParser, (req,res,next)=>{
    const db = req.app.get('db');
    const{title, url, description, rating} = req.body;
    const { id } = req.params;
   

    const updatedData = {title, url, description,rating};

    if(!id || (!title && !url && !description && (!rating || rating < 1 || rating > 5)) ){
      logger.error(`No valid keys provided on ${updatedData}`);
      return res.status(400).send({error:{message:'Body must contain valid keys'}})
    }

    BookmarkService.updateBookmark(db,id,updatedData)
      .then(bm=>{
        if(!bm){
          return res.status(404).end();
        }
        return res.status(204).end();
      })
      .catch(next);
  });

module.exports = bookmarkRouter;
