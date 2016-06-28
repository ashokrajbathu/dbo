angular.module('personalAssistant').controller('mainAdminController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "mainAdmin");
   /* $state.go('.addDocCategory');*/
}]);
