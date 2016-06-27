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
    register.registeredPatientsList = [];
    register.phoneNumberSearchInModal = true;
    var registeredPatientActiveId = '';
    var registeredPatientActiveIndex = '';
    register.registerPatientNumber = false;
    register.registerPhoneNumber = false;
    register.phoneNumberInNewPatientForm = false;
    var newPatientActiveIndex = '';
    var newPatientActiveId = '';
    var localPatient = {};
    register.registerPatientSearchTxt = '';
    var entitiesArray = [];
    var entitiesArrayFlag = parseInt(0);

    register.phoneNumberValidation = phoneNumberValidation;
    register.patientSearchWithPhoneNumber = patientSearchWithPhoneNumber;
    register.addPatient = addPatient;
    register.patientSelect = patientSelect;
    register.registerAPatient = registerAPatient;
    register.deleteRegisteredPatient = deleteRegisteredPatient;
    register.editPatientDetails = editPatientDetails;
    register.editPatientState = editPatientState;
    register.registerPatientSearch = registerPatientSearch;

    var organizationId = localStorage.getItem('orgId');

    var getRegisteredPatientsPromise = dboticaServices.getRegisteredPatients(organizationId);
    getRegisteredPatientsPromise.then(function(registeredPatientsSuccess) {
        var errorCode = registeredPatientsSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorcode);
        } else {
            var registeredpatientsList = angular.fromJson(registeredPatientsSuccess.data.response);
            angular.forEach(registeredpatientsList, function(registeredPatientEntity) {
                if (registeredPatientEntity.state == 'ACTIVE') {
                    register.registeredPatientsList.push(registeredPatientEntity);
                }
            });
            angular.copy(register.registeredPatientsList, entitiesArray);
            $log.log('registered patients list final is----', register.registeredPatientsList);
        }
    }, function(registeredPatientsError) {
        dboticaServices.noConnectivityError();
    });

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
                    register.registerPatientToHospital.organizationPatientNo = '';
                    register.registerPatientToHospital.patientState = 'ADMITTED';
                    register.registerPatientNumber = false;
                    register.registerPhoneNumber = true;
                    register.phoneNumberSearchInModal = false;
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
                    register.phoneNumberSearchInModal = true;
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
        if (newPatientActiveId !== '' && newPatientActiveIndex !== '') {
            patientDataRequestEntity.id = newPatientActiveId;
        }
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
                    var newPatSuccess = angular.fromJson(newPatientPromise.data.response);
                    if (newPatientActiveId == '' && newPatientActiveIndex == '') {
                        if (errorCode == null && newPatientPromise.data.success == true) {
                            register.registerPatientForm = true;
                            register.newPatientForm = false;
                            register.registerPhoneNumber = false;
                            register.registerPatientNumber = false;
                            var newPatientSuccess = angular.fromJson(newPatientPromise.data.response);
                            register.totalPatientsList = newPatientSuccess;
                            register.patientName = newPatientSuccess[0].firstName;
                            register.registerPatientAddPatientHeader = false;
                            register.registerPatientHeader = true;
                            register.patientActiveId = newPatientSuccess[0].id;
                            register.patientNumberErrorMessage = false;
                            register.registerPatientToHospital.phoneNumber = register.patientSearchInTxtBox;
                        }
                    } else {
                        dboticaServices.patientDetailsSuccessFullyUpdatedSwal();
                        $log.log('new pat success is -----', newPatSuccess);
                        register.registeredPatientsList[newPatientActiveIndex].patientDetail.firstName = newPatSuccess[0].firstName;
                        $log.log('patient details are----', register.registeredPatientsList[newPatientActiveIndex].patientDetail);
                        angular.element('#registerPatientModal').modal('hide');
                    }
                    newPatientActiveIndex = '';
                    newPatientActiveId = '';
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
            if (registeredPatientActiveId !== undefined && registeredPatientActiveId !== null && registeredPatientActiveId !== '') {
                $log.log('in id check----');
                registerPatientRequestEntity.id = registeredPatientActiveId;
            }
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
                    if (errorCode == null && registerPatientSuccess.data.success) {
                        dboticaServices.registerPatientSuccessSwal();
                        if (registeredPatientActiveId == '' && registeredPatientActiveIndex == '') {
                            register.registeredPatientsList.unshift(registerPatientList);
                            entitiesArray.unshift(registerPatientList);
                        } else {
                            register.registeredPatientsList.splice(registeredPatientActiveIndex, 1, registerPatientList);
                            var itemIndex = dboticaServices.requiredIndexFromArray(entitiesArray, registerPatientList.id);
                            entitiesArray.splice(itemIndex, 1, registerPatientList);
                        }
                        angular.element('#registerPatientModal').modal('hide');
                        registeredPatientActiveIndex = '';
                        registeredPatientActiveId = '';
                    }
                }
            }, function(registerPatientError) {
                dboticaServices.noConnectivityError();
            });
        }
    }

    function deleteRegisteredPatient(patientRegistered, index) {
        $log.log('patient selected for delete is----', patientRegistered);
        swal({
                title: "Are you sure?",
                text: "You will not be able to recover Patient Details!!!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function() {
                var deletePatientRequestEntity = {};
                deletePatientRequestEntity.organizationId = patientRegistered.organizationId;
                deletePatientRequestEntity.organizationPatientNo = patientRegistered.organizationPatientNo;
                deletePatientRequestEntity.patientId = patientRegistered.patientId;
                deletePatientRequestEntity.phoneNumber = patientRegistered.patientDetail.phoneNumber;
                deletePatientRequestEntity.patientState = patientRegistered.patientState;
                deletePatientRequestEntity.id = patientRegistered.id;
                deletePatientRequestEntity.state = 'INACTIVE';
                var deleteRegisteredPatientPromise = dboticaServices.registerPatient(deletePatientRequestEntity);
                $log.log('delete register promise is----', deleteRegisteredPatientPromise);
                deleteRegisteredPatientPromise.then(function(deletePatientSuccess) {
                    var errorCode = deletePatientSuccess.data.errorCode;
                    if (!!errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        if (errorCode == null && deletePatientSuccess.data.success == true) {
                            dboticaServices.deleteRegisteredPatientSuccessSwal();
                            register.registeredPatientsList.splice(index, 1);
                            var itemIndex = dboticaServices.requiredIndexFromArray(entitiesArray, patientRegistered.id);
                            entitiesArray.splice(itemIndex, 1);
                        }
                    }
                }, function(deletePatientError) {
                    dboticaServices.noConnectivityError();
                });
                swal("Deleted!", "Registered Patient details has been deleted.", "success");
            });
    }

    function editPatientDetails(patientSelected, index) {
        $log.log('patient selected is-----', patientSelected);
        register.patientData.phoneNumber = patientSelected.patientDetail.phoneNumber;
        register.phoneNumberInNewPatientForm = true;
        register.registerPatientForm = false;
        register.newPatientForm = true;
        newPatientActiveIndex = index;
        newPatientActiveId = patientSelected.patientDetail.id;
        localPatient = patientSelected.patientDetail;
        register.patientData.age = getValueOfProperty('age');
        register.patientData.gender = getValueOfProperty('gender');
        register.patientData.bloodGroup = getValueOfProperty('bloodGroup');
        register.patientData.emailId = getValueOfProperty('emailId');
        register.patientData.drugAllergy = getValueOfProperty('drugAllergy');
        register.patientData.firstName = patientSelected.patientDetail.firstName;
    }

    function editPatientState(patient, index) {
        $log.log('state edit is----', patient);
        registeredPatientActiveIndex = '';
        registeredPatientActiveId = '';
        register.registerPatientForm = true;
        register.newPatientForm = false;
        register.totalPatientsList = [];
        register.patientName = patient.patientDetail.firstName;
        register.totalPatientsList.push(patient.patientDetail);
        register.patientActiveId = patient.id;
        register.registerPatientToHospital.organizationPatientNo = patient.organizationPatientNo;
        register.registerPatientToHospital.phoneNumber = patient.patientDetail.phoneNumber;
        register.registerPatientToHospital.patientState = patient.patientState;
        registeredPatientActiveId = patient.id;
        registeredPatientActiveIndex = index;
        register.registerPhoneNumber = true;
        register.registerPatientNumber = true;
        $log.log('active id for rdit is----', registeredPatientActiveId);
        $log.log('registeredPatientActiveIndex==', registeredPatientActiveIndex);
    }

    var getValueOfProperty = function(propertyName) {
        var result = '';
        switch (propertyName) {
            case 'age':
                if (localPatient.hasOwnProperty('age')) {
                    result = localPatient.age;
                }
                break;
            case 'gender':
                if (localPatient.hasOwnProperty('gender')) {
                    result = localPatient.gender;
                }
                break;
            case 'bloodGroup':
                if (localPatient.hasOwnProperty('bloodGroup')) {
                    result = localPatient.bloodGroup;
                }
                break;
            case 'drugAllergy':
                if (localPatient.hasOwnProperty('drugAllergy')) {
                    result = localPatient.drugAllergy;
                }
                break;
            case 'emailId':
                if (localPatient.hasOwnProperty('emailId')) {
                    result = localPatient.emailId;
                }
                break;
        }
        return result;
    }

    function registerPatientSearch() {
        var searchStringLength = register.registerPatientSearchTxt.length;
        if (searchStringLength >= parseInt(3)) {
            var searchDisplayArrayInTable = [];
            if (searchStringLength > entitiesArrayFlag) {
                angular.copy(register.registeredPatientsList, searchDisplayArrayInTable);
            } else {
                angular.copy(entitiesArray, searchDisplayArrayInTable);
            }
            var sortedItemsArray = [];
            angular.forEach(searchDisplayArrayInTable, function(activeRegisterPatient) {
                if (activeRegisterPatient.state == 'ACTIVE') {
                    var checkPatientNumber = activeRegisterPatient.organizationPatientNo.toLowerCase().indexOf(register.registerPatientSearchTxt.toLowerCase()) > -1;
                    var checkPatientName = activeRegisterPatient.patientDetail.firstName.toLowerCase().indexOf(register.registerPatientSearchTxt.toLowerCase()) > -1;
                    var checkPhoneNumber = activeRegisterPatient.patientDetail.phoneNumber.toLowerCase().indexOf(register.registerPatientSearchTxt.toLowerCase()) > -1;
                    var checkPatientState = activeRegisterPatient.patientState.toLowerCase().indexOf(register.registerPatientSearchTxt.toLowerCase()) > -1;
                    var check = checkPatientNumber || checkPatientName || checkPhoneNumber || checkPatientState;
                    if (check) {
                        sortedItemsArray.push(activeRegisterPatient);
                    }
                }
            });
            angular.copy(sortedItemsArray, register.registeredPatientsList);
            entitiesArrayFlag = register.registerPatientSearchTxt.length;
        }
        if (searchStringLength <= parseInt(2)) {
            entitiesArrayFlag = parseInt(0);
            angular.copy(entitiesArray, register.registeredPatientsList);
        }
    }
}]);
