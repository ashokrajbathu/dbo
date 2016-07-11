angular.module('personalAssistant').controller('inpatientController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "ipd");
    var inpatientElement = this;

    inpatientElement.phoneNumberLengthValidation = phoneNumberLengthValidation;
    inpatientElement.patientSearch = patientSearch;
    inpatientElement.patientSelectFromDropdown = patientSelectFromDropdown;
    inpatientElement.addPatient = addPatient;
    inpatientElement.selectedDoctor = selectedDoctor;
    inpatientElement.selectedDoctorCategory = selectedDoctorCategory;
    inpatientElement.selectedDoctorname = selectedDoctorname;

    inpatientElement.PhoneNumberErrorMessage = false;
    inpatientElement.patientSearchBtnDisabled = true;
    inpatientElement.nameOrNumberErrorMessage = false;
    inpatientElement.number = "";
    inpatientElement.patientData = {};
    inpatientElement.patientData.firstName = "";
    inpatientElement.patientData.phoneNumber = "";
    inpatientElement.patientsListOfThatNumber = [];
    inpatientElement.activeDoctorCategoriesList = [];
    inpatientElement.patientIdActive = "";
    inpatientElement.dataDismiss = 'true';
    inpatientElement.doctorNameInPatient = '-Doctor Name-';
    inpatientElement.doctorCategoryName = '-Doctor Category-';
    var doctorCategoryObject = { 'doctorType': '-Doctor Category-' };
    var patientName = 'New Patient';
    var newPatient = { 'firstName': 'New Patient' };
    var doctorObject = { 'doctor': { 'firstName': '-Doctor Name-' } };
    var activeDoctorCategory = {};
    var activeDoctorsList = [];
    inpatientElement.activeDoctorsListToBeDisplayed = [];
    inpatientElement.activeDoctorsListToBeDisplayed.push(doctorObject);

    var organizationId = localStorage.getItem('orgId');

    var doctorsListPromise = dboticaServices.doctorsOfAssistant();
    doctorsListPromise.then(function(doctorsListSuccess) {
        var errorCode = doctorsListSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            inpatientElement.doctorsListInInpatient = angular.fromJson(doctorsListSuccess.data.response);
            inpatientElement.doctorsListInInpatient.unshift(doctorObject);
            if (inpatientElement.doctorsListInInpatient.length == 0) {
                dboticaServices.noConnectivityError();
            }
        }
    }, function(doctorsListError) {
        dboticaServices.noConnectivityError();
    });

    var doctorCategoriesPromise = dboticaServices.getDoctorCategories(organizationId);
    doctorCategoriesPromise.then(function(doctorCategorySuccess) {
        var errorCode = doctorCategorySuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var doctorCategoriesList = angular.fromJson(doctorCategorySuccess.data.response);
            $log.log('doctor categories list is----', doctorCategoriesList);
            inpatientElement.activeDoctorCategoriesList.push(doctorCategoryObject);
            angular.forEach(doctorCategoriesList, function(doctorCategoryEntity) {
                if (doctorCategoryEntity.state == 'ACTIVE') {
                    inpatientElement.activeDoctorCategoriesList.push(doctorCategoryEntity);
                }
            });
        }
    }, function(doctorCategoryError) {
        dboticaServices.noConnectivityError();
    });

    var doctorsListPromise = dboticaServices.doctorsListInMainAdmin(organizationId);
    doctorsListPromise.then(function(doctorsListSuccess) {
        var errorCode = doctorsListSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var doctorsListArray = angular.fromJson(doctorsListSuccess.data.response);
            $log.log('doctors list array is----', doctorsListArray);
            angular.forEach(doctorsListArray, function(doctorEntity) {
                if (doctorEntity.state == 'ACTIVE') {
                    activeDoctorsList.push(doctorEntity);
                }
            });
        }
    }, function(doctorsListError) {
        dboticaServices.noConnectivityError();
    });

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
                $log.log("inpatient search success is-----", angular.fromJson(inpatientSearchSuccess.data.response));
                inpatientElement.patientsListOfThatNumber = angular.fromJson(inpatientSearchSuccess.data.response);
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
            dboticaServices.noConnectivityError();
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
        var firstName = inpatientElement.patientData.firstName;
        var phoneNumber = inpatientElement.patientData.phoneNumber;
        if (firstName !== undefined && phoneNumber !== undefined && firstName !== "" && phoneNumber !== "") {
            inpatientElement.nameOrNumberErrorMessage = false;
            patientDataRequestEntity.gender = inpatientElement.patientData.gender;
            patientDataRequestEntity.bloodGroup = inpatientElement.patientData.bloodGroup;
            patientDataRequestEntity.drugAllergy = inpatientElement.patientData.drugAllergy;
            patientDataRequestEntity.firstName = firstName;
            patientDataRequestEntity.emailId = inpatientElement.patientData.emailId;
            patientDataRequestEntity.phoneNumber = phoneNumber;
            patientDataRequestEntity.age = inpatientElement.patientData.age;
            patientDataRequestEntity = JSON.stringify(patientDataRequestEntity);
            $log.log("patient in modal is----", patientDataRequestEntity);
            var inpatientPromise = dboticaServices.addNewPatient(patientDataRequestEntity);
            inpatientPromise.then(function(inpatientSuccessResponse) {
                var errorCode = inpatientSuccessResponse.data.errorCode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var inpatientAddResponse = angular.fromJson(inpatientSuccessResponse.data.response);
                    $log.log("add response is---", inpatientAddResponse);
                    var success = inpatientSuccessResponse.data.success;
                    if (errorCode == null && success == true) {
                        inpatientElement.patientNameInBox = firstName;
                        var inpatientRegisterRequestEntity = {};
                        inpatientRegisterRequestEntity.organizationId = organizationId;
                        if (inpatientElement.inpatientNumber == undefined || inpatientElement.inpatientNumber == '') {
                            inpatientElement.inpatientNumber = '';
                        }
                        inpatientRegisterRequestEntity.organizationPatientNo = inpatientElement.inpatientNumber;
                        inpatientRegisterRequestEntity.patientId = inpatientAddResponse[0].id;
                        inpatientRegisterRequestEntity.phoneNumber = inpatientAddResponse[0].phoneNumber;
                        inpatientRegisterRequestEntity.patientState = 'CHECK_IN';
                        $log.log('inpatientRegisterRequestEntity is----', inpatientRegisterRequestEntity);
                        var inpatientRegisterPromise = dboticaServices.registerPatient(inpatientRegisterRequestEntity);
                        inpatientRegisterPromise.then(function(inpatientRegisterSuccess) {
                            var errorCode = inpatientRegisterSuccess.data.errorCode;
                            if (!!errorCode) {
                                dboticaServices.logoutFromThePage(errorCode);
                            } else {
                                var registerSuccessResponse = angular.fromJson(inpatientRegisterSuccess.data.response);
                                $log.log('reg success response is---', registerSuccessResponse);
                                inpatientElement.patientNumberInBox = registerSuccessResponse.organizationPatientNo;
                                angular.element('#inpatientSearchModal').modal('hide');
                            }
                        }, function(inpatientRegisterError) {
                            dboticaServices.noConnectivityError();
                        });
                    }
                }
            }, function(inpatientErrorResponse) {
                dboticaServices.noConnectivityError();
            });
        } else {
            inpatientElement.nameOrNumberErrorMessage = true;
        }
    }

    function selectedDoctor(selectedDoctor) {
        inpatientElement.doctorNameInPatient = selectedDoctor.firstName;
        $log.log("selected doctor is---", selectedDoctor);
    }

    function selectedDoctorCategory(doctorCategoryEntity) {
        inpatientElement.doctorCategoryName = doctorCategoryEntity.doctorType;
        activeDoctorCategory = doctorCategoryEntity;
        if (doctorCategoryEntity.doctorType !== '-Doctor Category-') {
            inpatientElement.activeDoctorsListToBeDisplayed = [];
            inpatientElement.activeDoctorsListToBeDisplayed.push(doctorObject);
            angular.forEach(activeDoctorsList, function(activeDoctorEntity) {
                if (activeDoctorEntity.organizationDoctorCategory.doctorType == doctorCategoryEntity.doctorType) {
                    inpatientElement.activeDoctorsListToBeDisplayed.push(activeDoctorEntity);
                }
            });
        } else {
            inpatientElement.activeDoctorsListToBeDisplayed = [];
            inpatientElement.doctorCategoryName = doctorCategoryObject.doctorType;
            inpatientElement.doctorNameInPatient = doctorObject.doctor.firstName;
            inpatientElement.doctorNameInTheBox = '';
            inpatientElement.activeDoctorsListToBeDisplayed.push(doctorObject);
        }
    }

    function selectedDoctorname(doctornameEntity) {
        $log.log('doctor name selected is---', doctornameEntity);
        inpatientElement.doctorNameInPatient = doctornameEntity.doctor.firstName;
        if (doctornameEntity.doctor.firstName !== '-Doctor Name-') {
            inpatientElement.doctorNameInTheBox = doctornameEntity.doctor.firstName;
        } else {
            inpatientElement.doctorNameInTheBox = '';
        }
    }
}]);
