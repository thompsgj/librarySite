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
}


module.exports.bookRetrieveOne = function(req,res) {
	console.log("BOOK RETRIEVE ONE DATA")
	console.log(req.body)
	collection.find({
		"_id" : req.body.bookId
	},{}).then(function(doc,err) {
		if (doc.length === 0 || err) {
			res.send("Problem");//NEED TO FIX THIS- send a message that there was nothing found
		} else {
			console.log("FIRING END OF BOOK RETRIEVE ONE")
			sendJsonResponse(res, 201, doc)
		}
	})
}


module.exports.bookRetrieveList = function(req,res) {
	console.log("ANGULAR REQUEST FIRED")
	collection.find({}).then(function(doc,err) {
		if(err) {
			res.send("Problem");
		} else {
			console.log("ANGULAR REQUEST SUCCESSFUL")
			console.log(doc)
			sendJsonResponse(res, 200, doc)
		}
	})
}


module.exports.bookUpdateOne = function(req,res) {
	collection.update({"title":req.body.title},{
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
