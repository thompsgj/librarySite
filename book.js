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

app.get('/', function(req,res) {
	res.render('home');
});

app.get('/users', function(req,res) {
	var db = req.db;
	var collection = db.get('usercollection');
	collection.find({},{},function(e,docs) {
		res.render('users', {
			"userlist" : docs
		});
	});
});

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

app.get('/inventory', function(req,res) {
	var db = req.db;
	var collection = db.get('bookcollection');
	collection.find({},{},function(e,docs) {
		res.render('inventory', {
			"invlist" : docs
		});
	});
});

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
	var bkISBN = req.body.isbn; //Convert to multiple numbers
		var bkISBNArr = [];
		bkISBNArr = bkISBN.split(',').map(Number);
	var ILERLevel = req.body.level;
	var oldLevel = req.body.old;
	var totalBks = req.body.total;

	//Set Collection
	var collection = db.get('bookcollection');

	//
	collection.insert({
		"title" : bkTitle,
		"author" : bkAuthor,
		"publisher" : bkPublisher,
		"series" : bkSeries,
		"level": {"ILER": ILERLevel, "Former": oldLevel},
		"numbers": {"book":bkNumArr, "ISBN":bkISBNArr},
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


app.post('/process-chk', function(req,res) {
	var db = req.db;

	//Instantiate variables for DB keys
	var studentId = req.body.id
	var bookCode = req.body.code;

	console.log("Student ID: " + studentId);
	console.log("Book Code: " + bookCode);
	console.log(typeof[bookCode])

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

	var query= {"code":bookCode};
	var projection = {"title":1, "_id":0};
	var cursor = db.collection('bookcollection').find(query)
	
	//HERE I WAS TRYING TO ADD THE BOOK TITLE TO THE CHECKED OUT OUTPUT
	//cursor.project(projection)
	/*
	cursor.forEach(function(doc){
		console.log(doc)
	})
	*/
	//var bookName = bkcoll.find({"code":bookCode},{"title":1, "_id":0}).limit(1)
	//console.log("BOOK TITLE")

	chkcoll.insert({"student":studentId, "code":bookCode});

	bkcoll.update({
		"code" : bookCode
	}, {$inc: {"available":-1, "checkedout":1}},
	function (err, doc) {
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {
			res.redirect(303, '/thanks')
		}
	});
});

app.get('/returns', function(req,res) {
	var db = req.db;
	var collection = db.get('checkoutcollection');
	collection.find({},{},function(e,docs) {
		res.render('returns', {
			"chklist" : docs
		});
	});
});


app.post('/process-rtrn', function(req,res) {
	var db = req.db;

	//Instantiate variables for DB keys
	var studentId = req.body.id
	var bookCode = req.body.code;

	//Set Collection
	var bkcoll = db.get('bookcollection');
	var uscoll = db.get('usercollection');
	var chkcoll = db.get('checkoutcollection');

	

	chkcoll.remove({"student":studentId, "code":bookCode},{justOne: true});

	bkcoll.update({
		"code" : bookCode
	}, {$inc: {"available":1, "checkedout":-1}},
	function (err, doc) {
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {
			res.redirect(303, '/thanks')
		}
	});
});


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

app.get('/thanks', function(req,res) {
	res.render('thanks', { layout: 'page' });
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