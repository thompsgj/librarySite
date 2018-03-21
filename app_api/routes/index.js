var express = require('express');
var router = express.Router();
var ctrlBooks = require('../controllers/books');
var ctrlUsers = require('../controllers/users');
var ctrlCheckouts = require('../controllers/checkouts');
var ctrlAnalytics = require('../controllers/analytics');

// Book
router.post('/books', ctrlBooks.bookCreateOne);
router.get('/books', ctrlBooks.bookRetrieveList);
router.get('/books/:bookid', ctrlBooks.bookRetrieveOne);
router.get('/book/backup', ctrlBooks.downloadBookList);
router.put('/books/', ctrlBooks.bookUpdateOne);
router.delete('/books', ctrlBooks.bookDeleteOne);

// User
router.post('/users', ctrlUsers.userCreateOne);
router.get('/users/:userid', ctrlUsers.userRetrieveOne);
router.get('/users', ctrlUsers.userRetrieveList);
router.put('/users/:userid', ctrlUsers.userUpdateOne);
router.delete('/users', ctrlUsers.userDeleteOne);
router.post('/users/staff', ctrlUsers.staffCreateOne)

// Checkout
router.post('/checkouts', ctrlCheckouts.checkoutCreateOne);
//router.get('/checkouts/:checkoutid', ctrlCheckouts.checkoutRetrieveOne);
router.get('/checkouts', ctrlCheckouts.checkoutRetrieveList);
router.get('/checkouts/overduelist', ctrlCheckouts.checkoutRetrieveOverdueList);
router.get('/checkouts/archive', ctrlCheckouts.checkoutArchiveList);
router.put('/checkouts/', ctrlCheckouts.checkoutUpdateOne);
router.delete('/checkouts', ctrlCheckouts.checkoutDeleteOne);

router.get('/analytics/book/distinct', ctrlAnalytics.analyticsDistinctBookCount);
router.get('/analytics/book/total', ctrlAnalytics.analyticsBookCount)
router.get('/analytics/book/leveldistribution', ctrlAnalytics.analyticsLevelDistribution)
router.get('/analytics/checkout/total', ctrlAnalytics.analyticsBookCheckoutCount)
router.get('/analytics/checkout/current', ctrlAnalytics.analyticsBookCurrentCheckoutCount)
//router.get('/analytics/checkout/current', ctrlAnalytics.analyticsReturns)

module.exports = router;