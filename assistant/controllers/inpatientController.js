angular.module('personalAssistant').controller('inpatientController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "ipd");
    var inpatientElement = this;

    inpatientElement.phoneNumberLengthValidation = phoneNumberLengthValidation;
    inpatientElement.patientSearch = patientSearch;
    inpatientElement.patientSelectFromDropdown = patientSelectFromDropdown;
    inpatientElement.addPatient = addPatient;

    inpatientElement.PhoneNumberErrorMessage = false;
    inpatientElement.patientSearchBtnDisabled = true;
    inpatientElement.number = "";
    inpatientElement.patientData = {};
    inpatientElement.patientsListOfThatNumber = [];
    inpatientElement.patientIdActive = "";
    var patientName = 'New Patient';
    var newPatient = { 'firstName': 'New Patient' };

    function phoneNumberLengthValidation(phoneNumber) {
        if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
            if (phoneNumber.length < 10) {
                inpatientElement.patientSearchBtnDisabled = true;
                if (phoneNumber.length == 0) {
                    inpatientElement.PhoneNumberErrorMessage = false;
                } else {
                    inpatientElement.PhoneNumberErrorMessage = true;
                }
            } else {
                if (phoneNumber.length == 10) {
                    inpatientElement.patientSearchBtnDisabled = false;
                    inpatientElement.PhoneNumberErrorMessage = false;
                } else {
                    inpatientElement.patientSearchBtnDisabled = true;
                    inpatientElement.PhoneNumberErrorMessage = true;
                }
            }
        } else {
            inpatientElement.patientSearchBtnDisabled = true;
        }
    }

    function patientSearch() {
        inpatientElement.patientData = {};
        inpatientElement.patientData.gender = 'MALE';
        inpatientElement.patientData.bloodGroup = 'O_POSITIVE';
        inpatientElement.patientData.phoneNumber = inpatientElement.number;
        var inpatientSearchPromise = dboticaServices.getPatientDetailsOfThatNumber(inpatientElement.number);
        inpatientSearchPromise.then(function(inpatientSearchSuccess) {
            var errorCode = inpatientSearchSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                $log.log("inpatient search success is-----", $.parseJSON(inpatientSearchSuccess.data.response));
                inpatientElement.patientsListOfThatNumber = $.parseJSON(inpatientSearchSuccess.data.response);
                if (inpatientElement.patientsListOfThatNumber.length > 0) {
                    inpatientElement.patientIdActive = inpatientElement.patientsListOfThatNumber[0].id;
                    inpatientElement.patientName = inpatientElement.patientsListOfThatNumber[0].firstName;
                    inpatientElement.patientData = inpatientElement.patientsListOfThatNumber[0];
                } else {
                    inpatientElement.patientName = patientName;
                    inpatientElement.patientsListOfThatNumber.push(newPatient);
                }
            }
        }, function(inpatientSearchError) {

        });
    }

    function patientSelectFromDropdown(selectedPatient) {
        if (selectedPatient.firstName !== patientName) {
            $log.log("selected patient is---", selectedPatient);
            inpatientElement.patientName = selectedPatient.firstName;
            inpatientElement.patientData = selectedPatient;
            inpatientElement.patientIdActive = selectedPatient.id;
        }
    }

    function addPatient() {
        var patientDataRequestEntity = {};
        if (inpatientElement.patientIdActive !== "") {
            patientDataRequestEntity.id = inpatientElement.patientIdActive;
        }
        patientDataRequestEntity.gender = inpatientElement.patientData.gender;
        patientDataRequestEntity.bloodGroup = inpatientElement.patientData.bloodGroup;
        patientDataRequestEntity.drugAllergy = inpatientElement.patientData.drugAllergy;
        patientDataRequestEntity.firstName = inpatientElement.patientData.firstName;
        patientDataRequestEntity.emailId = inpatientElement.patientData.emailId;
        patientDataRequestEntity.phoneNumber = inpatientElement.patientData.phoneNumber;
        patientDataRequestEntity.age = inpatientElement.patientData.age;
        patientDataRequestEntity = JSON.stringify(inpatientElement.patientData);
        $log.log("patient in modal is----", patientDataRequestEntity);
        if (inpatientElement.patientData.firstName !== undefined && inpatientElement.patientData.phoneNumber !== undefined) {
            var inpatientPromise = dboticaServices.addNewPatient(patientDataRequestEntity);
            inpatientPromise.then(function(inpatientSuccessResponse) {
                var errorCode = inpatientPromise.data.errorCode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var inpatientAddResponse = inpatientSuccessResponse.data.response;
                    $log.log("add response is---", inpatientAddResponse);
                }
            }, function(inpatientErrorResponse) {

            });
        }
    }
}]);
