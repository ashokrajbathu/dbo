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
    doctorServices.getPatientDetailsOfThatNumber = getPatientDetailsOfThatNumber;
    doctorServices.registerPatientSuccessSwal = registerPatientSuccessSwal;
    doctorServices.noActivePatientSwal = noActivePatientSwal;
    doctorServices.nonAllergicDrugSwal = nonAllergicDrugSwal;
    doctorServices.getTests = getTests;
    doctorServices.daysToDate = daysToDate;
    doctorServices.addNewPatient = addNewPatient;
    doctorServices.addPrescription = addPrescription;
    doctorServices.addPrescriptionSuccessSwal = addPrescriptionSuccessSwal;
    doctorServices.noPatientOrNoDoctorSwal = noPatientOrNoDoctorSwal;

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

    function getPatientDetailsOfThatNumber(phoneNumberForSearch) {
        var deferred = $q.defer();
        var patientRequest = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/doctor/getPatients?patientIds=' + phoneNumberForSearch,
            withCredentials: true
        }
        $http(patientRequest).then(function(patientSuccess) {
            deferred.resolve(patientSuccess);
        }, function(patientError) {
            deferred.reject(patientError);
        });
        return deferred.promise;
    }

    function addNewPatient(newPatientDetails) {
        var deferred = $q.defer();
        var newPatientRequest = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/doctor/addPatient',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: newPatientDetails
        }
        $http(newPatientRequest).then(function(newPatientResponse) {
            deferred.resolve(newPatientResponse);
        }, function(newPatientError) {
            deferred.reject(newPatientError);
        });
        return deferred.promise;
    }

    function registerPatientSuccessSwal() {
        swal({
            title: "Success",
            text: "Patient Details Successfully Added or Updated.",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function noActivePatientSwal() {
        swal({
            title: "Error",
            text: "Please select patient before adding drugs",
            type: "error",
            confirmButtonText: "OK"
        });
    }

    function nonAllergicDrugSwal() {
        swal({
            title: "Error",
            text: "Please select a drug to which patient is not allergic",
            type: "error",
            confirmButtonText: "OK"
        });
    }

    function getTests(test) {
        var deferred = $q.defer();
        var getTestRequestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/diagnosis/getDiagnosisTest?testName=' + test,
            withCredentials: true
        }
        $http(getTestRequestEntity).then(function(getTestsResponse) {
            deferred.resolve(getTestsResponse);
        }, function(getTestsResponse) {
            deferred.reject(getTestsResponse);
        });
        return deferred.promise;
    }

    function daysToDate(noOfDays) {
        var revisitDate;
        var date = new Date();
        var newDate = new Date(date.getTime() + noOfDays * 24 * 60 * 60 * 1000);
        var day = newDate.getDate();
        var month = Number(newDate.getMonth()) + 1;
        var year = newDate.getFullYear();
        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;
        var revisitDate = day + "/" + month + "/" + year;
        return revisitDate;
    }

    function addPrescription(prescription) {
        var deferred = $q.defer();
        var prescriptionEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/prescription/updatePrescription',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(prescription)
        }
        $http(prescriptionEntity).then(function(prescriptionSuccess) {
            deferred.resolve(prescriptionSuccess);
        }, function(prescriptionError) {
            deferred.reject(prescriptionError);
        });
        return deferred.promise;
    }

    function addPrescriptionSuccessSwal() {
        swal({
            title: "Success",
            text: "Prescription Successfully Saved!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function noPatientOrNoDoctorSwal() {
        swal({
            title: "Info",
            text: "Please Select Patient before saving prescription!!!",
            type: "info",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

};
