angular.module('doctor').controller('prescriptionReportController', prescriptionReportController);
prescriptionReportController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function prescriptionReportController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'prescriptionReport');
    var prescriptionReport = this;
    angular.element('#drugPrescriptionActive').addClass('activeDoctorLi');
}
