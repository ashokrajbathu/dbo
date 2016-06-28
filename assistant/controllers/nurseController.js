angular.module('personalAssistant').controller('nurseController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem('currentState', 'nurseHome');

    var nurseHome = this;

    nurseHome.phoneNumberLengthValidation = phoneNumberLengthValidation;
    nurseHome.patientSearchWithPhoneNumber = patientSearchWithPhoneNumber;

    nurseHome.patientSearchBtnDisabled = true;
    nurseHome.PhoneNumberErrorMessage = false;
    nurseHome.patientsListToBeDisplayed = [];

    function phoneNumberLengthValidation() {
        var phoneNumber = nurseHome.number;
        if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
            if (phoneNumber.length < 10) {
                nurseHome.patientSearchBtnDisabled = true;
                if (phoneNumber.length == 0) {
                    nurseHome.PhoneNumberErrorMessage = false;
                } else {
                    nurseHome.PhoneNumberErrorMessage = true;
                }
            } else {
                if (phoneNumber.length == 10) {
                    nurseHome.patientSearchBtnDisabled = false;
                    nurseHome.PhoneNumberErrorMessage = false;
                } else {
                    nurseHome.patientSearchBtnDisabled = true;
                    nurseHome.PhoneNumberErrorMessage = true;
                }
            }
        } else {
            nurseHome.PhoneNumberErrorMessage = false;
            nurseHome.patientSearchBtnDisabled = true;
        }
    }

    function patientSearchWithPhoneNumber() {
        var patientsListPromise = dboticaServices.getPatientDetailsOfThatNumber(nurseHome.number);
        patientsListPromise.then(function(patientsListSuccess) {
            var errorCode = patientsListSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                nurseHome.patientsListToBeDisplayed = angular.fromJson(patientsListSuccess.data.response);
                $log.log('patients list is----', nurseHome.patientsListToBeDisplayed);
            }
        }, function(patientsListError) {
            dboticaServices.noConnectivityError();
        });
    }
}]);
