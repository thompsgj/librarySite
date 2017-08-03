var express = require('express');
var router = express.Router();
var ctrlBooks = require('../controllers/books');
var ctrlUsers = require('../controllers/users');
var ctrlCheckouts = require('../controllers/checkouts');

// Book
router.post('/books', ctrlBooks.bookCreateOne);
router.get('/books/:bookid', ctrlBooks.bookRetrieveOne);
router.get('/books', ctrlBooks.bookRetrieveList);
router.put('/books/', ctrlBooks.bookUpdateOne);
router.delete('/books', ctrlBooks.bookDeleteOne);

// User
router.post('/users', ctrlUsers.userCreateOne);
router.get('/users/:userid', ctrlUsers.userRetrieveOne);
router.get('/users', ctrlUsers.userRetrieveList);
router.put('/users/:userid', ctrlUsers.userUpdateOne);
router.delete('/users', ctrlUsers.userDeleteOne);

// Checkout
router.post('/checkouts', ctrlCheckouts.checkoutCreateOne);
router.get('/checkouts/:checkoutid', ctrlCheckouts.checkoutRetrieveOne);
router.get('/checkouts', ctrlCheckouts.checkoutRetrieveList);
router.put('/checkouts/', ctrlCheckouts.checkoutUpdateOne);
router.delete('/checkouts', ctrlCheckouts.checkoutDeleteOne);

module.exports = router;