var monk = require('monk');
var assert = require('assert');
var asynch = require('asynch');
var db = monk('localhost:27017/bookdb');
var chkcoll = db.get('checkoutcollection');
var bkcoll = db.get('bookcollection');
var usercoll = db.get('usercollection');

var sendJsonResponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};





//Need to finish working on this



module.exports.checkoutCreateOne = function(req,res) {
	console.log("USER COLLECTION LOOKUP")
	console.log(req.body)
	usercoll.find({
		"idnumber": req.body.studentId
	}).then(function(userDoc, err){

		bkcoll.find({
			$or: [{
				"numbers.book": parseInt(req.body.code[0]),
			}, {
				"numbers.book": parseInt(req.body.code[1]),
			}, {
				"numbers.book": parseInt(req.body.code[2])
			}]
		}, ["title"]).then(function(doc, err) {
			if (doc.length === 0) {
				res.send("No student with that id number is in the database.")
			} else if (userDoc.length === 0) {
				res.send("No student with that id number is in the database.")
			} else {
				var book1Code, book2Code, book3Code, bookQuery, fullQuery, updateQuery;

				book1Code = req.body.code[0] ? parseInt(req.body.code[0]) : -1;
				book2Code = req.body.code[1] ? parseInt(req.body.code[1]) : -1;
				book3Code = req.body.code[2] ? parseInt(req.body.code[2]) : -1;

				if (doc.length === 3) {
					bookQuery = {
						book1: {
							"title":doc[0].title, 
							"code": book1Code, 
							"id":1,
						}, 
						book2: {
							"title":doc[1].title, 
							"code": book2Code, 
							"id":2,
						}, 
						book3: {
							"title":doc[2].title, 
							"code": book3Code, 
							"id":3,
						}
					}
				} else if (doc.length === 2) {
					bookQuery = {
						book1: {
							"title":doc[0].title, 
							"code": book1Code, 
							"id":1,
						}, 
						book2: {
							"title":doc[1].title, 
							"code": book2Code, 
							"id":2,
						}
					}
				} else {
					////////////////////ADD HERE IF DOC IS UNDEFINED AND DO ERROR HANDLING
					bookQuery = {
						book1: {
							"title":doc[0].title, 
							"code": book1Code, 
							"id":1,
						}
					}
				}

				fullQuery = {
					books: bookQuery,
					"student": {
						"studentId": userDoc[0].idnumber, 
						"studentPhone": userDoc[0].phone,
						"studentEmail": userDoc[0].email,
						"teacher": req.body.teacher
					},
					"dates": {
						"checkoutDate": req.body.checkoutDate,
						"returnDate": req.body.returnDate
					},
					"status": "active"
				}
				chkcoll.insert(fullQuery).then(function(doc2, err2) {
					console.log("EXECUTE BOOK UPDATE QUERY")
					console.log(doc2)
					if( doc2.books.book1 && doc2.books.book2 && doc2.books.book3) {
						updateQuery = {
							$or: [{"numbers.book": doc2.books.book1.code}, {"numbers.book": doc2.books.book2.code}, {"numbers.book": doc2.books.book3.code}]
						}
					} else if ( doc2.books.book1 && doc2.books.book2) {
						console.log("CONDITIONAL FIRED")
						updateQuery = {
							$or: [{"numbers.book": doc2.books.book1.code}, {"numbers.book": doc2.books.book2.code}]
						}
					} else if ( doc2.books.book1 ) {
						updateQuery = {
							$or: [{"numbers.book": doc2.books.book1.code}]
						}
					} else {
						//err function
						res.send("Problem");
					}

					bkcoll.update(updateQuery, {
						$inc: {"availability.total":-1, "availability.checkouts":1}
					},{"multi":true}).then(function (doc3,err3) {
						if (err3) {
							console.log("ERROR IN BOOK COLLECTION")
							res.send("Problem Updating Book Collection");
						} else {
							sendJsonResponse(res, 201, doc3);
						}
					})
					})
			}
		})
	})
}
/*
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
		console.log(doc)

		if (doc.length === 0) {
			res.send("The database didn't find book with that code.")
		} else {
			var book1Code, book2Code, book3Code, bookQuery, fullQuery, updateQuery;

			book1Code = req.body.code[0] ? parseInt(req.body.code[0]) : -1;
			book2Code = req.body.code[1] ? parseInt(req.body.code[1]) : -1;
			book3Code = req.body.code[2] ? parseInt(req.body.code[2]) : -1;

			if (doc.length === 3) {
				bookQuery = {
					book1: {
						"title":doc[0].title, 
						"code": book1Code, 
						"id":1,
					}, 
					book2: {
						"title":doc[1].title, 
						"code": book2Code, 
						"id":2,
					}, 
					book3: {
						"title":doc[2].title, 
						"code": book3Code, 
						"id":3,
					}
				}
			} else if (doc.length === 2) {
				bookQuery = {
					book1: {
						"title":doc[0].title, 
						"code": book1Code, 
						"id":1,
					}, 
					book2: {
						"title":doc[1].title, 
						"code": book2Code, 
						"id":2,
					}
				}
			} else {
				////////////////////ADD HERE IF DOC IS UNDEFINED AND DO ERROR HANDLING
				bookQuery = {
					book1: {
						"title":doc[0].title, 
						"code": book1Code, 
						"id":1,
					}
				}
			}
			fullQuery = {
				books: bookQuery,
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
			console.log(bookQuery)
			console.log(fullQuery)
			console.log("EXECUTE SEARCH QUERY")
			chkcoll.insert(fullQuery).then(function(doc2, err2) {
				console.log("EXECUTE BOOK UPDATE QUERY")
				console.log(doc2)
				if( doc2.books.book1 && doc2.books.book2 && doc2.books.book3) {
					updateQuery = {
						$or: [{"numbers.book": doc2.books.book1.code}, {"numbers.book": doc2.books.book2.code}, {"numbers.book": doc2.books.book3.code}]
					}
				} else if ( doc2.books.book1 && doc2.books.book2) {
					console.log("CONDITIONAL FIRED")
					updateQuery = {
						$or: [{"numbers.book": doc2.books.book1.code}, {"numbers.book": doc2.books.book2.code}]
					}
				} else if ( doc2.books.book1 ) {
					updateQuery = {
						$or: [{"numbers.book": doc2.books.book1.code}]
					}
				} else {
					//err function
					res.send("Problem");
				}

				bkcoll.update(updateQuery, {
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
		}
	})
}
*/

module.exports.checkoutRetrieveOne = function(req,res) {
	console.log("Test");
}

module.exports.checkoutRetrieveList = function(req,res) {
	console.log("RETRIEVE LIST")
	chkcoll.find({"status": "active"}).then(function(doc,err) {
		if(err) {
			res.send("Problem");
		} else {
			sendJsonResponse(res, 200, doc)
		}
	})
}

module.exports.checkoutArchiveList = function(req,res) {
	console.log("ARCHIVE API CALL")
	chkcoll.find({"status": "archived"}).then(function(doc,err) {
		if(err) {
			res.send("Problem");
		} else {
			console.log("SUCCESSFUL API RESPONSE")
			console.log(doc)
			sendJsonResponse(res, 200, doc)
		}
	})
}


module.exports.checkoutUpdateOne = function(req,res) {
	console.log("CHECKOUT UPDATE ONE FUNCTION")
	console.log(req.body)
	var data = req.body._id;
	var today = new Date();
	var newCheckoutDate = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();

	var due = new Date();
	due.setDate(due.getDate() + 15);
	var newReturnDate = due.getFullYear() + '-' + (due.getMonth()+1) + '-' + due.getDate();

	chkcoll.update({
		_id: data, 
	}, {
		$set:{"dates.checkoutDate": newCheckoutDate, "dates.returnDate": newReturnDate}
	}).then(function(doc, err) {
		console.log(doc)
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
	var codes = req.body.codes
	var query;
	console.log("CODE")
	console.log(codes)

	chkcoll.update({
		_id:data
	}, {
		$set:{"status": "archived"}
	}).then(function(doc, err) {
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {
			if (codes.length == 3) {
				query = [{"numbers.book": codes[0]},{"numbers.book": codes[1]},{"numbers.book": codes[2]}]
			} else if (codes.length == 2) {
				query = [{"numbers.book": codes[0]},{"numbers.book": codes[1]}]
			} else {
				query = [{"numbers.book": codes[0]}]
			}
			bkcoll.update({
				$or : query
			}, {
				$inc: {"availability.total":1, "availability.checkouts": -1}
			},{multi: true}).then(function (doc2, err2) {
				if (err2) {
					res.send("Problem Updating Book Collection");
				} else {
					sendJsonResponse(res, 200, doc2);
				}
			})
		}
	})

	/* THIS CODE WILL ACTUALLY DELETE THE ENTRY
	chkcoll.remove({
		_id: data
	}, {
		justOne: true
	}).then(function(doc, err) {
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {

			if (codes.length == 3) {
				query = [{"numbers.book": codes[0]},{"numbers.book": codes[1]},{"numbers.book": codes[2]}]
			} else if (codes.length == 2) {
				query = [{"numbers.book": codes[0]},{"numbers.book": codes[1]}]
			} else {
				query = [{"numbers.book": codes[0]}]
			}
			bkcoll.update({
				$or : query
			}, {
				$inc: {"availability.total":1, "availability.checkouts": -1}
			},{multi: true}).then(function (doc2, err2) {
				if (err2) {
					res.send("Problem Updating Book Collection");
				} else {
					sendJsonResponse(res, 200, doc2);
				}
			})
		}
	})
	*/
}

module.exports.checkoutRetrieveOverdueList = function(req, res) {
	console.log("OVERDUE LIST API FUNCTION")
	var path = require('path');
	var spawn = require('child_process').spawn;
	var mongoExport = spawn('mongoexport', [
		'--db', 'bookdb', 
		'--collection', 'checkoutcollection',
		'--type','csv',
		'--query','{"dates.returnDate": {$lt:"2017-8-29"}}',
		'--fields', 'student.studentId,student.studentPhone',
		'--out', path.resolve(".") + '/files/' + 'backup.csv'
	]);

	res.set('Content-Type','text/csv')
	mongoExport.stdout.pipe(res)
}

