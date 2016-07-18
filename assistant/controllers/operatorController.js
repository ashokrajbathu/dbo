angular.module('personalAssistant').controller('operatorController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var operator = this;
    localStorage.setItem('currentState', 'operator');
    operator.blurScreen = false;
    operator.loading = false;
    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);
    operator.doctorName = '---Select Doctor---';
    var doctorObject = { 'firstName': '---Select Doctor---' };
    operator.doctorsListToBeDisplayed = [];
    var activeDoctor = {};
    var activePatient = {};
    operator.PhoneNumberErrorMessage = false;
    operator.patientSearchBtnDisabled = true;
    operator.updatePatient = false;
    operator.addMember = false;
    operator.doctorSelect = doctorSelect;
    operator.phoneNumberLengthValidation = phoneNumberLengthValidation;
    operator.patientSearchByOperator = patientSearchByOperator;

    var doctorsListPromise = dboticaServices.doctorsOfAssistant();
    doctorsListPromise.then(function(doctorsListSuccess) {
        var errorCode = doctorsListSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            operator.doctorsListToBeDisplayed = angular.fromJson(doctorsListSuccess.data.response);
            operator.doctorsListToBeDisplayed.unshift(doctorObject);
        }
    }, function(doctorsListError) {
        dboticaServices.noConnectivityError();
    });

    function doctorSelect(doctorEntity) {
        activeDoctor = doctorEntity;
        operator.doctorName = doctorEntity.firstName;
    }

    function phoneNumberLengthValidation() {
        var phoneNumber = operator.phoneNumber;
        if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
            if (phoneNumber.length < 10) {
                operator.patientSearchBtnDisabled = true;
                if (phoneNumber.length == 0) {
                    operator.PhoneNumberErrorMessage = false;
                } else {
                    operator.PhoneNumberErrorMessage = true;
                }
            } else {
                if (phoneNumber.length == 10) {
                    operator.patientSearchBtnDisabled = false;
                    operator.PhoneNumberErrorMessage = false;
                } else {
                    operator.patientSearchBtnDisabled = true;
                    operator.PhoneNumberErrorMessage = true;
                }
            }
        } else {
            operator.PhoneNumberErrorMessage = false;
            operator.patientSearchBtnDisabled = true;
        }
    }

    function patientSearchByOperator() {
        var patientSearchPromise = dboticaServices.getPatientDetailsOfThatNumber(operator.phoneNumber);
        patientSearchPromise.then(function(patientSearchSuccess) {
            var errorCode = patientSearchSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                operator.patientsToBeDisplayedInRadios = angular.fromJson(patientSearchSuccess.data.response);
                if (operator.patientsToBeDisplayedInRadios.length > 0) {
                    activePatient = operator.patientsToBeDisplayedInRadios[0];
                    operator.updatePatient = true;
                    operator.addMember = true;
                    operator.radio0 = true;
                }
            }
        }, function(patientSearchError) {
            dboticaServices.noConnectivityError();
        });
    }

}]);
