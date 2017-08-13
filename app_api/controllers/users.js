var monk = require('monk');
var assert = require('assert');
var asynch = require('asynch');
var db = monk('localhost:27017/bookdb');
var collection = db.get('usercollection');

var sendJsonResponse = function(res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.userCreateOne = function(req,res) {
	collection.find({
		"idnumber": req.body.idnumber
	}).then(function(doc, err) {
		if(doc.length==0) {
			collection.insert({
				"name":  req.body.name,
				"idnumber": req.body.idnumber,
				"phone": req.body.phone,
				"email": req.body.email
			}).then(function(doc,err) {
				if (err) {
					res.send("Problem")
				} else {
					sendJsonResponse(res, 201, doc);
				}
			})
		} else {
			sendJsonResponse(res, 409, doc)
		}
	})
}

module.exports.userRetrieveOne = function(req,res) {
	console.log("Test");
}

module.exports.userRetrieveList = function(req,res) {
	collection.find({}).then(function(doc,err) {
		if(err) {
			res.send("Problem");
		} else {
			sendJsonResponse(res, 200, doc)
		}
	})
}

module.exports.userUpdateOne = function(req,res) {
	console.log("Test");
}

module.exports.userDeleteOne = function(req,res) {
	console.log("Test");
}
