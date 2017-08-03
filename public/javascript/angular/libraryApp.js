var bookListCtrl = function($scope, $http) {
	$http({
		method: 'GET',
		url: '/api/books'
	}).then(function successCallback(response) {
		console.log(response)
		$scope.bookEntries = response.data
	}, function errorCallback(response) {
		console.log(error)
	})
}

angular
	.module('libraryApp',[])
	.controller('bookListCtrl', bookListCtrl)