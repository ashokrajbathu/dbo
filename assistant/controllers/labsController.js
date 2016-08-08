angular.module('personalAssistant').controller('labsController', labsController);
labsController.$inject = ['$scope', '$log', '$location', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function labsController($scope, $log, $location, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem('currentState', 'labs');
}
