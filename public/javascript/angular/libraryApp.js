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


angular
	.module('libraryApp',[])
	.controller('bookListCtrl', bookListCtrl)
	.controller('chkoutListCtrl', chkoutListCtrl)
	.controller('userListCtrl', userListCtrl)
	.controller('chkoutArchiveListCtrl', chkoutArchiveListCtrl)
