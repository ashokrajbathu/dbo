angular.module('personalAssistant').controller('registerPatientController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var register = this;

    register.phoneNumberErrorMessage = false;
    register.phoneNumberBtn = true;
    register.patientSearchInTxtBox = '';
    register.patientData = {};
    register.registerPatientAddPatientHeader = false;
    register.registerPatientHeader = true;
    register.patientData.gender = 'MALE';
    register.patientData.bloodGroup = 'O_POSITIVE';
    register.newPatientForm = false;
    register.registerPatientForm = false;
    register.registerPatientToHospital = {};
    register.patientName = '';
    register.registerPatientToHospital.patientState = 'CHECK_IN';
    register.patientNumberErrorMessage = false;

    register.phoneNumberValidation = phoneNumberValidation;
    register.patientSearchWithPhoneNumber = patientSearchWithPhoneNumber;
    register.addPatient = addPatient;
    register.patientSelect = patientSelect;
    register.registerAPatient = registerAPatient;

    var organizationId = localStorage.getItem('orgId');

    function phoneNumberValidation() {
        if (register.patientSearchInTxtBox !== '' && register.patientSearchInTxtBox !== undefined) {
            var phoneNumberLength = register.patientSearchInTxtBox.length;
            if (phoneNumberLength < parseInt(10) || phoneNumberLength > parseInt(10)) {
                register.phoneNumberErrorMessage = true;
                register.phoneNumberBtn = true;
            } else {
                register.phoneNumberErrorMessage = false;
                register.phoneNumberBtn = false;
            }
        } else {
            register.phoneNumberErrorMessage = false;
            register.phoneNumberBtn = true;
        }
    }

    function patientSearchWithPhoneNumber() {
        var patientDetailsPromise = dboticaServices.getPatientDetailsOfThatNumber(register.patientSearchInTxtBox);
        patientDetailsPromise.then(function(patientDetailsSuccess) {
            var errorCode = patientDetailsSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var patientsListResponse = angular.fromJson(patientDetailsSuccess.data.response);
                $log.log('patients list is----', patientsListResponse);
                if (patientsListResponse.length > 0) {
                    register.registerPatientForm = true;
                    register.newPatientForm = false;
                    register.registerPatientAddPatientHeader = false;
                    register.registerPatientHeader = true;
                    register.totalPatientsList = patientsListResponse;
                    register.patientName = patientsListResponse[0].firstName;
                    register.patientActiveId = patientsListResponse[0].id;
                    register.registerPatientToHospital.phoneNumber = register.patientSearchInTxtBox;
                    register.patientNumberErrorMessage = false;
                } else {
                    register.patientData.phoneNumber = register.patientSearchInTxtBox;
                    register.registerPatientForm = false;
                    register.newPatientForm = true;
                    register.registerPatientAddPatientHeader = true;
                    register.registerPatientHeader = false;
                }
            }
        }, function(patientDetailsError) {
            dboticaServices.noConnectivityError();
        });
    }

    function addPatient() {
        var patientDataRequestEntity = {};
        var firstName = register.patientData.firstName;
        var phoneNumber = register.patientData.phoneNumber;
        if (firstName !== undefined && firstName !== '' && phoneNumber !== undefined && phoneNumber !== '') {
            patientDataRequestEntity.gender = register.patientData.gender;
            patientDataRequestEntity.bloodGroup = register.patientData.bloodGroup;
            patientDataRequestEntity.drugAllergy = register.patientData.drugAllergy;
            patientDataRequestEntity.firstName = firstName;
            patientDataRequestEntity.emailId = register.patientData.emailId;
            patientDataRequestEntity.phoneNumber = phoneNumber;
            patientDataRequestEntity.age = register.patientData.age;
            patientDataRequestEntity = JSON.stringify(patientDataRequestEntity);
            var newPatientInRegisterPatientPromise = dboticaServices.addNewPatient(patientDataRequestEntity);
            newPatientInRegisterPatientPromise.then(function(newPatientPromise) {
                var errorCode = newPatientPromise.data.errorcode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    if (errorCode == null && newPatientPromise.data.success == true) {
                        register.registerPatientForm = true;
                        register.newPatientForm = false;
                        var newPatientSuccess = angular.fromJson(newPatientPromise.data.response);
                        register.totalPatientsList = newPatientSuccess;
                        register.patientName = newPatientSuccess[0].firstName;
                        register.registerPatientAddPatientHeader = false;
                        register.registerPatientHeader = true;
                        register.patientActiveId = newPatientSuccess[0].id;
                        register.patientNumberErrorMessage = false;
                        register.registerPatientToHospital.phoneNumber = register.patientSearchInTxtBox;
                    }
                }
            }, function(newPatientError) {
                dboticaServices.noConnectivityError();
            });
        }
    }

    function patientSelect(selectedPatient) {
        register.patientActiveId = selectedPatient.id;
        register.patientName = selectedPatient.firstName;
        $log.log('patient Id is----', register.patientActiveId);
    }

    function registerAPatient() {
        var registerPatientRequestEntity = {};
        if (register.registerPatientToHospital.organizationPatientNo == undefined || register.registerPatientToHospital.organizationPatientNo == null || register.registerPatientToHospital.organizationPatientNo == '') {
            register.patientNumberErrorMessage = true;
        } else {
            registerPatientRequestEntity.organizationPatientNo = register.registerPatientToHospital.organizationPatientNo;
            registerPatientRequestEntity.patientId = register.patientActiveId;
            registerPatientRequestEntity.phoneNumber = register.registerPatientToHospital.phoneNumber;
            registerPatientRequestEntity.patientState = register.registerPatientToHospital.patientState;
            registerPatientRequestEntity.organizationId = organizationId;
            $log.log('req entity is----', registerPatientRequestEntity);
            var registerPatientPromise = dboticaServices.registerPatient(registerPatientRequestEntity);
            $log.log('register promise is----', registerPatientPromise);
            registerPatientPromise.then(function(registerPatientSuccess) {
                var errorCode = registerPatientSuccess.data.errorCode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    registerPatientList = angular.fromJson(registerPatientSuccess.data.response);
                    $log.log('register patient is------', registerPatientList);
                }
            }, function(registerPatientError) {
                dboticaServices.noConnectivityError();
            });
        }
    }

}]);
