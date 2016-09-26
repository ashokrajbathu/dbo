angular.module('personalAssistant').controller('registrationController', registrationController);
registrationController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function registrationController($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    angular.element('#insuranceActive').addClass('activeAdminLi');

    var registration = this;
}
