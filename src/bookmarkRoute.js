const logger = require('./logger');
const express = require('express');
const uuid = require('uuid/v4');
const bookmarks = require('./store');

const bookmarkRouter = express.Router();

bookmarkRouter
  .route('/')
  .get((req, res) => {
    'FUNCTIONALITY';
  })
  .post((req, res) => {
    'FUNCTIONALITY';
  });

bookmarkRouter.delete('/:id', (req, res) => {
  'FUNCTIONALITY';
});
