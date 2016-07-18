angular.module('personalAssistant').controller('inpatientController', inpatientController);
inpatientController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function inpatientController($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "ipd");
    var inpatientElement = this;
    inpatientElement.phoneNumberLengthValidation = phoneNumberLengthValidation;
    inpatientElement.patientSearch = patientSearch;
    inpatientElement.patientSelectFromDropdown = patientSelectFromDropdown;
    inpatientElement.addPatient = addPatient;
    inpatientElement.selectedDoctor = selectedDoctor;
    inpatientElement.selectedDoctorCategory = selectedDoctorCategory;
    inpatientElement.selectedDoctorname = selectedDoctorname;
    inpatientElement.selectedRoomCategory = selectedRoomCategory;
    inpatientElement.statusOfBed = statusOfBed;
    inpatientElement.admitPatient = admitPatient;
    /*inpatientElement.selectedRoom = selectedRoom;*/

    inpatientElement.PhoneNumberErrorMessage = false;
    inpatientElement.patientSearchBtnDisabled = true;
    inpatientElement.nameOrNumberErrorMessage = false;
    inpatientElement.mandatoryFieldsErrorMessage = false;
    inpatientElement.number = "";
    inpatientElement.patientData = {};
    inpatientElement.patientData.firstName = "";
    inpatientElement.patientData.phoneNumber = "";
    inpatientElement.patientsListOfThatNumber = [];
    inpatientElement.activeDoctorCategoriesList = [];
    inpatientElement.patientIdActive = "";
    inpatientElement.dataDismiss = 'true';
    inpatientElement.roomName = 'All';
    inpatientElement.roomTypes = ['All', 'Occupied Bed', 'Unoccupied Bed'];
    inpatientElement.roomCategoryName = '-Room Category-';
    inpatientElement.doctorNameInPatient = '-Doctor Name-';
    inpatientElement.doctorCategoryName = '-Doctor Category-';
    var doctorCategoryObject = { 'doctorType': '-Doctor Category-' };
    var patientName = 'New Patient';
    var allRoomTypeObject = { 'organizationRoomCategory': { 'roomType': 'All Room Type' } };
    var newPatient = { 'firstName': 'New Patient' };
    var doctorObject = { 'doctor': { 'firstName': '-Doctor Name-' } };
    var activeDoctorCategory = {};
    var activeDoctorsList = [];
    var bedsList = [];
    var sortedRoomsArray = [];
    var activeRoomIndex;
    var activeBedIndex;
    var activeRoom = {};
    var activeBed = {};
    inpatientElement.bedsListToBeDisplayed = [];
    inpatientElement.activeRoomsListToBeDisplayed = [];
    inpatientElement.activeDoctorsListToBeDisplayed = [];
    inpatientElement.activeRoomsList = [];
    inpatientElement.doctorDepartment = '';
    var activePatientId;
    var activeDoctorId = '';
    var activeDoctorName = '';
    inpatientElement.activeDoctorsListToBeDisplayed.push(doctorObject);

    var organizationId = localStorage.getItem('orgId');

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);


    var doctorsListPromise = dboticaServices.doctorsOfAssistant();
    doctorsListPromise.then(function(doctorsListSuccess) {
        var errorCode = doctorsListSuccess.data.errorCode;
        if (errorCode) {
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
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var doctorCategoriesList = angular.fromJson(doctorCategorySuccess.data.response);
            inpatientElement.activeDoctorCategoriesList = _.filter(doctorCategoriesList, function(entity) {
                return entity.state == 'ACTIVE';
            });
            inpatientElement.activeDoctorCategoriesList.unshift(doctorCategoryObject);
        }
    }, function(doctorCategoryError) {
        dboticaServices.noConnectivityError();
    });

    var doctorsListPromise = dboticaServices.doctorsListInMainAdmin(organizationId);
    doctorsListPromise.then(function(doctorsListSuccess) {
        var errorCode = doctorsListSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var doctorsListArray = angular.fromJson(doctorsListSuccess.data.response);
            activeDoctorsList = _.filter(doctorsListArray, function(entity) {
                return entity.state == 'ACTIVE';
            });
        }
    }, function(doctorsListError) {
        dboticaServices.noConnectivityError();
    });

    var roomsPromise = dboticaServices.getRooms(organizationId);
    roomsPromise.then(function(roomsSuccess) {
        var errorCode = roomsSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var roomsList = angular.fromJson(roomsSuccess.data.response);
            inpatientElement.activeRoomsList = _.filter(roomsList, function(entity) {
                return entity.state == 'ACTIVE';
            });
            angular.copy(inpatientElement.activeRoomsList, sortedRoomsArray);
            inpatientElement.activeRoomsList.unshift(allRoomTypeObject);
        }
    }, function(roomError) {
        dboticaServices.noConnectivityError();
    });

    var bedsPromise = dboticaServices.getBeds(organizationId);
    bedsPromise.then(function(bedsSuccess) {
        var errorCode = bedsSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var bedsListLocal = angular.fromJson(bedsSuccess.data.response);
            angular.forEach(bedsListLocal, function(bedsListLocalEntity) {
                if (bedsListLocalEntity.bedState == 'ACTIVE') {
                    bedsList.push(bedsListLocalEntity);
                }
            });
        }
    }, function(bedsError) {
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
        inpatientElement.inpatientNumber = '';
        inpatientElement.patientData.gender = 'MALE';
        inpatientElement.patientData.bloodGroup = 'O_POSITIVE';
        inpatientElement.patientData.phoneNumber = inpatientElement.number;
        var inpatientSearchPromise = dboticaServices.getPatientDetailsOfThatNumber(inpatientElement.number);
        inpatientSearchPromise.then(function(inpatientSearchSuccess) {
            var errorCode = inpatientSearchSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
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
        var inpatientNumber = inpatientElement.inpatientNumber;
        if (firstName !== undefined && phoneNumber !== undefined && firstName !== "" && phoneNumber !== "" && inpatientNumber !== undefined && inpatientNumber !== '') {
            inpatientElement.nameOrNumberErrorMessage = false;
            patientDataRequestEntity.gender = inpatientElement.patientData.gender;
            patientDataRequestEntity.bloodGroup = inpatientElement.patientData.bloodGroup;
            patientDataRequestEntity.drugAllergy = inpatientElement.patientData.drugAllergy;
            patientDataRequestEntity.firstName = firstName;
            patientDataRequestEntity.emailId = inpatientElement.patientData.emailId;
            patientDataRequestEntity.phoneNumber = phoneNumber;
            patientDataRequestEntity.age = inpatientElement.patientData.age;
            patientDataRequestEntity = JSON.stringify(patientDataRequestEntity);
            var inpatientPromise = dboticaServices.addNewPatient(patientDataRequestEntity);
            inpatientPromise.then(function(inpatientSuccessResponse) {
                var errorCode = inpatientSuccessResponse.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var inpatientAddResponse = angular.fromJson(inpatientSuccessResponse.data.response);
                    activePatientId = inpatientAddResponse[0].id;
                    var success = inpatientSuccessResponse.data.success;
                    if (errorCode == null && success == true) {
                        inpatientElement.patientNameInBox = firstName;
                        inpatientElement.patientNumberInBox = inpatientElement.inpatientNumber;
                        angular.element('#inpatientSearchModal').modal('hide');
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
    }

    function selectedDoctorCategory(doctorCategoryEntity) {
        inpatientElement.doctorCategoryName = doctorCategoryEntity.doctorType;;
        activeDoctorCategory = doctorCategoryEntity;
        if (doctorCategoryEntity.doctorType !== '-Doctor Category-') {
            inpatientElement.doctorDepartment = doctorCategoryEntity.doctorType;
            inpatientElement.activeDoctorsListToBeDisplayed = [];
            inpatientElement.activeDoctorsListToBeDisplayed.push(doctorObject);
            angular.forEach(activeDoctorsList, function(activeDoctorEntity) {
                if (activeDoctorEntity.organizationDoctorCategory.doctorType == doctorCategoryEntity.doctorType) {
                    inpatientElement.activeDoctorsListToBeDisplayed.push(activeDoctorEntity);
                }
            });
        } else {
            inpatientElement.doctorDepartment = '';
            inpatientElement.activeDoctorsListToBeDisplayed = [];
            inpatientElement.doctorCategoryName = doctorCategoryObject.doctorType;
            inpatientElement.doctorNameInPatient = doctorObject.doctor.firstName;
            inpatientElement.doctorNameInTheBox = '';
            inpatientElement.activeDoctorsListToBeDisplayed.push(doctorObject);
        }
    }

    function selectedDoctorname(doctornameEntity) {
        inpatientElement.doctorNameInPatient = doctornameEntity.doctor.firstName;
        if (doctornameEntity.doctor.firstName !== '-Doctor Name-') {
            activeDoctorId = '';
            activeDoctorName = doctornameEntity.doctor.firstName;
            inpatientElement.doctorNameInTheBox = doctornameEntity.doctor.firstName;
            activeDoctorId = doctornameEntity.doctorId;
        } else {
            inpatientElement.doctorNameInTheBox = '';
        }
    }

    function selectedRoomCategory(roomCategoryEntity) {
        inpatientElement.roomCategoryName = roomCategoryEntity.organizationRoomCategory.roomType;
        if (inpatientElement.roomCategoryName == 'All Room Type') {
            angular.copy(sortedRoomsArray, inpatientElement.activeRoomsListToBeDisplayed);
            /*inpatientElement.activeRoomsListToBeDisplayed.shift();*/
        } else {
            inpatientElement.activeRoomsListToBeDisplayed = [];
            angular.forEach(sortedRoomsArray, function(activeRoomEntity) {
                if (activeRoomEntity.organizationRoomCategory.roomType == inpatientElement.roomCategoryName) {
                    inpatientElement.activeRoomsListToBeDisplayed.push(activeRoomEntity);
                }
            });
        }
    }

    function statusOfBed(roomEntity, roomIndex) {
        activeRoomIndex = roomIndex;
        angular.copy(roomEntity, activeRoom);
        inpatientElement.bedsListToBeDisplayed = [];
        angular.forEach(bedsList, function(bedListItem) {
            var floorNumber = bedListItem.organizationRoom.floorNo;
            var roomNumber = bedListItem.organizationRoom.roomNo;
            var bedStatus = bedListItem.bedStatus;
            if (floorNumber == roomEntity.floorNo && roomNumber == roomEntity.roomNo && bedStatus == 'VACANT') {
                inpatientElement.bedsListToBeDisplayed.push(bedListItem);
            }
        });
    }

    function admitPatient(bedEntity, bedIndex) {
        activeBedIndex = _.findLastIndex(bedsList, function(entity) {
            return entity.id == bedEntity.id;
        });
        var patientName = inpatientElement.patientNameInBox;
        var doctorDepartment = inpatientElement.doctorDepartment;
        var doctorName = inpatientElement.doctorNameInTheBox;
        if (patientName !== undefined && patientName !== '' && doctorDepartment !== undefined && doctorDepartment !== '' && doctorName !== undefined && doctorName !== '') {
            inpatientElement.mandatoryFieldsErrorMessage = false;
            var bedRequestEntity = {};
            bedRequestEntity.patientId = activePatientId;
            bedRequestEntity.inPatientNumber = inpatientElement.inpatientNumber;
            bedRequestEntity.organizationBedId = bedEntity.id;
            var date = new Date();
            var longValueOfDate = date.getTime();
            var detailsObject = {};
            detailsObject.inPatientName = patientName;
            bedRequestEntity.nextChange = longValueOfDate;
            detailsObject.admitTime = longValueOfDate;
            detailsObject.patientName = inpatientElement.patientNameInBox;
            detailsObject.floorNumber = activeRoom.floorNo;
            detailsObject.roomNumber = activeRoom.roomNo;
            detailsObject.bedNumber = bedEntity.bedNo;
            bedRequestEntity.details = JSON.stringify(detailsObject);
            bedRequestEntity.doctorDetail = {};
            bedRequestEntity.organizationId = organizationId;
            bedRequestEntity.doctorDetail.doctorId = activeDoctorId;
            bedRequestEntity.doctorDetail.doctorDepartment = doctorDepartment;
            bedRequestEntity.doctorDetail.doctorName = activeDoctorName;
            var addPatientToBedPromise = dboticaServices.addPatientToBed(bedRequestEntity);
            $log.log('add patient to bed promise---', addPatientToBedPromise);
            addPatientToBedPromise.then(function(addPatientSuccess) {
                var errorCode = addPatientSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var addPatientToBedResponse = angular.fromJson(addPatientSuccess.data.response);
                    if (errorCode == null && addPatientSuccess.data.success == true) {
                        inpatientElement.patientNameInBox = '';
                        inpatientElement.patientNumberInBox = '';
                        inpatientElement.doctorDepartment = '';
                        inpatientElement.doctorNameInTheBox = '';
                        inpatientElement.doctorCategoryName = '-Doctor Category-';
                        inpatientElement.roomCategoryName = '-Room Category-';
                        inpatientElement.doctorNameInPatient = '-Doctor Name-';
                        sortedRoomsArray[activeRoomIndex].bedCount = inpatientElement.activeRoomsListToBeDisplayed[activeRoomIndex].bedCount - 1;
                        bedsList.splice(activeBedIndex, 1);
                        inpatientElement.bedsListToBeDisplayed = [];
                        inpatientElement.activeRoomsListToBeDisplayed = [];
                        inpatientElement.activeDoctorsListToBeDisplayed = [];
                        inpatientElement.activeDoctorsListToBeDisplayed.push(doctorObject);
                        dboticaServices.admitPatientSuccessSwal();
                    }
                }
            }, function(addpatientError) {
                dboticaServices.noConnectivityError();
            });

        } else {
            inpatientElement.mandatoryFieldsErrorMessage = true;
        }
    }

};
