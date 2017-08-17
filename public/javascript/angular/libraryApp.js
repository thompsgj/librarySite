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

var chkoutArchiveListCtrl = function($scope, $http) {
	$http({
		method: 'GET',
		url: '/api/checkouts/archive'
	}).then(function successCallback(response) {
		console.log(response.data)
		$scope.archiveEntries = response.data;
	}), function errorCallback(response) {
		console.log(error);
	}
}

var userListCtrl = function($scope, $http) {
	$http({
		method: 'GET',
		url: '/api/users'
	}).then(function successCallback(response) {
		console.log(response.data)
		$scope.userEntries = response.data;
	}), function errorCallback(response) {
		console.log(error);
	}
}


var reverse = function() {
  return function(input, uppercase) {
    input = input || '';
    var out = '';
    for (var i = 0; i < input.length; i++) {
      out = input.charAt(i) + out;
    }
    // conditional based on optional argument
    if (uppercase) {
      out = out.toUpperCase();
    }
    return out;
  };
}

angular
	.module('libraryApp',[])
	.controller('bookListCtrl', bookListCtrl)
	.controller('chkoutListCtrl', chkoutListCtrl)
	.controller('userListCtrl', userListCtrl)
	.controller('chkoutArchiveListCtrl', chkoutArchiveListCtrl)
	.filter('reverse', reverse)