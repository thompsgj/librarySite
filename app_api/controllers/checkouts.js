var monk = require('monk');
var assert = require('assert');
var asynch = require('asynch');
var db = monk('localhost:27017/bookdb');
var chkcoll = db.get('checkoutcollection');
var bkcoll = db.get('bookcollection');

var sendJsonResponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};





//Need to finish working on this
module.exports.checkoutCreateOne = function(req,res) {
	console.log("BOOK COLLECTION LOOKUP")
	bkcoll.find({
		$or: [{
			"numbers.book": parseInt(req.body.code[0]),
		}, {
			"numbers.book": parseInt(req.body.code[1]),
		}, {
			"numbers.book": parseInt(req.body.code[2])
		}]
	}, ["title"]).then(function(doc, err) {
		console.log("SET SEARCH QUERY")
		var book1Code, book2Code, book3Code, query;

		book1Code = req.body.code[0] ? parseInt(req.body.code[0]) : -1;
		book2Code = req.body.code[1] ? parseInt(req.body.code[1]) : -1;
		book3Code = req.body.code[2] ? parseInt(req.body.code[2]) : -1;

		if (doc.length === 3) {
			query = {
				"book1": {
					"title":doc[0].title, 
					"code": book1Code, 
					"id":1
				},
				"book2": {
					"title":doc[1].title, 
					"code": book2Code, 
					"id":2
				},
				"book3": {
					"title":doc[2].title, 
					"code": book3Code, 
					"id":3
				},
				"student": {
					"studentId": req.body.studentId, 
					"studentPhone": req.body.studentPhone, 
					"teacher": req.body.teacher
				},
				"dates": {
					"checkoutDate": req.body.checkoutDate,
					"returnDate": req.body.returnDate
				}
			}
		} else if (doc.length === 2) {
			console.log("FIRED")
			query = {
				"book1": {
					"title":doc[0].title, 
					"code": book1Code, 
					"id":1
				},
				"book2": {
					"title":doc[1].title, 
					"code": book2Code, 
					"id":2
				},
				"student": {
					"studentId": req.body.studentId, 
					"studentPhone": req.body.studentPhone, 
					"teacher": req.body.teacher
				},
				"dates": {
					"checkoutDate": req.body.checkoutDate,
					"returnDate": req.body.returnDate
				}
			}
		} else {
			query = {
				"book1": {
					"title":doc[0].title, 
					"code": book1Code, 
					"id":1
				},
				"student": {
					"studentId": req.body.studentId, 
					"studentPhone": req.body.studentPhone, 
					"teacher": req.body.teacher
				},
				"dates": {
					"checkoutDate": req.body.checkoutDate,
					"returnDate": req.body.returnDate
				}
			}
		}
		console.log(query)
		console.log("EXECUTE SEARCH QUERY")
		chkcoll.insert(query).then(function(doc2, err2) {
			var query2;
			console.log("EXECUTE BOOK UPDATE QUERY")
			console.log(doc2)
			if( doc2.book1 && doc2.book2 && doc2.book3) {
				query2 = {
					$or: [{"numbers.book": doc2.book1.code}, {"numbers.book": doc2.book2.code}, {"numbers.book": doc2.book3.code}]
				}
			} else if ( doc2.book1 && doc2.book2) {
				console.log("CONDITIONAL FIRED")
				query2 = {
					$or: [{"numbers.book": doc2.book1.code}, {"numbers.book": doc2.book2.code}]
				}
			} else if ( doc2.book1 ) {
				query2 = {
					$or: [{"numbers.book": doc2.book1.code}]
				}
			} else {
				//err function
				res.send("Problem");
			}

			bkcoll.update(query2, {
				$inc: {"availability.total":-1, "availability.checkouts":1}
			},{"multi":true}).then(function (doc3,err3) {
				console.log("STEP THREE- send response back")
				console.log(doc3)
				if (err3) {
					console.log("ERROR IN BOOK COLLECTION")
					res.send("Problem Updating Book Collection");
				} else {
					sendJsonResponse(res, 201, doc3);
				}
			})
			})
	})
}


module.exports.checkoutRetrieveOne = function(req,res) {
	console.log("Test");
}

module.exports.checkoutRetrieveList = function(req,res) {
	chkcoll.find({}).then(function(doc,err) {
		if(err) {
			res.send("Problem");
		} else {
			sendJsonResponse(res, 200, doc)
		}
	})
}

module.exports.checkoutUpdateOne = function(req,res) {
	var data = req.body._id;


	var today = new Date();
	var checkoutDate = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();

	var due = new Date();
	due.setDate(due.getDate() + 15);
	var returnDate = due.getFullYear() + '-' + (due.getMonth()+1) + '-' + due.getDate();
	

	chkcoll.update({
		_id: data, 
	}, {
		$set:{checkoutDate: checkoutDate, returnDate: returnDate}
	}).then(function(doc, err) {
		console.log("DOC")
		console.log(doc)
		console.log("ERR")
		console.log(err)
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {
			sendJsonResponse(res, 200, doc)
		}
	})
}


module.exports.checkoutDeleteOne = function(req,res) {
	console.log("CHECKOUTDELETEONE API")
	var data = req.body._id;
	var code = req.body.code

	chkcoll.remove({
		_id: data
	}, {
		justOne: true
	}).then(function(doc, err) {
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {
			bkcoll.update({
				"numbers.book" : code
			}, {
				$inc: {"availability.total":1, "availability.checkouts": -1}
			}).then(function (doc2, err2) {
				if (err2) {
					res.send("Problem Updating Book Collection");
				} else {
					sendJsonResponse(res, 200, doc2);
				}
			})
		}
	})
}

