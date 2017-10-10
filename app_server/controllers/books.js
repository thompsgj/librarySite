var request = require('request');
var apiOptions = {
  server: "http://localhost:3000"
};

var _showError = function (req, res, status) {
  var title, content;
  if (status === 404) {
    title = "404, page not found";
    content = "Oh dear. Looks like we can't find this page. Sorry.";
  } else if (status === 500) {
    title = "500, internal server error";
    content = "How embarrassing. There's a problem with our server.";
  } else {
    title = status + ", something's gone wrong";
    content = "Something, somewhere, has gone just a little bit wrong.";
  }
  res.status(status);
  res.render('test', {
    title : title,
    content : content
  });
};


module.exports.home = function(req, res) {
	res.render('home')
}

module.exports.addBook = function(req, res) {
	res.render('addinv');
}

module.exports.doAddBook = function(req, res) {
	var requestOptions, path, postdata;
	var bkNumberInput = req.body.number;
	var bkNumArr = []
	bkNumArr = bkNumberInput.split(',').map(Number);
	path = '/api/books';
	postdata = {
		title: req.body.title,
		author: req.body.author,
		publisher: req.body.pub,
		series: req.body.pubSeries,
		level: {"ILER": parseInt(req.body.level), "Former": req.body.old},
		numbers: {"book": bkNumArr, "ISBN": req.body.isbn},
		attributes: {"headwords": req.body.head, "type": req.body.type, "genre": req.body.genre, "CD": req.body.cd, "CDTotal": parseInt(req.body.cdTotal), "CDCheckouts": 0},
		availability: {"total": parseInt(req.body.total), "checkouts": 0}
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "POST",
		json: postdata
	};
	if (!postdata.title ||
	    !postdata.author ||
	    !postdata.publisher ||
	    !postdata.series ||
	    !postdata.level.ILER ||
	    !postdata.numbers.book ||
	    !postdata.numbers.ISBN ||
	    !postdata.attributes.headwords ||
	    !postdata.attributes.type ||
	    !postdata.attributes.genre ||
	    !postdata.attributes.CD ||
	    !postdata.attributes.CDTotal ||
	    !postdata.availability.total) {
		req.session.flash = {
			type: "failure",
			message: "Data missing.  Please make sure to enter all information."
		}
		res.redirect('/book/list');
	} else {
		request(
			requestOptions,
			function(err, response, body) {
				if (response.statusCode === 201) {
					req.session.flash = {
						type: "success",
						message: "The book was added to the collection successfully."
					}
					res.redirect('/book/add')
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					req.session.flash = {
						type: "failure",
						message: "The data could not be validated."
					}
					res.redirect('back')
				} else if (response.statusCode === 409) {
					req.session.flash = {
						type: "failure",
						message: "A book with that ISBN already exists."
					}
					res.redirect('back')
				} else {
					_showError(req, res, response.statusCode)
				}
			}
		)
	}
}



module.exports.doDeleteBook = function(req, res) {
	var requestOptions, deletedata, path;
	path = '/api/books/';
	deletedata = {
		_id : req.body._id,
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "DELETE",
		json: deletedata
	};
	if (!deletedata._id) {
		res.redirect('/deletebook/new?err=val');
	} else {
		request(
			requestOptions,		
			function(err, response, body) {
				if (response.statusCode === 201) {
					req.session.flash = {
						type: "success",
						message: "The book entry was deleted successfully."
					}
					res.redirect('/book/list');
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					req.session.flash = {
						type: "failure",
						message: "The data could not be validated."
					}
					res.redirect('back');
				} else {
					_showError(req, res, response.statusCode);
				}
			}
		)
	}
}

var renderBookInventoryList = function(req, res, responseBody) {
/*
	var message;
	if(!(responseBody instanceof Array)) {
		message = "API Lookup Error";
		responseBody = [];
	} else {
		if(!responseBody.length) {
			message = "No books checked out."
		}
	}
	res.render('bookinv', {
		bklist: responseBody,
		message: message
	})
*/
	res.render('bookinv');
}

module.exports.bookList = function(req, res) {
/*
	var requestOptions, path;
	path = "/api/books"
	requestOptions = {
		url: apiOptions.server + path,
		method: "GET",
		json: {}
	};
	request(
		requestOptions,
		function(err, response, body) {
			var data = body;
			renderBookInventoryList(req, res, data);
		}
	)
*/
	renderBookInventoryList(req,res);
}

module.exports.searchBookForUpdate = function(req, res) {
	res.render('searchinv');
}

module.exports.updateBook = function(req, res) {
	var requestOptions, path, bookid, postdata;
	console.log("UPDATE BOOK FUNCTION REQ BODY", req.body)
	bookid = req.body._id
	path = '/api/books/:bookid';
	postdata = {
		bookId: bookid
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "GET",
		json: postdata
	};
	if (!postdata.bookId) {
		res.redirect('/update/new?err=val');
	} else {
		request(
			requestOptions,
			function(err, response, body) {
				if (response.statusCode === 201) {
					var level = body[0].level["ILER"]
					var type = body[0].attributes["type"]
					var cd = body[0].attributes["CD"]
					res.render('updateinv', {
						"bookentry" : body,
						"bklevel": level,
						"bktype":type,
						"bkcd":cd
					})
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					req.session.flash = {
						type: "failure",
						message: "The data could not be validated."
					}
					res.redirect('back')
				} else {
					_showError(req, res, response.statusCode)
				}
			}
		)
	}
}

module.exports.doUpdateBook = function(req, res) {
	console.log("DO UPDATE BOOK FUNCTION", req.body)
	var requestOptions, path, updatedata;
	var bkNumber = req.body.number;
	var bkNumArr = [];
		bkNumArr = bkNumber.split(',').map(Number);
	path = '/api/books/';
	updatedata = {
		id: req.body.bookId,
		title: req.body.title,
		author: req.body.author,
		publisher: req.body.pub,
		series: req.body.pubSeries,
		level: {"ILER": parseInt(req.body.level), "Former": req.body.old},
		numbers: {"book": bkNumArr, "ISBN": req.body.isbn},
		attributes: {"headwords": req.body.head, "type": req.body.type, "genre": req.body.genre, "CD": req.body.cd,"CDTotal": parseInt(req.body.cdTotal), "CDCheckouts": parseInt(req.body.CDCheckouts)},
		availability: {"total": parseInt(req.body.total), "checkouts": parseInt(req.body.checkouts)}
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "PUT",
		json: updatedata
	};
	if (!updatedata.title ||
	    !updatedata.author ||
	    !updatedata.publisher ||
	    !updatedata.series ||
	    !updatedata.level.ILER ||
	    !updatedata.numbers.book ||
	    !updatedata.numbers.ISBN ||
	    !updatedata.attributes.headwords ||
	    !updatedata.attributes.type ||
	    !updatedata.attributes.genre ||
	    !updatedata.attributes.CD ||
	    !updatedata.attributes.CDTotal ||
	    !updatedata.availability.total) {
		req.session.flash = {
			type: "failure",
			message: "Data missing.  Please make sure to enter all information."
		}
		res.redirect('back');
	} else {
		request(
			requestOptions,
			function(err, response, body) {
				if (response.statusCode === 201) {
					req.session.flash = {
						type: "success",
						message: "The book entry was updated successfully."
					}
					res.redirect('/book/list')
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					req.session.flash = {
						type: "failure",
						message: "The data could not be validated."
					}
					res.redirect('back')
				} else {
					_showError(req, res, response.statusCode)
				}
			}
		)
	}
}

module.exports.checkoutBook = function(req, res) {
	res.render('checkout');
}

module.exports.doCheckoutBook = function(req, res) {
	var requestOptions, path, postdata;

	var today = new Date();
	var checkoutDate = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();

	var due = new Date();
	due.setDate(due.getDate() + 21)
	var returnDate = due.getFullYear() + '-' + (due.getMonth()+1) + '-' + due.getDate()

	var bkNumber = req.body.code;
	var bkNumArr = [];
		bkNumArr = bkNumber.split(',').map(Number);


	path = '/api/checkouts/';
	postdata = {
		code: bkNumArr,
		borrowCD: req.body.borrowCD,
		studentId: req.body.id,
		teacher: req.body.teacher,
		checkoutDate: checkoutDate,
		returnDate: returnDate
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "POST",
		json: postdata
	};
	if (!postdata.code || !postdata.borrowCD || !postdata.studentId || !postdata.teacher) {
		res.render('checkout', {
			message: "Data is missing or incomplete.  Please fill out all fields with appropriate data."
		})
	} else {
		request(
			requestOptions,
			function(err, response, body) {
				if (response.statusCode === 201) {
					req.session.flash = {
						type: "success",
						message: "The checkout entry was created successfully."
					}
					res.redirect('/book/checkout')
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					req.session.flash = {
						type: "failure",
						message: "The checkout entry was not created successfully.  Please try again."
					}
					res.redirect('back')
				} else {
					//_showError(req, res, response.statusCode)
					res.render('checkout', {
					    message : body
					 });
				}
			}
		)
	}
}


var renderCheckoutListPage = function(req, res, responseBody) {
	/* 
		var message;
		if(!(responseBody instanceof Array)) {
			message = "API Lookup Error";
			responseBody = [];
		} else {
			if(!responseBody.length) {
				message = "No books checked out."
			}
		}
		res.render('checkouts', {
			bklist: responseBody,
			message: message
		})
	*/
	res.render('checkouts');
}

///////////////////////////////////////////HERE
module.exports.checkoutList = function(req, res) {
	/*
	var requestOptions, path;
		path = '/api/checkouts'
		requestOptions = {
			url: apiOptions.server + path,
			method: "GET",
			json: {}
		};
		request(
			requestOptions,
			function(err, response, body) {
				var data = body;
				renderCheckoutListPage(req, res, data)
			}
		);
	*/
	renderCheckoutListPage(req, res);
}

module.exports.returnBook = function(req, res) {
	var requestOptions, deletedata, path, bookCodes, bookQuery;
	bookCodes = [];
	path = '/api/checkouts/';

	var today = new Date();
	var todayDate = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();


	var json = JSON.parse(req.body.books)

	console.log("RETURN BOOK FUNCTION", json)

	for(i = 1; i < Object.keys(json.books).length +1; i++) {
		if (i == 1) {
			bookCodes.push(json.books.book1.code)
		} else if (i == 2) {
			bookCodes.push(json.books.book2.code)
		} else {
			bookCodes.push(json.books.book3.code)
		}
	}

	if (bookCodes.length === 3) {
		bookQuery = {
			book1: {
				"title":json.books.book1.title, 
				"code": json.books.book1.code, 
				"id":1,
			}, 
			book2: {
				"title":json.books.book2.title, 
				"code": json.books.book2.code, 
				"id":2,
			}, 
			book3: {
				"title":json.books.book3.title, 
				"code": json.books.book3.code, 
				"id":3,
			}
		}
	} else if (bookCodes.length === 2) {
		bookQuery = {
			book1: {
				"title":json.books.book1.title, 
				"code": json.books.book1.code, 
				"id":1,
			}, 
			book2: {
				"title":json.books.book2.title, 
				"code": json.books.book2.code, 
				"id":2,
			}
		}
	} else {
		bookQuery = {
			book1: {
				"title":json.books.book1.title, 
				"code": json.books.book1.code, 
				"id":1,
			}
		}
	}

	deletedata = {
		_id : req.body._id,
		codes: bookCodes,
		bookInfo: bookQuery,
		borrowed: json.borrowed,
		teacher: json.student.teacher,
		idnumber: json.student.studentId,
		returnDate: json.dates.returnDate,
		today: todayDate
	};
	console.log("DELETE DATA", deletedata)
	requestOptions = {
		url: apiOptions.server + path,
		method: "DELETE",
		json: deletedata
	};
	if (!deletedata._id) {
		req.session.flash = {
			type: "failure",
			message: "This book id was not found."
		}
		res.redirect('back')
	} else {
		request(
			requestOptions,		
			function(err, response, body) {
				if (response.statusCode === 200) {
					/*
						res.set({'Content-Type':'application/json'});
						res.end(JSON.stringify({response:'json'}));
					*/
					req.session.flash = {
						type: "success",
						message: "The book was returned successfully."
					}
					res.redirect('back')
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					req.session.flash = {
						type: "failure",
						message: "The checkout entry was not deleted."
					}
					res.redirect('/checkoutlist/new?err=val');
				} else {
					_showError(req, res, response.statusCode);
				}
			}
		)
	}
}



module.exports.extendBook = function(req, res) {

	var requestOptions, updatedata, path;
	path = '/api/checkouts/';

	var today = new Date();
	var todayDate = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();

	var json = JSON.parse(req.body.books)

	if (Object.keys(json.books).length === 3) {
		bookQuery = {
			book1: {
				"title":json.books.book1.title, 
				"code": json.books.book1.code, 
				"id":1,
			}, 
			book2: {
				"title":json.books.book2.title, 
				"code": json.books.book2.code, 
				"id":2,
			}, 
			book3: {
				"title":json.books.book3.title, 
				"code": json.books.book3.code, 
				"id":3,
			}
		}
	} else if (Object.keys(json.books).length === 2) {
		bookQuery = {
			book1: {
				"title":json.books.book1.title, 
				"code": json.books.book1.code, 
				"id":1,
			}, 
			book2: {
				"title":json.books.book2.title, 
				"code": json.books.book2.code, 
				"id":2,
			}
		}
	} else {
		bookQuery = {
			book1: {
				"title":json.books.book1.title, 
				"code": json.books.book1.code, 
				"id":1,
			}
		}
	}

	updatedata = {
		_id : req.body._id,
		bookInfo: bookQuery,
		teacher: json.student.teacher,
		idnumber: json.student.studentId,
		returnDate: json.student.returnDate,
		today: todayDate
	};


	requestOptions = {
		url: apiOptions.server + path,
		method: "PUT",
		json: updatedata
	};
	if (!updatedata._id) {
		req.session.flash = {
			type: "failure",
			message: "This book id was not found."
		}
		res.redirect('back')
	} else {
		request(
			requestOptions,		
			function(err, response, body) {
				if (response.statusCode === 200) {
					req.session.flash = {
						type: "success",
						message: "The book has been extended."
					}
					/*
					res.set({'Content-Type':'application/json'});
					res.end(JSON.stringify({response:'json'}));
					*/
					res.redirect('back')
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					req.session.flash = {
						type: "failure",
						message: "The book was not extended."
					}
					res.redirect('/checkoutlist/new?err=val');
				} else {
					_showError(req, res, response.statusCode);
				}
			}
		)
	}
}

module.exports.doCheckoutDelete = function(req, res) {
	var requestOptions, deletedata, path;
	path = '/api/checkouts';
	deletedata = {
		title: req.body.title,
		code: req.body.code,
		studentId: req.body.id,
		studentPhone: req.body.phone,
		teacher: req.body.teacher,
		checkoutDate: checkoutDate,
		returnDate: returnDate
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "DELETE",
		json: {}
	};
	request(
		requestOptions,
		function(err, response, body) {
			var data = body;
			renderCheckoutListPage(req, res, data)
		}
	);
}

module.exports.downloadOverdue = function(req, res) {
	/*
		Set the date parameter (today's date)DONE
		send parameters to APIDONE
			[AT API
				Use date parameter to find all due dates before today
				query database && export results
				db.checkoutcollection.find({"dates.returnDate": {$lt:"2017-8-28"}})
				create file
				send back file name overduelist%today'sDate%
			]
		use file name to download the file

	*/

	var requestOptions, postdata, path, today, fileDate
	today = new Date();
	fileDate = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
	path = '/api/checkouts/overduelist'
	postdata = {
		date: fileDate
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "GET",
		json: postdata
	};
	request(
		requestOptions,
		function(err, response, body) {
				var filePath = require('path');
				var file = 'backup.csv'
				path = filePath.resolve(".") + '/files/' + file;
				res.download(path)

		}
	)
}



var renderCheckoutArchiveListPage = function(req, res, responseBody) {
	res.render('checkoutsArchive');
}

module.exports.checkoutArchiveList = function(req, res) {
	renderCheckoutArchiveListPage(req, res);
}

module.exports.downloadBookList = function(req, res) {
	var path, requestOptions;
	path = '/api/book/backup'

	requestOptions = {
		url: apiOptions.server + path,
		method: "GET",
		json: {message:"booklist"}
	};
	request(
		requestOptions,
		function(err, response, body) {

				var filePath = require('path');
				var file = 'bkcolbackup.csv'
				path = filePath.resolve(".") + '/files/' + file;
				res.download(path)
		}
	)
}
