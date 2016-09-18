angular.module('doctor').controller('doctorProfileController', doctorProfileController);
doctorProfileController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function doctorProfileController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'doctorProfile');
    var doctorProfile = this;
    doctorProfile.oneAtATime = true;
    doctorProfile.open = true;
    doctorProfile.status = {};
    doctorProfile.status.isFirstOpen = true;
    doctorProfile.doctor = {};
    doctorProfile.password = {};
    var doctorActive = {};
    doctorProfile.update = {};
    doctorProfile.assistantsOfDoctor = [];
    doctorProfile.password.old = '';
    doctorProfile.password.new = '';
    doctorProfile.password.reenter = '';
    doctorProfile.update.firstName = '';
    doctorProfile.update.lastName = '';
    doctorProfile.update.speciality = '';
    doctorProfile.update.organization = '';
    doctorProfile.update.qualification = '';
    doctorProfile.update.emailId = '';
    doctorProfile.update.phoneNumber = '';
    doctorProfile.update.city = '';
    doctorProfile.update.officeAddress = '';
    doctorProfile.update.doctorRegistrationNo = '';
    doctorProfile.update.websiteUrl = '';
    doctorProfile.itemsPerPage = 5;
    doctorProfile.currentPage = 1;
    var entitiesArray = [];
    var displayArray = [];
    doctorProfile.CreditsListToBeDisplayed = [];
    doctorProfile.clinicAddress = {};
    doctorProfile.clinicAddress.address = '';
    doctorProfile.clinicAddress.city = '';
    doctorProfile.clinicAddress.pincode = '';
    var activeAddress = {};
    var activeAddressIndex;
    doctorProfile.addNewAddress = true;
    doctorProfile.backToAddresses = false;
    doctorProfile.showAddressesRadios = true;

    doctorProfile.changeDoctorPassword = changeDoctorPassword;
    doctorProfile.changeDoctorDetails = changeDoctorDetails;
    doctorProfile.changeAssistantState = changeAssistantState;
    doctorProfile.pageChanged = pageChanged;
    doctorProfile.selectActiveAddress = selectActiveAddress;
    doctorProfile.changeClinicAddress = changeClinicAddress;
    doctorProfile.updateAddress = updateAddress;


    doctorActive = localStorage.getItem('currentDoctor');
    doctorActive = angular.fromJson(doctorActive);
    angular.copy(doctorActive, doctorProfile.doctor);
    if (_.isEmpty(doctorActive)) {
        localStorage.clear();
        localStorage.setItem("isLoggedInDoctor", "false");
        doctorServices.logoutFromThePage('NO_USER_LOGGED_IN');
        $state.go('login');
    } else {
        if (!_.isEmpty(doctorActive.firstName)) {
            doctorProfile.update.firstName = doctorActive.firstName;
        }
        if (!_.isEmpty(doctorActive.lastName)) {
            doctorProfile.update.lastName = doctorActive.lastName;
        }
        if (!_.isEmpty(doctorActive.speciality)) {
            doctorProfile.update.speciality = doctorActive.speciality;
        }
        if (!_.isEmpty(doctorActive.phoneNumber)) {
            doctorProfile.update.phoneNumber = doctorActive.phoneNumber;
        }
        if (!_.isEmpty(doctorActive.city)) {
            doctorProfile.update.city = doctorActive.city;
        }
        if (!_.isEmpty(doctorActive.qualification)) {
            doctorProfile.update.qualification = doctorActive.qualification;
        }
        if (!_.isEmpty(doctorActive.organization)) {
            doctorProfile.update.organization = doctorActive.organization;
        }
        if (!_.isEmpty(doctorActive.emailId)) {
            doctorProfile.update.emailId = doctorActive.emailId;
        }
        if (!_.isEmpty(doctorActive.websiteUrl)) {
            doctorProfile.update.websiteUrl = doctorActive.websiteUrl;
        }
        if (!_.isEmpty(doctorActive.officeAddress)) {
            doctorProfile.update.officeAddress = doctorActive.officeAddress;
        }
        if (!_.isEmpty(doctorActive.officeAddress)) {
            doctorProfile.update.doctorRegistrationNo = doctorActive.doctorRegistrationNo;
        }
    }

    $log.log('current doctor is----', doctorActive);

    var getAssistantsPromise = doctorServices.getMyAssistants();
    getAssistantsPromise.then(function(getAssistantsSuccess) {
        var errorCode = getAssistantsSuccess.data.errorCode;
        if (errorCode) {
            doctorServices.logoutFromThePage(errorCode);
        } else {
            if (errorCode == null && getAssistantsSuccess.data.success) {
                doctorProfile.assistantsOfDoctor = angular.fromJson(getAssistantsSuccess.data.response);
                $log.log('assis are---', doctorProfile.assistantsOfDoctor);
            }
        }
    }, function(getAssistantsError) {
        doctorServices.logoutFromThePage();
    });

    var getCreditsHistory = doctorServices.getCreditsHistoryOfDoctor(doctorActive.id);
    getCreditsHistory.then(function(getCreditsSuccess) {
        var errorCode = getCreditsSuccess.data.errorCode;
        if (errorCode) {
            doctorServices.logoutFromThePage(errorCode);
        } else {
            var getCreditsResponse = angular.fromJson(getCreditsSuccess.data.response);
            $log.log('credits response is----', getCreditsResponse);
            doctorProfile.totalItems = getCreditsResponse.length;
            angular.copy(getCreditsResponse, entitiesArray);
            displayArray = _.chunk(entitiesArray, doctorProfile.itemsPerPage);
            angular.copy(displayArray[0], doctorProfile.CreditsListToBeDisplayed);
        }
    }, function(getCreditsError) {
        doctorServices.noConnectivityError();
    });

    var clinicsAddressesPromise = doctorServices.getClinicsAddress();
    clinicsAddressesPromise.then(function(clinicsSuccess) {
        var errorCode = clinicsSuccess.data.errorCode;
        if (errorCode) {
            doctorServices.logoutFromThePage(errorCode);
        } else {
            doctorProfile.clinicAddresses = angular.fromJson(clinicsSuccess.data.response);
            $log.log('clinics addresses are----', doctorProfile.clinicAddresses);
            if (doctorProfile.clinicAddresses.length > 0) {
                var addressActive = localStorage.getItem('doctorHospitalLocation');
                addressActive = angular.fromJson(addressActive);
                if (_.isEmpty(addressActive)) {
                    doctorProfile.radio0 = true;
                    activeAddressIndex = 0;
                    activeAddress = doctorProfile.clinicAddresses[0];
                    doctorProfile.clinicAddress.address = doctorProfile.clinicAddresses[0].address;
                    doctorProfile.clinicAddress.city = doctorProfile.clinicAddresses[0].city;
                    doctorProfile.clinicAddress.pincode = doctorProfile.clinicAddresses[0].pincode;
                } else {
                    var addressIndex = _.findLastIndex(doctorProfile.clinicAddresses, function(entity) {
                        return entity.address == addressActive.address;
                    });
                    doctorProfile['radio' + addressIndex] = true;
                    activeAddressIndex = addressIndex;
                    activeAddress = doctorProfile.clinicAddresses[addressIndex];
                    doctorProfile.clinicAddress.address = doctorProfile.clinicAddresses[addressIndex].address;
                    doctorProfile.clinicAddress.city = doctorProfile.clinicAddresses[addressIndex].city;
                    doctorProfile.clinicAddress.pincode = doctorProfile.clinicAddresses[addressIndex].pincode;
                }
            }
        }
    }, function(clinicsError) {
        doctorServices.noConnectivityError();
    });

    function changeDoctorPassword() {
        var oldPassword = doctorProfile.password.old;
        var newPassword = doctorProfile.password.new;
        var reenterPassword = doctorProfile.password.reenter;
        var changePasswordRequest = {};
        changePasswordRequest.oldPassword = oldPassword;
        changePasswordRequest.newPassword = newPassword;
        changePasswordRequest.userId = doctorActive.id;
        if (oldPassword !== '' && newPassword !== '' && reenterPassword !== '') {
            if (newPassword == reenterPassword) {
                var changePasswordPromise = doctorServices.changeDoctorPassword(changePasswordRequest);
                changePasswordPromise.then(function(changePasswordSuccess) {
                    var errorCode = changePasswordSuccess.data.errorCode;
                    if (errorCode) {
                        doctorServices.logoutFromThePage(errorCode);
                    } else {
                        if (errorCode == null && changePasswordSuccess.data.success) {
                            doctorServices.changePasswordSuccessSwal();
                            doctorProfile.password.old = '';
                            doctorProfile.password.new = '';
                            doctorProfile.password.reenter = '';
                        }
                    }
                }, function(changePasswordError) {
                    doctorServices.noConnectivityError();
                });
            } else {
                doctorServices.newOldPasswordsSameSwal();
            }
        } else {
            doctorServices.changePasswordFieldsSwal();
        }
    }

    function changeDoctorDetails() {
        var changeDetailsRequest = {};
        changeDetailsRequest.id = doctorActive.id;
        changeDetailsRequest.firstName = doctorProfile.update.firstName;
        changeDetailsRequest.lastName = doctorProfile.update.lastName;
        changeDetailsRequest.speciality = doctorProfile.update.speciality;
        changeDetailsRequest.websiteUrl = doctorProfile.update.websiteUrl;
        changeDetailsRequest.city = doctorProfile.update.city;
        changeDetailsRequest.qualification = doctorProfile.update.qualification;
        changeDetailsRequest.organization = doctorProfile.update.organization;
        changeDetailsRequest.address = doctorProfile.update.officeAddress;
        var changeDetailsPromise = doctorServices.updateDetails(changeDetailsRequest);
        changeDetailsPromise.then(function(changeDetailsSuccess) {
            var errorCode = changeDetailsSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                if (errorCode == null && changeDetailsSuccess.data.success) {
                    doctorServices.updateDetailsSuccessSwal();
                }
            }
        }, function(changeDetailsError) {
            doctorServices.noConnectivityError();
        });
    }

    function changeAssistantState(assistantForStateChange, state) {
        var markStatusRequest = {};
        if (assistantForStateChange.assistantMapping.state !== state) {
            markStatusRequest.assistantMappingId = assistantForStateChange.assistantMapping.id;
            if (assistantForStateChange.assistantMapping.state == 'ACTIVE') {
                markStatusRequest.state = 'INACTIVE';
            } else {
                markStatusRequest.state = 'ACTIVE';
            }
            var markAssistantPromise = doctorServices.markAssistantStatus(markStatusRequest);
            markAssistantPromise.then(function(markAssistantSucess) {
                var errorCode = markAssistantSucess.data.errorCode;
                if (errorCode) {
                    doctorServices.logoutFromThePage(errorCode);
                } else {
                    if (errorCode == null && markAssistantSucess.data.success == true) {
                        if (assistantForStateChange.assistantMapping.state == 'ACTIVE') {
                            assistantForStateChange.assistantMapping.state = 'INACTIVE';
                        } else {
                            assistantForStateChange.assistantMapping.state = 'ACTIVE';
                        }
                    }
                }
            }, function(markAssistantError) {
                doctorServices.noConnectivityError();
            });
        }
    }

    function pageChanged() {
        var requiredIndex = doctorProfile.currentPage - 1;
        displayArray = [];
        doctorProfile.CreditsListToBeDisplayed = [];
        displayArray = _.chunk(entitiesArray, doctorProfile.itemsPerPage);
        angular.copy(displayArray[requiredIndex], doctorProfile.CreditsListToBeDisplayed);
    }

    function selectActiveAddress(addressEntity, index) {
        activeAddress = addressEntity;
        activeAddressIndex = index;
        doctorProfile.clinicAddress.address = addressEntity.address;
        doctorProfile.clinicAddress.city = addressEntity.city;
        doctorProfile.clinicAddress.pincode = addressEntity.pincode;
        addLocation(addressEntity);
    }

    function changeClinicAddress() {
        var addressRequestEntity = {};
        if (doctorProfile.clinicAddress.address !== '' || doctorProfile.clinicAddress.city !== '') {
            addressRequestEntity.userId = doctorActive.id;
            addressRequestEntity.role = 'DOCTOR';
            addressRequestEntity.label = 'office';
            addressRequestEntity.primaryAddress = true;
            addressRequestEntity.state = 'ACTIVE';
            if (!_.isEmpty(activeAddress)) {
                addressRequestEntity.id = activeAddress.id;
            }
            addressRequestEntity.address = doctorProfile.clinicAddress.address;
            addressRequestEntity.city = doctorProfile.clinicAddress.city;
            addressRequestEntity.pincode = doctorProfile.clinicAddress.pincode;
            var updateAddressPromise = doctorServices.updateClinicAddress(addressRequestEntity);
            updateAddressPromise.then(function(updateAddressSuccess) {
                var errorCode = updateAddressSuccess.data.errorCode;
                if (errorCode) {
                    doctorServices.logoutFromThePage(errorCode);
                } else {
                    var updateAddressResponse = angular.fromJson(updateAddressSuccess.data.response);
                    if (errorCode == null && updateAddressSuccess.data.success) {
                        doctorServices.updateAddressSuccessSwal();
                        if (!_.isEmpty(activeAddress)) {
                            var addressIndex = _.findLastIndex(doctorProfile.clinicAddresses, function(entity) {
                                return entity.id == updateAddressResponse.id;
                            });
                            doctorProfile.clinicAddresses.splice(addressIndex, 1, updateAddressResponse);
                            addLocation(updateAddressResponse);
                        } else {
                            if (doctorProfile.clinicAddresses.length == 0) {
                                doctorProfile.radio0 = true;
                                activeAddressIndex = 0;
                                addLocation(updateAddressResponse);
                            }
                            doctorProfile.clinicAddresses.push(updateAddressResponse);
                        }
                    }
                }
            }, function(updateAddressError) {
                doctorServices.noConnectivityError();
            });
        } else {
            doctorServices.enterAddressSwal();
        }
    }

    function updateAddress(addressesLink) {
        if (addressesLink == 'newAddress') {
            activeAddress = {};
            doctorProfile.addNewAddress = false;
            doctorProfile.backToAddresses = true;
            doctorProfile.showAddressesRadios = false;
            doctorProfile.clinicAddress.address = '';
            doctorProfile.clinicAddress.city = '';
            doctorProfile.clinicAddress.pincode = '';
        } else {
            activeAddress = doctorProfile.clinicAddresses[0];
            doctorProfile.addNewAddress = true;
            doctorProfile.showAddressesRadios = true;
            doctorProfile.backToAddresses = false;
            doctorProfile.clinicAddress.address = activeAddress.address;
            doctorProfile.clinicAddress.city = activeAddress.city;
            doctorProfile.clinicAddress.pincode = activeAddress.pincode;
        }
    }

    var addLocation = function(addressEntity) {
        var addressOfTheDoctor = {};
        addressOfTheDoctor.address = addressEntity.address;
        addressOfTheDoctor.city = addressEntity.city;
        addressOfTheDoctor = JSON.stringify(addressOfTheDoctor);
        localStorage.setItem('doctorHospitalLocation', addressOfTheDoctor);
    }
};
