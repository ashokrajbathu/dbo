angular.module('doctor').controller('myPrescriptionsController', myPrescriptionsController);
myPrescriptionsController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function myPrescriptionsController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'myPrescriptions');

    var myPrescription = this;

    $log.log('in my prescriptions');

    myPrescription.name = 'ravi teja';
    myPrescription.view = true;
};
