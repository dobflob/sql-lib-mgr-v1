const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");

/**
 * Reusable function to make async calls to the database so that actions are performed only once data is returned
 * @param {function} cb
 * @returns async function for route requests
 */
function asyncHandler(cb) {
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error) {
      // Sends error to global error handler
      next(error);
    }
  }
}

/* GET books listing */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('books/index', { books: books, title: 'Books'});
}));

/* GET New book form */
router.get('/new', asyncHandler(async (req, res) => {
  res.render(`books/new-book`, { book: {}, title: 'Create Book'});
}));

/* Create a new book */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect(`/books/${book.id}`);
  } catch (error) {
    if(error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('books/new-book', { book: book, errors: error.errors, title: 'New Book' });
    } else {
      throw error;
    }
  }
}));

/* GET book details */
router.get('/:id', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('books/update-book', { book: book, title: book.title});
  } else {
    next();
  }
}));

/* Update selected book */
router.post('/:id/update', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    await book.update(req.body);
    res.redirect(`/books/${book.id}`);
  } catch (error) {
    if(error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render(`books/update-book`, { book: book, errors: error.errors, title: "Update Book"});
    } else {
      throw error;
    }
  }
}));

/* Delete selected book */
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy(req.body);
  res.redirect(`/books`);
}));

module.exports = router;