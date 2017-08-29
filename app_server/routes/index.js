var express = require('express');
var router = express.Router();
var ctrlBooks = require('../controllers/books');
var ctrlOthers = require('../controllers/others')


var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var monk = require('monk');
var assert = require('assert');
var asynch = require('asynch');
var db = monk('localhost:27017/bookdb');
var staffcollection = db.get('users');


function ensureAuthentication(req, res, next) {
	console.log('AUTHENTICATION', req.isAuthenticated())
	if(req.isAuthenticated()) {
		return next();
	} else {
		req.session.flash = {
			type: "error",
			message: "Please log in."
		}
		res.redirect('/user/login');
	}
}

var groupVerification = function(group) {
	return function(req, res, next) {
		if (req.user && req.user[0].group == group) {
			next();
		} else {
			req.session.flash = {
				type: "error",
				message: "Unauthorized."
			}
			res.redirect('back');
		}
	};
};

// Home Route
router.get('/', ensureAuthentication, ctrlBooks.home);

/* Ensure authentication */


// Book Routes

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
router.get('/book/update', ensureAuthentication, groupVerification('admin'), ctrlBooks.searchBookForUpdate);//DONE
//Update Book Page
router.post('/book/entry/', ensureAuthentication, ctrlBooks.updateBook);//DONE
//Do the Action of Updating a Book
router.post('/book/entry/update', ensureAuthentication, ctrlBooks.doUpdateBook);//DONE
//Use the get /book/entry/ to view the updated entry
router.get('/book/list/download', ensureAuthentication, ctrlBooks.downloadBookList);

//Checkout Book Page
router.get('/book/checkout', ensureAuthentication, groupVerification('admin'), ctrlBooks.checkoutBook);//DONE
//Do the Action of Adding a Checkout Entry
router.post('/book/checkout/new', ensureAuthentication, ctrlBooks.doCheckoutBook);//DONE

//Get the Checkout List Page and Populate it
//Not verified
router.get('/book/checkout/list', ensureAuthentication, groupVerification('admin'), ctrlBooks.checkoutList);//DONE

router.get('/book/checkout/archive', ensureAuthentication, groupVerification('admin'), ctrlBooks.checkoutArchiveList);

//Download Overdue Checkout List
router.get('/book/checkout/list/download', ensureAuthentication, ctrlBooks.downloadOverdue);//DONE


//Do the action of deleting a checkout entry
router.post('/book/checkout/return/', ensureAuthentication, ctrlBooks.returnBook);//DONE
router.post('/book/checkout/extend/', ensureAuthentication, ctrlBooks.extendBook);//DONE

// Other Routes
//Not verified
router.get('/user/list', ensureAuthentication, groupVerification('admin'), ctrlOthers.users);//DONE

router.get('/user/login', ctrlOthers.staffLogin);
router.get('/user/staff/registration', ensureAuthentication, groupVerification('admin'), ctrlOthers.addStaff);
router.post('/user/staff/registration', ensureAuthentication, ctrlOthers.doAddStaff);

router.get('/user/add', ensureAuthentication, groupVerification('admin'), ctrlOthers.addUser);//DONE
router.post('/user/entry/new', ensureAuthentication, ctrlOthers.doAddUser);//DONE

router.get('/analytics', ensureAuthentication, ctrlOthers.analytics);
router.get('/thanks', ensureAuthentication, ctrlOthers.thanks)//DONE

/* User Authentication */

var comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) {
    		throw err
    	};
    	callback(null, isMatch);
	});
}



passport.use(new LocalStrategy(
	{usernameField: 'name', passwordField: 'password'},
  	function(username, password, done) {
 	staffcollection.find({
 		name: username
 	}).then(function(doc, err) {
 		if(doc.length == 0) {
 			return done(null, false, {message: "Incorrect username."});
 			/*
			req.session.flash = {
				type: "failure",
				message: "No user found."
			}
			*/
 		}
 		comparePassword(password, doc[0].password, function(err, isMatch) {
 			if(err) throw err;
 			if(isMatch) {
 				return done(null, doc);
 			} else {
 				return done(null, false, {message: 'Invalid password'});
 			}
 		})
 	});
}	
));

passport.serializeUser(function(user, done) {
  done(null, user[0].name);
});

passport.deserializeUser(function(id, done) {
	staffcollection.find({
 		name: id
 	}).then(function(doc, err) {
 		done(err, doc)
 	})
});


router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/user/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
});


router.get('/logout', function(req, res) {
	req.logout();
	req.session.flash = {
		type: "success",
		message: "You are logged out."
	}
	res.redirect('/user/login');
})

module.exports = router;