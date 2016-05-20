angular.module('personalAssistant').controller('adminCtrl', ['$scope', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "admin");

    var doctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
    doctorsOfThatAssistant.then(function(response) {
        $scope.doctorsListInAdmin = $.parseJSON(response.data.response);
        console.log("doctors list is---", $scope.doctorsListInAdmin);
    }, function(errorResponse) {
        console.log("in error response of getting doctors");
    });
}]);
