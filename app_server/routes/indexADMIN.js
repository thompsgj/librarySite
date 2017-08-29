

/* Ensure authentication */


/* User Routes */
router.get('/', ensureAuthentication, ctrlBooks.home);
//Add Book List Page and Fill with list of Books
router.get('/book/list', ensureAuthentication, ctrlBooks.bookList);

//Use the get /book/entry/ to view the updated entry
router.get('/book/list/download', ensureAuthentication, ctrlBooks.downloadBookList);

// Other Routes
router.get('/user', ensureAuthentication, ctrlOthers.users);//DONE

router.get('/user/login', ctrlOthers.staffLogin);

router.get('/analytics', ensureAuthentication, ctrlOthers.analytics);
router.get('/thanks', ensureAuthentication, ctrlOthers.thanks)//DONE
/////////////////////////////////////////////////////

/* Admin Routes */
router.get('/', ensureAuthentication, ctrlBooks.home);
//Add a Book Page
router.get('/book/add', ensureAuthentication, groupVerification('admin'), ctrlBooks.addBook);//DONE
//Do the action of adding a book
router.post('/book/entry/new', ensureAuthentication, ctrlBooks.doAddBook);//DONE
//Add in a route for viewing the entry

//Delete a book entry
router.post('/book/delete', ensureAuthentication, ctrlBooks.doDeleteBook);

//Add Book List Page and Fill with list of Books
router.get('/book/list', ensureAuthentication, ctrlBooks.bookList);

//Update Search Page
router.get('/book/update', ensureAuthentication, ctrlBooks.searchBookForUpdate);//DONE
//Update Book Page
router.post('/book/entry/', ensureAuthentication, ctrlBooks.updateBook);//DONE
//Do the Action of Updating a Book
router.post('/book/entry/update', ensureAuthentication, ctrlBooks.doUpdateBook);//DONE
//Use the get /book/entry/ to view the updated entry
router.get('/book/list/download', ensureAuthentication, ctrlBooks.downloadBookList);

//Checkout Book Page
router.get('/book/checkout', ensureAuthentication, ctrlBooks.checkoutBook);//DONE
//Do the Action of Adding a Checkout Entry
router.post('/book/checkout/new', ensureAuthentication, ctrlBooks.doCheckoutBook);//DONE

//Get the Checkout List Page and Populate it
router.get('/book/checkout/list', ensureAuthentication, ctrlBooks.checkoutList);//DONE

router.get('/book/checkout/archive', ensureAuthentication, ctrlBooks.checkoutArchiveList);

//Download Overdue Checkout List
router.get('/book/checkout/list/download', ensureAuthentication, ctrlBooks.downloadOverdue);//DONE


//Do the action of deleting a checkout entry
router.post('/book/checkout/return/', ensureAuthentication, ctrlBooks.returnBook);//DONE
router.post('/book/checkout/extend/', ensureAuthentication, ctrlBooks.extendBook);//DONE

// Other Routes
router.get('/user', ensureAuthentication, ctrlOthers.users);//DONE

router.get('/user/login', ctrlOthers.staffLogin);
router.get('/user/staff/registration', ensureAuthentication, ctrlOthers.addStaff);
router.post('/user/staff/registration', ensureAuthentication, ctrlOthers.doAddStaff);

router.get('/user/add', ensureAuthentication, ctrlOthers.addUser);//DONE
router.post('/user/entry/new', ensureAuthentication, ctrlOthers.doAddUser);//DONE

router.get('/analytics', ensureAuthentication, ctrlOthers.analytics);
router.get('/thanks', ensureAuthentication, ctrlOthers.thanks)//DONE










/////////////////////////////
