angular.module('doctor').controller('doctorProfileController', doctorProfileController);
doctorProfileController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function doctorProfileController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'doctorProfile');
    var doctorProfile = this;
    doctorProfile.oneAtATime = true;
    doctorProfile.open = true;
    doctorProfile.status = {};
    doctorProfile.status.isFirstOpen = true;
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

    doctorProfile.changeDoctorPassword = changeDoctorPassword;
    doctorProfile.changeDoctorDetails = changeDoctorDetails;
    doctorProfile.changeAssistantState = changeAssistantState;


    doctorActive = localStorage.getItem('currentDoctor');
    doctorActive = angular.fromJson(doctorActive);
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
};
