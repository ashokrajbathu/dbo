angular.module('personalAssistant').controller('insuranceController', insuranceController);
insuranceController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function insuranceController($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem('currentState', 'insurance');
    var insurance = this;
}
