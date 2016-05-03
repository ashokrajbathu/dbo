angular.module('personalAssistant').controller('homeCtrl', ['$scope', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {

    var currentStateActive = localStorage.getItem("currentState");
    switch (currentStateActive) {
        case 'patientManagement':
            $state.go('home.patientManagement');
            break;

        case 'billManagement':
            $state.go('home.billManagement');
            break;
    }

    $scope.logout = function() {
        var promise = dboticaServices.logout();
        promise.then(function(response) {
            console.log("in logout success");
            localStorage.setItem("isLoggedIn", false);
            localStorage.clear();
            $state.go('login');
        }, function(errorResponse) {
            console.log("in logout error response");
        });


    }


}]);
