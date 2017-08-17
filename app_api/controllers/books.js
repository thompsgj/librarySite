var monk = require('monk');
var assert = require('assert');
var asynch = require('asynch');
var db = monk('localhost:27017/bookdb');
var collection = db.get('bookcollection');

var sendJsonResponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.bookCreateOne = function(req,res) {
	console.log(req.body.numbers.ISBN)
	collection.find({
		"numbers.ISBN": req.body.numbers.ISBN
	}).then(function(bookDoc, err){
		console.log("BOOKDOC")
		console.log(bookDoc)
		if(bookDoc.length == 0) {
			collection.insert({
				"title": req.body.title,
				"author": req.body.author,
				"publisher": req.body.publisher,
				"series": req.body.series,
				"level": req.body.level,
				"numbers": req.body.numbers,
				"attributes": req.body.attributes,
				"availability": req.body.availability
			}).then(function(doc, err) {
				if (err) {
					res.send("Problem");
				} else {
					sendJsonResponse(res, 201, doc)
				}
			}) 
		} else {
			console.log("FINISHED BOOK CREATE")
			sendJsonResponse(res, 409, bookDoc)
		}
	})
}


module.exports.bookRetrieveOne = function(req,res) {
	collection.find({
		"_id" : req.body.bookId
	},{}).then(function(doc,err) {
		if (doc.length === 0 || err) {
			res.send("Problem");//NEED TO FIX THIS- send a message that there was nothing found
		} else {
			console.log("FIRING END OF BOOK RETRIEVE ONE")
			console.log(doc)
			sendJsonResponse(res, 201, doc)
		}
	})
}


module.exports.bookRetrieveList = function(req,res) {
	collection.find({}).then(function(doc,err) {
		if(err) {
			res.send("Problem");
		} else {
			sendJsonResponse(res, 200, doc)
		}
	})
}


module.exports.bookUpdateOne = function(req,res) {
	collection.update({"_id":req.body.id},{
		"title": req.body.title,
		"author": req.body.author,
		"publisher": req.body.publisher,
		"series": req.body.series,
		"level": req.body.level,
		"numbers": req.body.numbers,
		"attributes": req.body.attributes,
		"availability": req.body.availability
	}).then(function(doc, err) {
		if (err) {
			res.send("Problem");
		} else {
			sendJsonResponse(res, 201, doc)
		}
	}) 
}


module.exports.bookDeleteOne = function(req,res) {
	var data = req.body._id;
	collection.remove({
		_id: data
	}, {
		justOne: true
	}).then(function(doc, err) {
		if (err) {
			res.send("Problem");
		} else {
			sendJsonResponse(res, 201, doc)
		}
	})
}

/* WORK ON THIS
db.bookcollection.aggregate([{$unwind: "$numbers.book"}])
- aggregation query each row into multiple rows for each book code
*/

module.exports.downloadBookList = function(req, res) {
	console.log("DOWNLOAD BOOK LIST API FUNCTION")
	var path = require('path');
	var spawn = require('child_process').spawn;

	collection.aggregate([
		{$unwind: "$numbers.book"},
		{$project: {"_id": 0, 
					"title":1, 
					"author":1,
					"publisher":1,
					"series":1,
					"level.ILER":1,
					"numbers.book":1,
					"numbers.ISBN":1,
					"attributes.headwords":1,
					"attributes.type":1,
					"attributes.genre":1,
					"attributes.CD":1,
					"availability.total":1,
					"availability.checkouts":1
		}},
		{$out: "bkcolbackupcsv"}
	]).then(function() {
		var path = require('path');
		var spawn = require('child_process').spawn;
		var mongoExport = spawn('mongoexport', [
			'--db', 'bookdb', 
			'--collection', 'bkcolbackupcsv',
			'--type','csv',
			'--fields', 'title,author,publisher,series,level.ILER,numbers.book,numbers.ISBN,attributes.headwords,attributes.type,attributes.genre,attributes.CD,availability.total,availability.checkouts',
			'--out', path.resolve(".") + '/files/' + 'bkcolbackup.csv'
		]);

		res.set('Content-Type','text/csv')
		mongoExport.stdout.pipe(res)
	})
}
