var monk = require('monk');
var assert = require('assert');
var asynch = require('asynch');
var bcrypt = require('bcryptjs');
var db = monk('localhost:27017/bookdb');
var collection = db.get('usercollection');
var staffcollection = db.get('users');


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
				//"email": req.body.email
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
	console.log("REQUEST REACHED API", req.body)
	collection.find({
		"_id" : req.body.entryId
	},{}).then(function(doc,err) {
		console.log("USER RETRIEVE BODY RESPONSE", doc)
		if (doc.length === 0 || err) {
			res.send("Problem");//NEED TO FIX THIS- send a message that there was nothing found
		} else {
			sendJsonResponse(res, 201, doc)
		}
	})
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
	console.log("USER API UPDATE FIRED", req.body)
	collection.update({"_id":req.body.entryId},{
		"_id":req.body.entryId,
		"name": req.body.name,
		"idnumber": req.body.studentId,
		"phone": req.body.phone,
		"email": req.body.email
	}).then(function(doc, err) {
		if (err) {
			res.send("Problem");
		} else {
			sendJsonResponse(res, 201, doc)
		}
	}) 
}

module.exports.userDeleteOne = function(req,res) {
	console.log("Test");
}


module.exports.staffCreateOne = function(req, res) {
	console.log("STAFF CREATE ONE FUNCTION")
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(req.body.password, salt, function(err, hash) {
			req.body.password = hash;
			console.log(req.body.password)
			staffcollection.insert({
				"name":  req.body.name,
				"email": req.body.email,
				"password": req.body.password,
				"group": req.body.group
			}).then(function(doc,err) {
				console.log("RESPONSE SENDS")
				if (err) {
					res.send("Problem")
				} else {
					sendJsonResponse(res, 201, doc);
				}
			})
		})
	})
}