var bookListCtrl = function($scope, $http) {
	$http({
		method: 'GET',
		url: '/api/books'
	}).then(function successCallback(response) {
		$scope.bookEntries = response.data;
	}, function errorCallback(response) {
		console.log(error);
	})
}

var chkoutListCtrl = function($scope, $http) {
	$http({
		method: 'GET',
		url: '/api/checkouts'
	}).then(function successCallback(response) {
		$scope.chkoutEntries = response.data;
	}, function errorCallback(response) {
		console.log(error);
	})
}

var chkoutArchiveListCtrl = function($scope, $http) {
	$http({
		method: 'GET',
		url: '/api/checkouts/archive'
	}).then(function successCallback(response) {
		$scope.archiveEntries = response.data;
	}, function errorCallback(response) {
		console.log(error);
	})
}

var userListCtrl = function($scope, $http) {
	$http({
		method: 'GET',
		url: '/api/users'
	}).then(function successCallback(response) {
		$scope.userEntries = response.data;
	}, function errorCallback(response) {
		console.log(error);
	})
}

//Analytics
var distinctBookCountCtrl = function($scope, $http) {
	$http({
		method: 'GET',
		url: '/api/analytics/book/distinct'
	}).then(function successCallback(response) {
		$scope.distinctBookTotal = response.data;
	}, function errorCallback(response) {
		console.log(error);
	})
}

var bookCountCtrl = function($scope, $http) {
	$http({
		method: 'GET',
		url: '/api/analytics/book/total'
	}).then(function successCallback(response) {
		$scope.bookTotal = response.data;
	}, function errorCallback(response) {
		console.log(error);
	})
}

var levelDistributionCtrl = function($scope, $http) {
	$http({
		method: 'GET',
		url: '/api/analytics/book/leveldistribution'
	}).then(function successCallback(response) {
		$scope.levelDistribution = response.data;
	}, function errorCallback(response) {
		console.log(error);
	})
}

var checkoutCountCtrl = function($scope, $http) {
	$http({
		method: 'GET',
		url: '/api/analytics/checkout/total'
	}).then(function successCallback(response) {
		$scope.checkoutTotal = response.data;
	}, function errorCallback(response) {
		console.log(error);
	})
}

var currentCheckoutCountCtrl = function($scope, $http) {
	$http({
		method: 'GET',
		url: '/api/analytics/checkout/current'
	}).then(function successCallback(response) {
		$scope.currentCheckoutTotal = response.data;
	}, function errorCallback(response) {
		console.log(error);
	})
}

angular
	.module('libraryApp',[])
	.controller('bookListCtrl', bookListCtrl)
	.controller('chkoutListCtrl', chkoutListCtrl)
	.controller('userListCtrl', userListCtrl)
	.controller('chkoutArchiveListCtrl', chkoutArchiveListCtrl)
	.controller('distinctBookCountCtrl', distinctBookCountCtrl)
	.controller('bookCountCtrl', bookCountCtrl)
	.controller('levelDistributionCtrl', levelDistributionCtrl)
	.controller('checkoutCountCtrl', checkoutCountCtrl)
	.controller('currentCheckoutCountCtrl', currentCheckoutCountCtrl)