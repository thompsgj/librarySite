var express = require('express');
var router = express.Router();
var ctrlBooks = require('../controllers/books');
var ctrlOthers = require('../controllers/others')


// Home Route
router.get('/', ctrlBooks.home);

// Book Routes

//Add a Book Page
router.get('/book/add', ctrlBooks.addBook);//DONE
//Do the action of adding a book
router.post('/book/entry/new', ctrlBooks.doAddBook);//DONE
//Add in a route for viewing the entry

//Delete a book entry
router.post('/book/delete', ctrlBooks.doDeleteBook);

//Add Book List Page and Fill with list of Books
router.get('/book/list', ctrlBooks.bookList);

//Update Search Page
router.get('/book/update', ctrlBooks.searchBookForUpdate);//DONE
//Update Book Page
router.post('/book/entry/', ctrlBooks.updateBook);//DONE
//Do the Action of Updating a Book
router.post('/book/entry/update', ctrlBooks.doUpdateBook);//DONE
//Use the get /book/entry/ to view the updated entry

//Checkout Book Page
router.get('/book/checkout', ctrlBooks.checkoutBook);//DONE
//Do the Action of Adding a Checkout Entry
router.post('/book/checkout/new', ctrlBooks.doCheckoutBook);//DONE

//Get the Checkout List Page and Populate it
router.get('/book/checkout/list', ctrlBooks.checkoutList);//DONE


//Do the action of deleting a checkout entry
router.post('/book/checkout/return/', ctrlBooks.returnBook);//DONE
router.post('/book/checkout/extend/', ctrlBooks.extendBook);//DONE

// Other Routes
router.get('/user', ctrlOthers.users);//DONE

router.get('/user/add', ctrlOthers.addUser);//DONE
router.post('/user/entry/new', ctrlOthers.doAddUser);//DONE

router.get('/analytics', ctrlOthers.analytics);
router.get('/thanks', ctrlOthers.thanks)//DONE

module.exports = router;