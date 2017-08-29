

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

/////////////////////////////
