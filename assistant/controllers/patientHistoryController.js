angular.module('personalAssistant').controller('patientHistoryController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var patientHistoryElement = this;

    patientHistoryElement.request = {};

    patientHistoryElement.savePatientHistory = savePatientHistory;
    patientHistoryElement.getData = getData;

    patientHistoryElement.request.allergies = '';
    patientHistoryElement.request.warnings = '';
    patientHistoryElement.request.socialHistory = '';
    patientHistoryElement.request.familyHistory = '';
    patientHistoryElement.request.personalHistory = '';
    patientHistoryElement.request.patientMedicalHistory = '';

    var organizationId = localStorage.getItem('orgId');

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);


    function getData() {
        patientHistoryElement.patient = dboticaServices.getPatientDetailsFromService();
    }

    function savePatientHistory() {
        if (!jQuery.isEmptyObject(patientHistoryElement.patient)) {
            var savePatientRequestEntity = {};
            savePatientRequestEntity.organizationId = organizationId;
            savePatientRequestEntity.patientId = patientHistoryElement.patient.id;
            savePatientRequestEntity.patientName = patientHistoryElement.patient.firstName;
            savePatientRequestEntity.patientPhoneNumber = patientHistoryElement.patient.phoneNumber;
            savePatientRequestEntity.patientEventType = 'REMARKS';
            var currentDate = new Date();
            savePatientRequestEntity.startTime = currentDate.getTime();
            savePatientRequestEntity.alertTime = '';
            savePatientRequestEntity.referenceId = '';
            var patientHistoryDetails = {};
            patientHistoryDetails.allergies = patientHistoryElement.request.allergies;
            patientHistoryDetails.warnings = patientHistoryElement.request.warnings;
            patientHistoryDetails.socialHistory = patientHistoryElement.request.socialHistory;
            patientHistoryDetails.familyHistory = patientHistoryElement.request.familyHistory;
            patientHistoryDetails.personalHistory = patientHistoryElement.request.personalHistory;
            patientHistoryDetails.patientMedicalHistory = patientHistoryElement.request.patientMedicalHistory;
            savePatientRequestEntity.referenceDetails = JSON.stringify(patientHistoryDetails);
            var saveHistoryPromise = dboticaServices.patientEvent(savePatientRequestEntity);
            saveHistoryPromise.then(function(saveHistorySuccess) {
                var errorCode = saveHistorySuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage();
                } else {
                    var saveHistoryResponse = angular.fromJson(saveHistorySuccess.data.response);
                    if (errorCode == null && saveHistorySuccess.data.success == true) {
                        dboticaServices.patientHistoryUpdatedSwal();
                    }
                }
            }, function(saveHistoryError) {
                dboticaServices.noConnectivityErrors();
            });
        } else {
            dboticaServices.pleaseSelectPatientSwal();
        }
    }
}]);
