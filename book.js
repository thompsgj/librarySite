/*Required / Dependencies*/
//Require Express
var express = require('express');
var app = express();
var mongo = require('mongodb');
var mongoose = require('mongoose');
var monk = require('monk');
var db = monk('localhost:27017/bookdb');
var UsersDB = require('./models/user.js');
var assert = require('assert');
var asynch = require('asynch');
//Require and Set Up Handlebars
var handlebars = require('express3-handlebars').create({
	defaultLayout:'main',
	//necessary for injecting views into layouts when desired
	helpers: {
		section: function(name, options) {
			if(!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//Require Body Parser (for forms)
app.use(require('body-parser')());

//Set Port
app.set('port', process.env.PORT || 3000);

//Declare public folder
app.use(express.static(__dirname + '/public'));


/*Routes*/
app.use(function(req,res,next) {
	req.db = db;
	next();
});

//GET HOME PAGE START
app.get('/', function(req,res) {
	res.render('home');
});
//GET HOME PAGE END

//GET USER PAGE START
app.get('/users', function(req,res) {
	var db = req.db;
	var collection = db.get('usercollection');
	collection.find({},{},function(e,docs) {
		res.render('users', {
			"userlist" : docs
		});
	});
});
//GET USER PAGE END

//PROCCESS USER PAGE FORM START
app.post('/process-user', function(req, res){

	//console.log('Form (from querystring): ' + req.query.form);
	//console.log('CSRF token (from hidden form field): ' + req.body._csrf);
	//console.log('Name (from visible form field): ' + req.body.name);
	//console.log('ID (from visible form field): ' + req.body.id);
	//console.log('Email (from visible form field): ' + req.body.email);
	//console.log('Phone Number (from visible form field): ' + req.body.phone);
	
	//Set DB
	var db = req.db;

	//Instantiate variables for DB keys
	var userName = req.body.name;
	var userId = req.body.id;
	var userPhone = req.body.phone;
	var userEmail = req.body.email;

	//Set collection
	var collection = db.get('usercollection');

	//Submit to DB
	collection.insert({
		"name" : userName,
		"idnumber" : userId,
		"phone" : userPhone,
		"email" : userEmail,
	}, function (err, doc) {
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {
			res.redirect(303, '/thanks')
		}
	});
});
//PROCESS USER PAGE END

//GET INVENTORY PAGE START
app.get('/addinv', function(req,res) {
	var db = req.db;
	var collection = db.get('bookcollection');
	collection.find({},{},function(e,docs) {
		res.render('addinv', {
			"invlist" : docs
		});
	});
});
//GET INVENTORY PAGE END

//PROCESS INVENTORY PAGE START
app.post('/process-inv', function(req,res) {
	//console.log('Form: ' + req.query.form);
	//console.log('Title: ' + req.body.title);
	//console.log('Author: ' + req.body.author);
	//console.log('Code: ' + req.body.code);
	//console.log('Genre: ' + req.body.genre);

	var db = req.db;

	//Instantiate variables for DB keys
	var bkTitle = req.body.title;
	var bkAuthor = req.body.author;
	var bkPublisher = req.body.pub;
	var bkSeries = req.body.pubSeries;
	var bkHeadwords = req.body.head;
	var bkType = req.body.type;
	var bkGenre = req.body.genre;
	var bkCD = req.body.cd;
	var bkNumber = req.body.number; //convert to multiple numbers
		var bkNumArr = [];
		bkNumArr = bkNumber.split(',').map(Number);
	var bkISBN = req.body.isbn; 
		//Convert to multiple numbers
		//var bkISBNArr = [];
		//bkISBNArr = bkISBN.split(',').map(Number);
	var ILERLevel = req.body.level;
		ILERLevel = parseInt(ILERLevel);
	var oldLevel = req.body.old;
	var totalBks = req.body.total;
		totalBks = parseInt(totalBks);

	//Set Collection
	var collection = db.get('bookcollection');

	//
	collection.insert({
		"title" : bkTitle,
		"author" : bkAuthor,
		"publisher" : bkPublisher,
		"series" : bkSeries,
		"level": {"ILER": ILERLevel, "Former": oldLevel},
		"numbers": {"book":bkNumArr, "ISBN":bkISBN},
		"attributes": {"headwords":bkHeadwords, "type":bkType, "genre":bkGenre, "CD": bkCD},
		"availability": {"total": totalBks, "checkouts":0},
	}, function (err, doc) {
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {
			res.redirect(303, '/thanks')
		}
	});
});
//PROCESS INTVENTORY PAGE END





//GET SEARCH INVENTORY START
app.get('/searchinv', function(req,res) {
	var db = req.db;
	var collection = db.get('bookcollection');
	collection.find({},{},function(e,docs) {
		res.render('searchinv', {
			"invlist" : docs
		});
	});
});
//GET SEARCH INVENTORY END

//PROCESS SEARCH PAGE FORM START
app.post('/process-search', function(req,res) {
	var db = req.db;
	var collection = db.get('bookcollection');
	//Instantiate variables for DB keys
	var bookCode = req.body.code;
		bookCode = parseInt(bookCode);

	collection.find({"numbers.book" : bookCode},{},function(err,docs) {
		var level = docs[0].level["ILER"]
		var type = docs[0].attributes["type"]
		var cd = docs[0].attributes["CD"]
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {

			res.render('updateinv', {
				"bookentry" : docs,
				"bklevel": level,
				"bktype":type,
				"bkcd":cd
			});
		}

	});
});
//PROCESS SEARCH PAGE FORM END

//GET UPDATE INVENTORY START
/* Unnecessary
app.get('/updateinv', function(req,res) {
	var db = req.db;
	var collection = db.get('bookcollection');

	var bookCode = req.body.code;
		bookCode = parseInt(60);
	collection.find({"numbers.book":bookCode},{},function(e,docs) {
		var level = docs[0].level["ILER"]
		var type = docs[0].attributes["type"]
		var cd = docs[0].attributes["CD"]
		res.render('updateinv', {
			"bookentry" : docs,
			"bklevel": level,
			"bktype":type,
			"bkcd":cd
		});
	});
});
*/
//GET UPDATE INVENTORY END

//PROCESS UPDATE PAGE FORM START
app.post('/process-update', function(req,res) {
	var db = req.db;

	//Instantiate variables for DB keys
	var bkTitle = req.body.title;
	var bkAuthor = req.body.author;
	var bkPublisher = req.body.pub;
	var bkSeries = req.body.pubSeries;
	var bkHeadwords = req.body.head;
	var bkType = req.body.type;
	var bkGenre = req.body.genre;
	var bkCD = req.body.cd;
	var bkNumber = req.body.number; //convert to multiple numbers
		var bkNumArr = [];
		bkNumArr = bkNumber.split(',').map(Number);
	var bkISBN = req.body.isbn; 
		//Convert to multiple numbers
		//var bkISBNArr = [];
		//bkISBNArr = bkISBN.split(',').map(Number);
	var ILERLevel = req.body.level;
		ILERLevel = parseInt(ILERLevel);
	var oldLevel = req.body.old;
	var totalBks = req.body.total;
		totalBks = parseInt(totalBks);

	//Set Collection
	var collection = db.get('bookcollection');

	//
	collection.update({"title":bkTitle},{
		"title" : bkTitle,
		"author" : bkAuthor,
		"publisher" : bkPublisher,
		"series" : bkSeries,
		"level": {"ILER": ILERLevel, "Former": oldLevel},
		"numbers": {"book":bkNumArr, "ISBN":bkISBN},
		"attributes": {"headwords":bkHeadwords, "type":bkType, "genre":bkGenre, "CD": bkCD},
		"availability": {"total": totalBks, "checkouts":0},
	}, function (err, doc) {
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {
			res.redirect(303, '/thanks')
		}
	});
});
//PROCESS UPDATES PAGE FORM END













//GET CHECKOUTS PAGE START
app.get('/checkouts', function(req,res) {
	var db = req.db;
	var collection = db.get('bookcollection');
	collection.find({title:{$exists:true}},{fields:{_id:0,url:0, author:0,publisher:0,series:0,level:0,numbers:0, attributes:0,availability:0}}, function(e,docs) {
		//Convert JSON to Array
		arr = []
		for(i = 0; i < docs.length; i++) {
			arr.push(docs[i]["title"]);
		}
		res.render('checkouts', {
			//Send JSON for HTML Rendering
			"bklist" : docs,
			//Send Array for Javascript Variables
			"bkarr" : arr
			//encodedJson : encodeURIComponent(JSON.stringify(docs))
		});
	});
});
//GET CHECKOUTS PAGE END

//PROCESS CHECKOUTS PAGE FORM START
app.post('/process-chk', function(req,res) {
	var db = req.db;

	//Instantiate variables for DB keys
	var bookCode = req.body.code;
		bookCode = parseInt(bookCode);
	var studentId = req.body.id;
	var studentPhone = req.body.phone;
	var teacherName = req.body.teacher;
	
	var today = new Date();
	var checkoutDate = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();

	var due = new Date();
	due.setDate(due.getDate() + 15)
	var returnDate = due.getFullYear() + '-' + (due.getMonth()+1) + '-' + due.getDate()
	console.log("Today")
	console.log(today)
	console.log("Due Date")
	console.log(due)
	
	console.log("checkout date")
	console.log(checkoutDate)
	console.log("return date")
	console.log(returnDate)

	//Set Collection
	var bkcoll = db.get('bookcollection');
	var uscoll = db.get('usercollection');
	var chkcoll = db.get('checkoutcollection');

	/*Process
		-Validate that id num and book num are present
		-Update book collection
		  * available books -1
		  * checked out +1
	*/

	//get student name + student email
	//get book name

	/*var bookName
	bkcoll.find({"code":bookCode},{"title":1, "_id":0}).then(function(numItems) {
		console.log(numItems);
		bookName = numItems.title;
	})*/

	//WORKING CODE
	//var query= {"numbers.book":bookCode};
	//var projection = {"title":1, "_id":0};
	//var cursor = db.collection('bookcollection').find(query)
	//END WORKING CODE


	//HERE I WAS TRYING TO ADD THE BOOK TITLE TO THE CHECKED OUT OUTPUT
	//cursor.project(projection)
	/*
	cursor.forEach(function(doc){
		console.log(doc)
	})
	*/
	//var bookName = bkcoll.find({"code":bookCode},{"title":1, "_id":0}).limit(1)
	//console.log("BOOK TITLE")

	chkcoll.insert({"student":studentId, "code":bookCode,  "checkoutDate":checkoutDate, "returnDate": returnDate});

	bkcoll.update({
		"numbers.book" : bookCode
	}, {$inc: {"availability.total":-1, "availability.checkouts":1}},
	function (err, doc) {
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {
			res.redirect(303, '/thanks')
		}
	});
});
//PROCESS CHECKOUTS PAGE FORM END

//GET RETURNS PAGE START
app.get('/returns', function(req,res) {
	var db = req.db;
	var collection = db.get('checkoutcollection');
	collection.find({},{},function(e,docs) {
		res.render('returns', {
			"chklist" : docs
		});
	});
});
//GET RETURNS PAGE END

//PROCESS RETURNS PAGE FORM START
app.post('/process-rtrn', function(req,res) {
	var db = req.db;

	//Instantiate variables for DB keys
	var studentId = req.body.id
	var bookCode = req.body.code;
		bookCode = parseInt(bookCode)

	//Set Collection
	var bkcoll = db.get('bookcollection');
	var uscoll = db.get('usercollection');
	var chkcoll = db.get('checkoutcollection');

	

	chkcoll.remove({"student":studentId, "code":bookCode},{justOne: true});

	bkcoll.update({
		"numbers.book" : bookCode
	}, {$inc: {"availability.total":1, "availability.checkouts":-1}},
	function (err, doc) {
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {
			res.redirect(303, '/thanks')
		}
	});
});
//PROCESS RETURNS PAGE FORM END

//GET ANALYTICS PAGE START
app.get('/analytics', function(req,res) {
	//res.render('analytics');
	var db = req.db;
	var collection = db.get('bookcollection');

	/* Example Query with output to console
	collection.aggregate([
		{"$match": {
			"genre" : "Sci-Fi"
		}},
	    { "$group": {
	    	_id: null, count: {$sum: 1}
	    }}
	]).then(function(docs) {
		console.log(docs);
		res.json()
	})


	collection.aggregate([
		{"$match": {
			"genre" : "Sci-Fi"
		}},
	    { "$group": {
	    	_id: null, count: {$sum: 1}
	    }}
	]).then(function(docs) {
		return docs[0].count
	})


		function aggregation(search) {
		console.log(search);
		query = {"genre" : search}
		console.log(search);
		collection.aggregate([
			{"$match": query},
		    { "$group": {
		    	_id: null, count: {$sum: 1}
		    }}
		]).then(function(docs) {
			console.log("Function Console Log");
			return "hi"
		})
	}

	//CALLBACKS
	function aggregationResult(result){
		//console.log("Aggregation Callback Result")
		//console.log("CL Result: " + String(result[0].count));
		console.log(result)
	}

	function aggregation(search, callback) {
		query = {"genre" : search}
		collection.aggregate([
			{"$match": query},
		    { "$group": {
		    	_id: null, count: {$sum: 1}
		    }}
		]).then(function(docs) {
			callback(docs);
		})
	}

	aggregation("Sci-Fi", aggregationResult);


	*/


	var query = {"genre" : "Sci-Fi"}

	collection.find(query,{},function(e,docs) {
		res.render('analytics', {
			function(){
				console.log("hi")
			}
		});
	});
});
//GET ANALYTICS PAGE END


app.get('/thanks', function(req,res) {
	res.render('thanks');
});

/*Error Handling*/
//custom 404 page
app.use(function(req,res) {
	res.status(404);
	res.render('404');
});

//custom 500 page
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});


/* Log Listening */
app.listen(app.get('port'), function() {
	console.log( 'Express started on http:localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
})