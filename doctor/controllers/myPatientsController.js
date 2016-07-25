angular.module('doctor').controller('myPatientsController', myPatientsController);
myPatientsController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function myPatientsController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'myPatients');
};
