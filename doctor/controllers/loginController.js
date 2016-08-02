angular.module('doctor').controller('loginController', loginController);
loginController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function loginController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    if (localStorage.getItem("isLoggedInDoctor") == "true") {
        $state.go('doctorHome');
    }
    var login = this;
    login.signInForm = true;
    login.signupForm = false;
    login.loginCredentials = {};
    login.signupData = {};
    login.loginCredentials.emailId = '';
    login.loginCredentials.password = '';
    login.signupData.doctorName = '';
    login.signupData.emailId = '';
    login.signupData.phoneNumber = '';

    login.doctorLogin = doctorLogin;
    login.signup = signup;
    login.newDoctorSignUpForm = newDoctorSignUpForm;
    login.signin = signin;

    function newDoctorSignUpForm() {
        login.signInForm = false;
        login.signupForm = true;
    }

    function signin() {
        login.signInForm = true;
        login.signupForm = false;
    }

    function doctorLogin() {
        var emailId = login.loginCredentials.emailId;
        var password = login.loginCredentials.password;
        var activeClinicAddress = {};
        var clinicAddress = {};
        activeClinicAddress.address = '';
        activeClinicAddress.city = '';
        angular.copy(activeClinicAddress, clinicAddress);
        localStorage.setItem('doctorHospitalLocation', JSON.stringify(activeClinicAddress));
        if (emailId !== undefined && emailId !== '' && password !== undefined && password !== '') {
            var doctorLoginPromise = doctorServices.login(login.loginCredentials);
            doctorLoginPromise.then(function(doctorLoginSuccess) {
                var loginSuccess = doctorLoginSuccess.data.success;
                var errorCode = doctorLoginSuccess.data.errorCode;
                if (!loginSuccess && errorCode) {
                    doctorServices.loginError(errorCode);
                } else {
                    var doctorActive = doctorLoginSuccess.data.response;
                    localStorage.setItem('currentDoctor', doctorActive);
                    localStorage.setItem('currentDoctorState', 'drugPrescriptions');
                    localStorage.setItem('isLoggedInDoctor', 'true');
                    var getAddressesPromise = doctorServices.getClinicsAddress();
                    getAddressesPromise.then(function(getAddressesSuccess) {
                        var errorCode = getAddressesSuccess.data.errorCode;
                        if (errorCode) {
                            doctorServices.logoutFromThePage(errorCode);
                        } else {
                            var clinicAddressResponse = angular.fromJson(getAddressesSuccess.data.response);
                            $log.log('clinic address response is---', clinicAddressResponse);
                            if (errorCode == null && getAddressesSuccess.data.success) {
                                if (clinicAddressResponse.length > 0) {
                                    if (_.has(clinicAddressResponse[0], 'address')) {
                                        clinicAddress.address = clinicAddressResponse[0].address;
                                    }
                                    if (_.has(clinicAddressResponse[0], 'city')) {
                                        clinicAddress.city = clinicAddressResponse[0].city;
                                    }
                                    localStorage.setItem('doctorHospitalLocation', JSON.stringify(clinicAddress));
                                }
                            }
                        }
                    }, function(getAddressesError) {
                        doctorServices.noConnectivityError();
                    });
                    $state.go('doctorHome');
                }
            }, function(doctorLoginError) {
                doctorServices.noConnectivityError();
            });
        } else {
            doctorServices.loginErrorSwal();
        }
    }


    /*<<<<<<<<<<<<-----------CHECK WITH SHYAM OR SULEEP ON SIGNUP ISSUE----------------------->>>>>>>>>>>>>>>>>*/
    function signup() {
        var doctorName = login.signupData.doctorName;
        var doctorEmailId = login.signupData.emailId;
        var doctorPhoneNumber = login.signupData.phoneNumber;
        if (doctorName == '' || (doctorEmailId == '' && doctorPhoneNumber == '')) {
            doctorServices.signupDetailsMissingSwal();
        } else {
            var doctorSignUpPromise = doctorServices.doctorSignUp(login.signupData);
            doctorSignUpPromise.then(function(doctorSignUpSuccess) {
                var errorCode = doctorSignUpSuccess.data.errorCode;
                if (errorCode) {
                    doctorServices.logoutFromThePage(errorCode);
                } else {
                    if (errorCode == null && doctorSignUpSuccess.data.success) {
                        doctorServices.signUpDoctorSuccessSwal();
                        login.signupData.doctorName = '';
                        login.signupData.emailId = '';
                        login.signupData.phoneNumber = '';
                    }
                }
            }, function(doctorSignUpError) {
                doctorServices.noConnectivityError();
            });
        }
    }
};
