var monk = require('monk');
var assert = require('assert');
var asynch = require('asynch');
var db = monk('localhost:27017/bookdb');
var chkcoll = db.get('checkoutcollection');
var bkcoll = db.get('bookcollection');
var usercoll = db.get('usercollection');
var analyticscoll = db.get('analyticscollection');

var sendJsonResponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};





//Need to finish working on this



module.exports.checkoutCreateOne = function(req,res) {
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
		}, ["title","publisher","level.ILER"]).then(function(doc, err) {
			if (doc.length === 0) {
				res.send("No book with that code is in the database.")
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
							"publisher":doc[0].publisher,
							"level":doc[0].level.ILER,
							"code": book1Code, 
							"id":1,
						}, 
						book2: {
							"title":doc[1].title, 
							"publisher":doc[1].publisher,
							"level":doc[1].level.ILER,
							"code": book2Code, 
							"id":2,
						}, 
						book3: {
							"title":doc[2].title, 
							"publisher":doc[2].publisher,
							"level":doc[2].level.ILER,
							"code": book3Code, 
							"id":3,
						}
					}
				} else if (doc.length === 2) {
					bookQuery = {
						book1: {
							"title":doc[0].title, 
							"publisher":doc[0].publisher,
							"level":doc[0].level.ILER,
							"code": book1Code, 
							"id":1,
						}, 
						book2: {
							"title":doc[1].title, 
							"publisher":doc[1].publisher,
							"level":doc[1].level.ILER,
							"code": book2Code, 
							"id":2,
						}
					}
				} else {
					bookQuery = {
						book1: {
							"title":doc[0].title,
							"publisher":doc[0].publisher,
							"level":doc[0].level.ILER, 
							"code": book1Code, 
							"id":1,
						}
					}
				}
				fullQuery = {
					"books": bookQuery,
					"borrowed": req.body.borrowCD,
					"student": {
						"name": userDoc[0].name,
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
					if( doc2.books.book1 && doc2.books.book2 && doc2.books.book3) {
						updateQuery = {
							$or: [{"numbers.book": doc2.books.book1.code}, {"numbers.book": doc2.books.book2.code}, {"numbers.book": doc2.books.book3.code}]
						}
					} else if ( doc2.books.book1 && doc2.books.book2) {
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

					if(req.body.borrowCD === "yes") {
						incQuery = {
							"attributes.CDTotal":-1,
							"attributes.CDCheckouts":1,
							"availability.total":-1,
							"availability.checkouts":1
						}
					} else {
						incQuery = {
							"availability.total":-1,
							"availability.checkouts":1
						}
					}

					bkcoll.update(updateQuery, {
						$inc: incQuery
					},{"multi":true}).then(function (doc3,err3) {
						analyticsQuery = {
							timestamp: req.body.checkoutDate,
							actor: {
								idnumber: userDoc[0].idnumber,
								teacher: req.body.teacher
							},
							verb: {
								display: "borrowed"
							},
							object: {
								definition: {
									codes: bookQuery,
									duedate: req.body.returnDate,
								}
							}
						}
						analyticscoll.insert(analyticsQuery).then(function(doc4, err4) {
							if (err3) {
								res.send("Problem Updating Book Collection");
							} else {
								sendJsonResponse(res, 201, doc3);
							}
						})
					})
					})
			}
		})
	})
}

module.exports.checkoutRetrieveOne = function(req,res) {
	console.log("Test");
}

module.exports.checkoutRetrieveList = function(req,res) {
	chkcoll.find({"status": "active"}).then(function(doc,err) {
		if(err) {
			res.send("Problem");
		} else {
			sendJsonResponse(res, 200, doc)
		}
	})
}

module.exports.checkoutArchiveList = function(req,res) {
	chkcoll.find({"status": "archived"}).then(function(doc,err) {
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
	var newCheckoutDate = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();

	var due = new Date();
	due.setDate(due.getDate() + 21);
	var newReturnDate = due.getFullYear() + '-' + (due.getMonth()+1) + '-' + due.getDate();

	chkcoll.update({
		_id: data, 
	}, {
		$set:{"dates.checkoutDate": newCheckoutDate, "dates.returnDate": newReturnDate}
	}).then(function(doc, err) {
		analyticsQuery = {
			timestamp: req.body.today,
			actor: {
				idnumber: req.body.idnumber,
				teacher: req.body.teacher
			},
			verb: {
				display: "extended"
			},
			object: {
				definition: {
					codes: req.body.bookInfo,
					oldduedate: req.body.returnDate,
					duedate: newReturnDate
				}
			}
		}
		analyticscoll.insert(analyticsQuery).then(function(doc2, err2) {

			if (err) {
				res.send("There was a problem adding the information to the database.")
			} else {
				sendJsonResponse(res, 200, doc)
			}
		})
	})
}


module.exports.checkoutDeleteOne = function(req,res) {
	console.log("CHECKOUT DELETE REQ BODY", req.body)
	var data = req.body._id;
	var bkcodes = req.body.codes
	var query;


	chkcoll.update({
		_id:data
	}, {
		$set:{"status": "archived", "dates.archived": req.body.today}
	}).then(function(doc, err) {
		if (err) {
			res.send("There was a problem adding the information to the database.")
		} else {
			if (bkcodes.length == 3) {
				query = [{"numbers.book": bkcodes[0]},{"numbers.book": bkcodes[1]},{"numbers.book": bkcodes[2]}]
			} else if (bkcodes.length == 2) {
				query = [{"numbers.book": bkcodes[0]},{"numbers.book": bkcodes[1]}]
			} else {
				query = [{"numbers.book": bkcodes[0]}]
			}

			if (req.body.borrowed === "yes") {
				incQuery = {
					"attributes.CDTotal":1,
					"attributes.CDCheckouts":-1,
					"availability.total":1,
					"availability.checkouts": -1
				}
			} else {
				incQuery = {
					"availability.total":1,
					"availability.checkouts": -1
				}
			}

			bkcoll.update({
				$or : query
			}, {
				$inc: incQuery
			},{multi: true}).then(function (doc2, err2) {
				analyticsQuery = {
					timestamp: req.body.today,
					actor: {
						idnumber: req.body.idnumber,
						teacher: req.body.teacher
					},
					verb: {
						display: "returned"
					},
					object: {
						definition: {
							codes: req.body.bookInfo,
							duedate: req.body.returnDate,
						}
					}
				}
				analyticscoll.insert(analyticsQuery).then(function(doc3, err3) {
					if (err2) {
						res.send("Problem Updating Book Collection");
					} else {
						sendJsonResponse(res, 200, doc2);
					}					
				})
			})
		}
	})


}

module.exports.checkoutRetrieveOverdueList = function(req, res) {
	console.log("REQ BODY OVERDUE ENTRY", req.body)
	console.log("REQ BODY OVERDUE DATE", req.body.date)
	var date = "2017-10-23"
	console.log("VARIABLE OVERDUE DATE", date)
	var path = require('path');
	var spawn = require('child_process').spawn;

	var mongoExport = spawn('mongoexport', [
		'--db', 'bookdb', 
		'--collection', 'checkoutcollection',
		'--type','csv',
		'--query','{$and: [{"dates.returnDate": {$lt:'+ '"' + req.body.date +'"'+'}}, {"status": "active"}]}',
		'--fields', 'student.name,student.studentId,student.studentPhone,books.book1.title,books.book1.code,books.book2.title,books.book2.code,books.book3.title,books.book3.code,dates.checkoutDate,dates.returnDate',
		'--out', path.resolve(".") + '/files/' + 'backup.csv'
	]);

	res.set('Content-Type','text/csv')
	mongoExport.stdout.pipe(res)
}

