angular.module('personalAssistant').controller('operatorController', operatorController);
operatorController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function operatorController($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
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
    operator.patientData = {};
    var activePatientIndex;
    var newPatientFlag = false;
    var updatePatientFlag = false;
    operator.PhoneNumberErrorMessage = false;
    operator.patientSearchBtnDisabled = true;
    operator.updatePatient = false;
    operator.addMember = false;
    operator.noPatientDetailsErrorMessage = false;
    operator.mandatoryFieldsErrorMessage = false;
    operator.doctorSelect = doctorSelect;
    operator.phoneNumberLengthValidation = phoneNumberLengthValidation;
    operator.patientSearchByOperator = patientSearchByOperator;
    operator.addOrUpdatePatient = addOrUpdatePatient;
    operator.addFamilyMember = addFamilyMember;
    operator.updatePatientDetails = updatePatientDetails;
    operator.selectActivePatient = selectActivePatient;

    var doctorsListPromise = dboticaServices.doctorsOfAssistant();
    doctorsListPromise.then(function(doctorsListSuccess) {
        var errorCode = doctorsListSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            operator.doctorsListToBeDisplayed = angular.fromJson(doctorsListSuccess.data.response);
            operator.doctorsListToBeDisplayed.unshift(doctorObject);
        }
    }, function(doctorsListError) {
        dboticaServices.noConnectivityError();
    });

    try {
        openDb();
    } catch (e) {
        console.log("Error in openDb");
    }

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
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                operator.patientsToBeDisplayedInRadios = angular.fromJson(patientSearchSuccess.data.response);
                if (operator.patientsToBeDisplayedInRadios.length > 0) {
                    newPatientFlag = false;
                    activePatient = operator.patientsToBeDisplayedInRadios[0];
                    activePatientIndex = 0;
                    operator.updatePatient = true;
                    operator.addMember = true;
                    operator.radio0 = true;
                } else {
                    angular.element('#newOrUpdatePatientModal').modal('show');
                    operator.noPatientDetailsErrorMessage = true;
                    operator.patientData.bloodGroup = 'O_POSITIVE';
                    operator.patientData.gender = 'MALE';
                    newPatientFlag = true;
                    activePatient = {};
                }
            }
        }, function(patientSearchError) {
            dboticaServices.noConnectivityError();
        });
    }

    function addOrUpdatePatient() {
        var addPatientRequestEntity = {};
        operator.noPatientDetailsErrorMessage = false;
        operator.mandatoryFieldsErrorMessage = false;
        var firstName = operator.patientData.firstName;
        var phoneNumber = operator.patientData.phoneNumber;
        if (_.isEmpty(activePatient)) {
            if (newPatientFlag) {
                addPatientRequestEntity.primaryPatient = true;
            } else {
                addPatientRequestEntity.primaryPatient = false;
            }
        } else {
            addPatientRequestEntity.id = activePatient.id;
        }
        if (firstName !== undefined && firstName !== '' && phoneNumber !== undefined && phoneNumber !== '') {
            operator.mandatoryFieldsErrorMessage = false;
            addPatientRequestEntity.firstName = firstName;
            addPatientRequestEntity.phoneNumber = phoneNumber;
            addPatientRequestEntity.gender = operator.patientData.gender;
            addPatientRequestEntity.bloodGroup = operator.patientData.bloodGroup;
            addPatientRequestEntity.drugAllergy = operator.patientData.drugAllergy;
            addPatientRequestEntity.emailId = operator.patientData.emailId;
            addPatientRequestEntity.age = operator.patientData.age;
            addPatientRequestEntity = JSON.stringify(addPatientRequestEntity);
            var addPatientPromise = dboticaServices.addNewPatient(addPatientRequestEntity);
            addPatientPromise.then(function(addpatientSuccess) {
                var errorCode = addpatientSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var addPatientResponse = angular.fromJson(addpatientSuccess.data.response);
                    if (errorCode == null && addpatientSuccess.data.success == true) {
                        angular.element('#newOrUpdatePatientModal').modal('hide');
                        dboticaServices.registerPatientSuccessSwal();
                        if (_.isEmpty(activePatient)) {
                            if (operator.patientsToBeDisplayedInRadios.length == 0) {
                                operator.patientsToBeDisplayedInRadios = addPatientResponse;
                                activePatient = addPatientResponse[0];
                                activePatientIndex = 0;
                                operator.updatePatient = true;
                                operator.addMember = true;
                                operator.radio0 = true;
                            } else {
                                operator.patientsToBeDisplayedInRadios.push(addPatientResponse[0]);
                            }
                        } else {
                            operator.patientsToBeDisplayedInRadios.splice(activePatientIndex, 1, addPatientResponse[0]);
                            operator['radio' + activePatientIndex] = true;
                        }
                    }
                }
            }, function(addpatientError) {
                dboticaServices.noConnectivityError();
            });
        } else {
            operator.mandatoryFieldsErrorMessage = true;
        }
    }

    function addFamilyMember() {
        operator.mandatoryFieldsErrorMessage = false;
        operator.noPatientDetailsErrorMessage = false;
        operator.patientData = {};
        operator.patientData.gender = 'MALE';
        operator.patientData.bloodGroup = 'O_POSITIVE';
        newPatientFlag = false;
        operator.patientData.phoneNumber = activePatient.phoneNumber;
        activePatient = {};
    }

    function updatePatientDetails() {
        operator.mandatoryFieldsErrorMessage = false;
        operator.noPatientDetailsErrorMessage = false;
        updatePatientFlag = true;
        operator.patientData = activePatient;
    }

    function selectActivePatient(patientActiveIs, index) {
        activePatient = patientActiveIs;
        activePatientIndex = index;
    }

};
