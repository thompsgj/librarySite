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
		console.log(response.data)
		$scope.chkoutEntries = response.data;
	}), function errorCallback(response) {
		console.log(error);
	}
}

angular
	.module('libraryApp',[])
	.controller('bookListCtrl', bookListCtrl)
	.controller('chkoutListCtrl', chkoutListCtrl)
	.filter