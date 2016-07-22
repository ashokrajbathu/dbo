var myapp = angular.module('doctorAppServices', []);

myapp.service('doctorServices', doctorServices);
doctorServices.$inject = ['$http', '$state', '$log', '$q'];

function doctorServices($http, $state, $log, $q) {
    var doctorServices = this;

    doctorServices.loginErrorSwal = loginErrorSwal;
    doctorServices.noConnectivityError = noConnectivityError;
    doctorServices.login = login;
    doctorServices.loginError = loginError;
    doctorServices.signupDetailsMissingSwal = signupDetailsMissingSwal;
    doctorServices.logoutFromThePage = logoutFromThePage;
    doctorServices.signUpDoctorSuccessSwal = signUpDoctorSuccessSwal;
    doctorServices.doctorSignUp = doctorSignUp;
    doctorServices.logout = logout;

    function loginErrorSwal() {
        swal({
            title: "Error",
            text: "Please enter login credentials!!!!",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function noConnectivityError() {
        localStorage.clear();
        localStorage.setItem("isLoggedInDoctor", "false");
        swal({
            title: "Error",
            text: "Please try after some time!!!!",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
        $state.go('login');
    }

    function login(loginCredentials) {
        var deferred = $q.defer();
        var loginRequestEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/doctor/login',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(loginCredentials)
        }
        $http(loginRequestEntity).then(function(loginSuccess) {
            deferred.resolve(loginSuccess);
        }, function(loginError) {
            deferred.reject(loginError);
        });
        return deferred.promise;
    }

    function loginError(errorCode) {
        switch (errorCode) {
            case 'BAD_CREDENTIALS':
                swal({
                    title: "Error",
                    text: "Invalid User Name or Password!!!!",
                    type: "error",
                    confirmButtonText: "OK",
                    allowOutsideClick: true
                });
                break;
            case 'USER_ALREADY_LOGGED_IN':
                localStorage.setItem('isLoggedInDoctor', 'true');
                $state.go('doctorHome');
                break;
        }
    }

    function signupDetailsMissingSwal() {
        swal({
            title: "Error",
            text: "Kindly enter the details",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function logoutFromThePage(errorCode) {
        if (errorCode == 'NO_USER_LOGGED_IN' || errorCode == 'USER_ALREADY_LOGGED_IN') {
            swal({
                title: "Error",
                text: "You are not logged into your account. Kindly login again to view this page",
                type: "error",
                confirmButtonText: "OK",
                allowOutsideClick: true
            });
            localStorage.clear();
            localStorage.setItem("isLoggedInDoctor", "false");
            $state.go('login');
        }
    }

    function signUpDoctorSuccessSwal() {
        swal({
            title: "Success",
            text: "Thank You!! dBotica team will call you shortly",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function doctorSignUp(doctor) {
        var deferred = $q.defer();
        var signUpRequestEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/doctor/referDoctor',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(doctor)
        }
        $http(signUpRequestEntity).then(function(signUpResponse) {
            deferred.resolve(signUpResponse);
        }, function(signUpError) {
            deferred.reject(signUpError);
        });
        return deferred.promise;
    }

    function logout() {
        var deferred = $q.defer();
        var logoutRequest = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/doctor/logout',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true
        }
        $http(logoutRequest).then(function(logoutSuccess) {
            deferred.resolve(logoutSuccess);
        }, function(logoutError) {
            deferred.reject(logoutError);
        });
        return deferred.promise;
    }

};
