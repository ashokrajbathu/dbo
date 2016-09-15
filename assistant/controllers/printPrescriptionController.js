var app = angular.module('printPrescription', []);

app.controller('printPrescriptionController', printPrescriptionController);
printPrescriptionController.$inject = ['$scope'];

function printPrescriptionController($scope) {
    var prescription = this;

    var activePrescription = sessionStorage.getItem('activePrescription');
    activePrescription = angular.fromJson(activePrescription);
    console.log('active prescription is----', activePrescription);
    if (activePrescription !== undefined && activePrescription !== null && activePrescription !== '') {
        prescription.drugsList = activePrescription.prescription;
        prescription.testsList = activePrescription.tests;
        prescription.doctorName = activePrescription.referDetails.references;
        prescription.revisitDate = activePrescription.referDetails.revisitDate;
        prescription.patientName = activePrescription.patient.firstName;
        prescription.phoneNumber = activePrescription.patient.phoneNumber;
        var qrString = activePrescription.patient.id + ':' + activePrescription.referDetails.id;
        var addressInTheBill = sessionStorage.getItem('addressInTheBill');
        addressInTheBill = angular.fromJson(addressInTheBill);
        if (addressInTheBill !== undefined && addressInTheBill !== null && addressInTheBill !== '') {
            prescription.organizationName = addressInTheBill[0].label;
            prescription.address = addressInTheBill[0].address;
            prescription.cellNumber = addressInTheBill[0].cellNumber;
            prescription.officephoneNumber = addressInTheBill[0].phoneNumber;
            prescription.tinNo = addressInTheBill[0].tinNo;
        }
        var doctorName = activePrescription.doctor.firstName;
        var doctorSpeciality = activePrescription.doctor.speciality;
        prescription.doctorNameAndSpeciality = 'Dr.' + doctorName + ',' + doctorSpeciality;
        $('#prBarCode').qrcode({
            width: 128,
            height: 128,
            text: qrString
        });
    }
}
