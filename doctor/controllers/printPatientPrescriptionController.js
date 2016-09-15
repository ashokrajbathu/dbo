var app = angular.module('printPatientPrescription', []);

app.controller('printPatientPrescriptionController', printPatientPrescriptionController);
printPatientPrescriptionController.$inject = ['$scope', '$log'];

function printPatientPrescriptionController($scope, $log) {
    var prescription = this;
    prescription.today = '';

    function getTodayString() {
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;
        prescription.today = day + "/" + month + "/" + year;
    }

    getTodayString();
    var activePrescription = sessionStorage.getItem('prescriptionObjectToPrint');
    var activeDoctor = sessionStorage.getItem('currentDoctor');
    var organizationAddress = sessionStorage.getItem('doctorHospitalLocation');
    var activePatient = sessionStorage.getItem('currentPatient');
    prescription.doctorName = '';
    prescription.speciality = '';
    prescription.phoneNumber = '';
    prescription.doctorRegistrationNo = '';
    prescription.organization = '';
    prescription.orgAddress = '';
    prescription.patientName = '';
    prescription.patientAge = '';
    prescription.patientGender = '';
    prescription.height = '';
    prescription.weight = '';
    prescription.remarksOfDoctor = '';
    prescription.temperature = '';
    prescription.pulse = '';
    prescription.bloodPressure = '';
    prescription.bmi = '';
    prescription.symptoms = '';
    prescription.investigation = '';
    prescription.drugsList = [];
    prescription.testsList = [];
    prescription.revisitOnDate = '';
    prescription.referToDoctorName = '';
    prescription.orgAddressEmpty = false;
    prescription.prescriptionActive = angular.fromJson(activePrescription);
    prescription.doctorActive = angular.fromJson(activeDoctor);
    prescription.activePatient = angular.fromJson(activePatient);
    var organAddress = angular.fromJson(organizationAddress);
    console.log('organ address is------', organAddress);
    if (_.has(prescription.doctorActive, 'firstName')) {
        prescription.doctorName += prescription.doctorActive.firstName;
    }
    if (_.has(prescription.doctorActive, 'lastName')) {
        prescription.doctorName += ' ';
        prescription.doctorName += prescription.doctorActive.lastName;
    }
    if (_.has(prescription.doctorActive, 'speciality')) {
        prescription.speciality += prescription.doctorActive.speciality;
    }
    if (_.has(prescription.doctorActive, 'phoneNumber')) {
        prescription.phoneNumber += prescription.doctorActive.phoneNumber;
    }
    if (_.has(prescription.doctorActive, 'doctorRegistrationNo')) {
        prescription.doctorRegistrationNo += prescription.doctorActive.doctorRegistrationNo;
    }
    if (_.has(prescription.doctorActive, 'organization')) {
        prescription.organization += prescription.doctorActive.organization;
        prescription.organization = prescription.organization.toUpperCase();
    }
    if (_.has(organAddress, 'address')) {
        prescription.orgAddress = organAddress.address + ' ' + organAddress.city;
        if (organAddress.address == '' && organAddress.city == '') {
            prescription.orgAddressEmpty = true;
        }
    }
    if (_.has(prescription.activePatient, 'firstName')) {
        prescription.patientName += prescription.activePatient.firstName;
    }
    if (_.has(prescription.activePatient, 'lastName')) {
        prescription.patientName += ' ';
        prescription.patientName += prescription.activePatient.lastName;
    }
    if (_.has(prescription.activePatient, 'age')) {
        prescription.patientAge += prescription.activePatient.age;
    }
    if (_.has(prescription.activePatient, 'gender')) {
        prescription.patientGender += prescription.activePatient.gender;
    }
    if (_.has(prescription.prescriptionActive.prescriptionToPrint, 'height')) {
        prescription.height = prescription.prescriptionActive.prescriptionToPrint.height;
    }
    if (_.has(prescription.prescriptionActive.prescriptionToPrint, 'weight')) {
        prescription.weight = prescription.prescriptionActive.prescriptionToPrint.weight;
    }
    if (_.has(prescription.prescriptionActive.prescriptionToPrint, 'temperature')) {
        prescription.temperature = prescription.prescriptionActive.prescriptionToPrint.temperature;
    }
    if (_.has(prescription.prescriptionActive.prescriptionToPrint, 'pulse')) {
        prescription.pulse = prescription.prescriptionActive.prescriptionToPrint.pulse;
    }
    if (_.has(prescription.prescriptionActive.prescriptionToPrint, 'bloodPressure')) {
        prescription.bloodPressure = prescription.prescriptionActive.prescriptionToPrint.bloodPressure;
    }
    if (_.has(prescription.prescriptionActive.prescriptionToPrint, 'bmi')) {
        prescription.bmi = prescription.prescriptionActive.prescriptionToPrint.bmi;
    }
    if (_.has(prescription.prescriptionActive.prescriptionToPrint, 'symptoms')) {
        prescription.symptoms = prescription.prescriptionActive.prescriptionToPrint.symptoms;
    }
    if (_.has(prescription.prescriptionActive.prescriptionToPrint, 'investigation')) {
        prescription.investigation = prescription.prescriptionActive.prescriptionToPrint.investigation;
    }
    if (_.has(prescription.prescriptionActive, 'drugListToDisplay')) {
        prescription.drugsList = prescription.prescriptionActive.drugListToDisplay;
    }
    if (_.has(prescription.prescriptionActive, 'testsListToDisplay')) {
        prescription.testsList = prescription.prescriptionActive.testsListToDisplay;
    }
    if (_.has(prescription.prescriptionActive.prescriptionToPrint, 'references')) {
        prescription.referToDoctorName = 'Dr.' + prescription.prescriptionActive.prescriptionToPrint.references;
    }
    if (_.has(prescription.prescriptionActive.prescriptionToPrint, 'revisitDate')) {
        prescription.revisitOnDate = prescription.prescriptionActive.prescriptionToPrint.revisitDate;
    }
    if (_.has(prescription.prescriptionActive.prescriptionToPrint, 'remarks')) {
        prescription.remarksOfDoctor = prescription.prescriptionActive.prescriptionToPrint.remarks;
    }
    var qrString = prescription.activePatient.id + ":" + prescription.prescriptionActive.prescriptionToPrint.id;
    $("#qrCodeSection").qrcode({
        width: 128,
        height: 128,
        text: qrString
    });
}
