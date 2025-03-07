const express = require('express');
const createHttpError = require('http-errors');
const router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");

const defaultPage = 1; // default to page 1 of results
const pageLimit = 10; // results per page
let pageOffset = 0; // starting page offset
let url = ''; // holds the search string if user searches - starts blank

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
  pageOffset = 0; //clear offset
  url = ''; //clear url

  const { count, rows } = await Book.findAndCountAll({
    limit: pageLimit,
    offset: pageOffset,
  });

  const pagination = Array.from([...Array(Math.ceil(count/pageLimit)).keys()]); // create array from number of pages to populate pagination view
  const books = rows.map(book => book.dataValues);
  res.render(`books/`, { books: books, url: url, pagination: pagination, title: 'Books'});
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

/* GET search results */
router.get('/:search', asyncHandler(async (req, res, next) => {
  // check if there is a page or search term, if not keep moving
  if (req.query.search === '' || req.query.search || req.query.page) {
    const page = req.query.page ? parseInt(req.query.page) : defaultPage;
    const qString = req.query.search ? req.query.search : '';
    pageOffset = (page - 1) * pageLimit;

    // set value of url to the search text if there is search text
    url = qString ? `search=${qString}&` : '';

    const { count, rows } = await Book.findAndCountAll({
      attributes: ['id', 'title', 'author', 'genre', 'year'],
      where: {
        [Op.or]: [
          { title: {[Op.like]: '%' + qString + '%'}},
          { author: {[Op.like]: '%' + qString + '%'}},
          { genre: {[Op.like]: '%' + qString + '%'}},
          { year: {[Op.like]: '%' + qString + '%'}},
        ]
      },
      limit: pageLimit,
      offset: pageOffset
    });
    const pagination = Array.from([...Array(Math.ceil(count/pageLimit)).keys()]); // create array from number of pages to populate pagination view
    const books = rows.map(book => book.dataValues);
    res.render('books/', {books: books, page: page, url: url, pagination: pagination, title: 'Books'});
  } else {
    next();
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