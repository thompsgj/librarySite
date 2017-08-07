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
		attributes: {"headwords": req.body.head, "type": req.body.type, "genre": req.body.genre, "CD": req.body.cd},
		availability: {"total": parseInt(req.body.total), "checkouts": 0}
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "POST",
		json: postdata
	};
	if (!postdata.title || !postdata.author || !postdata.publisher || !postdata.series || !postdata.level.ILER || !postdata.numbers.book || !postdata.numbers.ISBN || !postdata.attributes.headwords || !postdata.attributes.type || !postdata.attributes.genre || !postdata.attributes.CD || !postdata.availability.total) {
		res.redirect('/addinv/new?err=val');
	} else {
		request(
			requestOptions,
			function(err, response, body) {
				if (response.statusCode === 201) {
					res.redirect('/thanks')
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					res.redirect('/addinv/new?err=val')
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
	console.log(deletedata)
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
					res.set({'Content-Type':'application/json'});
					res.end(JSON.stringify({response:'json'}));
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					res.redirect('/deletebook/new?err=val');
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
					res.redirect('/update/new?err=val')
				} else {
					_showError(req, res, response.statusCode)
				}
			}
		)
	}
}

module.exports.doUpdateBook = function(req, res) {
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
		attributes: {"headwords": req.body.head, "type": req.body.type, "genre": req.body.genre, "CD": req.body.cd},
		availability: {"total": parseInt(req.body.total), "checkouts": 0}
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "PUT",
		json: updatedata
	};
	if (!updatedata.title || !updatedata.author || !updatedata.publisher || !updatedata.series || !updatedata.level.ILER || !updatedata.numbers.book || !updatedata.numbers.ISBN || !updatedata.attributes.headwords || !updatedata.attributes.type || !updatedata.attributes.genre || !updatedata.attributes.CD || !updatedata.availability.total) {
		res.redirect('/update/new?err=val');
	} else {
		request(
			requestOptions,
			function(err, response, body) {
				if (response.statusCode === 201) {
					res.redirect('/thanks')
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					res.redirect('/update/new?err=val')
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
	due.setDate(due.getDate() + 15)
	var returnDate = due.getFullYear() + '-' + (due.getMonth()+1) + '-' + due.getDate()

	var bkNumber = req.body.code;
	var bkNumArr = [];
		bkNumArr = bkNumber.split(',').map(Number);

	path = '/api/checkouts/';
	postdata = {
		code: bkNumArr,
		studentId: req.body.id,
		studentPhone: req.body.phone,
		teacher: req.body.teacher,
		checkoutDate: checkoutDate,
		returnDate: returnDate
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "POST",
		json: postdata
	};
	if (!postdata.code || !postdata.studentId || !postdata.studentPhone || !postdata.teacher) {
		res.redirect('/checkout/new?err=val');
	} else {
		request(
			requestOptions,
			function(err, response, body) {
				if (response.statusCode === 201) {
					res.redirect('/thanks')
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					res.redirect('/checkout/new?err=val')
				} else {
					_showError(req, res, response.statusCode)
				}
			}
		)
	}
}


var renderCheckoutListPage = function(req, res, responseBody) {
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
}

module.exports.checkoutList = function(req, res) {
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
}

module.exports.returnBook = function(req, res) {
	var requestOptions, deletedata, path;
	path = '/api/checkouts/';
	deletedata = {
		_id : req.body._id,
		code: req.body.code
	};
	console.log(deletedata)
	requestOptions = {
		url: apiOptions.server + path,
		method: "DELETE",
		json: deletedata
	};
	if (!deletedata._id) {
		res.redirect('/checkoutlist/new?err=val');
	} else {
		request(
			requestOptions,		
			function(err, response, body) {
				if (response.statusCode === 200) {
					res.set({'Content-Type':'application/json'});
					res.end(JSON.stringify({response:'json'}));
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
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
	updatedata = {
		_id : req.body._id
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "PUT",
		json: updatedata
	};
	if (!updatedata._id) {
		res.redirect('/checkoutlist/new?err=val');
	} else {
		request(
			requestOptions,		
			function(err, response, body) {
				if (response.statusCode === 200) {
					res.set({'Content-Type':'application/json'});
					res.end(JSON.stringify({response:'json'}));
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					res.redirect('/checkoutlist/new?err=val');
				} else {
					_showError(req, res, response.statusCode);
				}
			}
		)
	}
}

module.exports.doCheckoutDelete = function(req, res) {
	var requestOptions, path;
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