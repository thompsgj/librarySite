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


//Total Number of Books
module.exports.analyticsBookCount = function(req,res) {
	bkcoll.aggregate([
		{$group:{
			_id:0,
			totalSum: {
				$sum:"$availability.total"
			},
			checkoutSum: {
				$sum:"$availability.checkouts"
			}
		}},
		{$project:{
			total: {
				$add: [
					"$totalSum",
					"$checkoutSum"
				]
			}
		}}
	]).then(function(queryResponse, err) {
		if(queryResponse == 0) {
			sendJsonResponse(res, 400, queryResponse)			
		} else {
			sendJsonResponse(res, 201, queryResponse)
		}
	})
}


//Total Number of Distinct Books
module.exports.analyticsDistinctBookCount = function(req,res) {
	bkcoll.count({}).then(function(queryResponse, err){
		if(queryResponse == 0) {
			sendJsonResponse(res, 400, queryResponse)			
		} else {
			sendJsonResponse(res, 201, queryResponse)
		}
	})
}


//Number of Books By Level
module.exports.analyticsLevelDistribution = function(req, res) {
	bkcoll.aggregate([
		{$group:{
			_id: '$level.ILER',
			count: {
				$sum:1
			}
		}},
		{$sort:{
			_id:1
		}}
	]).then(function(queryResponse, err){
		if(queryResponse == 0) {
			sendJsonResponse(res, 400, queryResponse)			
		} else {
			sendJsonResponse(res, 201, queryResponse)
		}
	})
}


//Total Number of Current Checkouts
module.exports.analyticsBookCurrentCheckoutCount = function(req,res) {
	chkcoll.count({"status":"active"}).then(function(queryResponse, err){
		if(queryResponse == 0) {
			sendJsonResponse(res, 400, queryResponse)			
		} else {
			sendJsonResponse(res, 201, queryResponse)
		}
	})
}


//Total Number of All Checkouts
module.exports.analyticsBookCheckoutCount = function(req,res) {
	chkcoll.count({}).then(function(queryResponse, err){
		if(queryResponse == 0) {
			sendJsonResponse(res, 400, queryResponse)			
		} else {
			sendJsonResponse(res, 201, queryResponse)
		}
	})
}

//Distribution of Checkouts by Students
module.exports.analyticsCheckoutDistribution = function(req,res) {
	chkcoll.aggregate([
		{$group:{
			_id: '$student.name',
			count: {
				$sum:1
			}
		}}
	]).then(function(queryResponse, err){
		if(queryResponse == 0) {
			sendJsonResponse(res, 400, queryResponse)			
		} else {
			sendJsonResponse(res, 201, queryResponse)
		}
	})
}


//Distribution of Checkouts by Students
/*
module.exports.analyticsReturns = function(req,res) {
	chkcoll.count({}).then(function(queryResponse, err){
		if(queryResponse == 0) {
			sendJsonResponse(res, 400, queryResponse)			
		} else {
			sendJsonResponse(res, 201, queryResponse)
		}
	})
}
*/