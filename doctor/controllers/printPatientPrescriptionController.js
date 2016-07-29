var app = angular.module('printPatientPrescription', []);

app.controller('printPatientPrescriptionController', printPatientPrescriptionController);
printPatientPrescriptionController.$inject = ['$scope', '$log'];

function printPatientPrescriptionController($scope, $log) {
    var prescription = this;

    var activePrescription = localStorage.getItem('prescriptionObjectToPrint');
    $log.log('active presc is----', activePrescription);
    prescription.prescriptionActive = angular.fromJson(activePrescription);
    $log.log('active prescription is----', prescription.prescriptionActive);
}
