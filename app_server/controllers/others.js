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


var getUserInfo = function(req, res, callback) {
	var requestOptions, path;
	path = '/api/users'
	requestOptions = {
		url: apiOptions.server + path,
		method: "GET",
		json: {}
	};
	request(
		requestOptions,
		function(err, response, body) {
			var data = body;
			if(response.statusCode === 200  && data.length) {
				req.session.flash = {
					type: "success",
					message: "The users information has been retrieved."
				}
				callback(req, res, data);
			} else {
				_showError(req, res, response.statusCode);
			}
		}
	)
}

var renderUserPage = function(req, res, responseBody) {
	res.render('users')
}


module.exports.users = function(req, res) {
	renderUserPage(req, res)
};

module.exports.addUser = function(req, res) {
	res.render('addusers')
}

module.exports.doAddUser = function(req, res) {
	var requestOptions, path, postdata;
	path = '/api/users';
	postdata = {
		name: req.body.name,
		idnumber: req.body.id,
		phone: req.body.phone,
		//email: req.body.email
	};
	requestOptions = {
		url: apiOptions.server + path,
		method:"POST",
		json: postdata
	};
	if(!postdata.name || !postdata.idnumber || !postdata.phone /*|| !postdata.email */) {
		req.session.flash = {
			type: "failure",
			message: "Data missing.  Please make sure to enter all information."
		}
		res.redirect('/user/new?err=val');
	} else {
		request(
			requestOptions,
			function(err, response, body) {
				if(response.statusCode === 201) {
					req.session.flash = {
						type: "success",
						message: "The user has been added."
					}
					res.redirect('/user/add')
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					req.session.flash = {
						type: "failure",
						message: "The data could not be validated."
					}
					res.redirect('back')
				} else if (response.statusCode === 409) {
					req.session.flash = {
						type: "failure",
						message: "A user with that id is already in the database."
					}
					res.redirect('back')
				} else {
					_showError(req, res, response.statusCode)
				}
			}
		)
	}
}

module.exports.editUser = function(req, res) {
	var requestOptions, path, studentid, postdata
	entryid = req.body._id;
	path = '/api/users/:studentid'
	postdata = {
		entryId: entryid
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "GET",
		json: postdata
	};

	if (!postdata.entryId) {
		req.session.flash = {
			type: "failure",
			message: "No user id was input."
		}
		res.redirect('back')
	} else {
		request(
			requestOptions,
			function(err, response, body) {
				if(response.statusCode === 201) {
					res.render('edituser', {
						"userentry": body
					})
				} else if (response.statusCode === 400 & body.name === "ValidationError") {
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

module.exports.doUpdateUser = function(req, res) {
	var requestOptions, path, studentid, updatedata;
	studentid = req.body.id;
	path = '/api/users/:studentid'
	updatedata = {
		entryId: req.body._id,
		name: req.body.name,
		studentId: req.body.id,
		phone: req.body.phone,
		email: req.body.email
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: "PUT",
		json: updatedata
	}
	if(!updatedata.entryId || !updatedata.name || !updatedata.studentId || !updatedata.phone || !updatedata.email) {
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
					res.redirect('/user/list')
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

module.exports.analytics = function(req, res) {
		res.render('analytics', {
		title: 'Analytics',
		content: 'Analytics Page'
	})
}

module.exports.thanks = function(req, res) {
		res.render('thanks', {
		title: 'Thanks',
		content: "Wow"
	})
}


module.exports.staffLogin = function(req, res) {
	res.render('login', {
		title: 'Staff Login',
		content: "Wow"
	})
}

module.exports.addStaff = function(req, res) {
	res.render('registration', {
		title: 'Staff Accounts',
		content: "Wow"
	})
}

module.exports.doAddStaff = function(req, res) {
	var requestOptions, path, postdata;
	path = '/api/users/staff';
	if(req.body.password != req.body.password2) {
		req.session.flash = {
			type: "failure",
			message: "Please make sure the passwords match."
		}
		res.redirect('back')
		return;
	}
	postdata = {
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		password2: req.body.password2,
		group: req.body.group
	}
	requestOptions = {
		url: apiOptions.server + path,
		method:"POST",
		json: postdata
	};
	
	if(!postdata.name || !postdata.email || !postdata.password || !postdata.password2 || !postdata.group) {
		req.session.flash = {
			type: "failure",
			message: "Data missing.  Please make sure to enter all information."
		}
		res.redirect('/user/staff/registration');
	} else {
		request(
			requestOptions,
			function(err, response, body) {
				if(response.statusCode === 201) {
					req.session.flash = {
						type: "success",
						message: "The user has been added."
					}
					res.redirect('/user/staff/registration')
				} else if (response.statusCode === 400 && body.name === "ValidationError") {
					req.session.flash = {
						type: "failure",
						message: "The data could not be validated."
					}
					res.redirect('back')
				} else if (response.statusCode === 409) {
					req.session.flash = {
						type: "failure",
						message: "A user with that id is already in the database."
					}
					res.redirect('back')
				} else {
					_showError(req, res, response.statusCode)
				}
			}
		)
	}
}
