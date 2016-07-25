angular.module('doctor').controller('referDboticaController', referDboticaController);
referDboticaController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function referDboticaController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'referDbotica');
};
