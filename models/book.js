const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Book extends Sequelize.Model {}
  Book.init({
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      allowEmpty: false,
      validate: {
        notNull: {
          msg: 'Title is required'
        },
        notEmpty: {
          msg: 'Title is required'
        }
      },
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false,
      allowEmpty: false,
      validate: {
        notNull: {
          msg: 'Author is required'
        },
        notEmpty: {
          msg: 'Author is required'
        }
      },
    },
    genre: {
      type: Sequelize.STRING
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false,
      allowEmpty: false,
      validate: {
        isNumeric: {
          msg: 'Year must be a number'
        },
        notNull: {
          msg: 'Year published is required'
        },
        notEmpty: {
          msg: 'Year published is required'
        },
      }
    },
  }, { sequelize });

  return Book;
};
