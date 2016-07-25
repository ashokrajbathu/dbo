angular.module('doctor').controller('doctorProfileController', doctorProfileController);
doctorProfileController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function doctorProfileController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'doctorProfile');
};
