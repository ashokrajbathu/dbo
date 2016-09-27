angular.module('personalAssistant').controller('registrationController', registrationController);
registrationController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function registrationController($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    angular.element('#insuranceActive').addClass('activeAdminLi');

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);
    var registration = this;

    var patientSearchPromise = dboticaServices.getInPatientsWithPhoneNumber(phoneNumber);
    $log.log('patient search response----', patientSearchPromise);
    patientSearchPromise.then(function(patientSuccess) {
        var errorCode = patientSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            patientSearchResponse = angular.fromJson(patientSuccess.data.response);
            $log.log('search----------', patientSearchResponse);
            if (errorCode == null && patientSearchResponse.data.success) {

            }
        }
    }, function(patientSearchError) {
        dboticaServices.noConnectivityError();
    });
}
