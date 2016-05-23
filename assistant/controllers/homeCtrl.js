angular.module('personalAssistant').controller('homeCtrl', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {

    var currentStateActive = localStorage.getItem("currentState");
    switch (currentStateActive) {
        case 'patientManagement':
            $state.go('home.patientManagement');
            break;

        case 'billManagement':
            $state.go('home.billManagement');
            break;

        case 'itemInfo':
            $state.go('home.itemInfo');
            break;

        case 'inventory':
            $state.go('home.inventory');
            break;

        case 'admin':
            $state.go('home.admin');
            break;
    }



    $scope.logout = function() {
        var promise = dboticaServices.logout();
        promise.then(function(response) {
            $log.log("in logout success");
            localStorage.setItem("isLoggedIn", false);
            localStorage.clear();
            $state.go('login');
        }, function(errorResponse) {
            $log.log("in logout error response");
        });
    }
}]);
