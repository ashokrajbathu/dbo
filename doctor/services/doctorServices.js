angular.module('doctorAppServices', []).service('doctorServices', doctorServices);
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
    doctorServices.changePasswordFieldsSwal = changePasswordFieldsSwal;
    doctorServices.changeDoctorPassword = changeDoctorPassword;
    doctorServices.changePasswordSuccessSwal = changePasswordSuccessSwal;
    doctorServices.newOldPasswordsSameSwal = newOldPasswordsSameSwal;
    doctorServices.updateDetails = updateDetails;
    doctorServices.updateDetailsSuccessSwal = updateDetailsSuccessSwal;
    doctorServices.getMyAssistants = getMyAssistants;
    doctorServices.markAssistantStatus = markAssistantStatus;
    doctorServices.getCreditsHistoryOfDoctor = getCreditsHistoryOfDoctor;
    doctorServices.getClinicsAddress = getClinicsAddress;
    doctorServices.enterAddressSwal = enterAddressSwal;
    doctorServices.updateAddressSuccessSwal = updateAddressSuccessSwal;
    doctorServices.updateClinicAddress = updateClinicAddress;
    doctorServices.getLongValueOfDate = getLongValueOfDate;
    doctorServices.getAllMyPatients = getAllMyPatients;
    doctorServices.referDetailsErrorSwal = referDetailsErrorSwal;
    doctorServices.referDoctorToDbotica = referDoctorToDbotica;
    doctorServices.referDoctorSuccessSwal = referDoctorSuccessSwal;
    doctorServices.getDoctorEvents = getDoctorEvents;
    doctorServices.drugTemplate = drugTemplate;
    doctorServices.getDrugTemplates = getDrugTemplates;
    doctorServices.noPatientBeforeDrugTemplateSwal = noPatientBeforeDrugTemplateSwal;
    doctorServices.bookAppointmentForPatient = bookAppointmentForPatient;
    doctorServices.appointmentSuccessSwal = appointmentSuccessSwal;
    doctorServices.appointmentBookFail = appointmentBookFail;
    doctorServices.getTodayString = getTodayString;
    doctorServices.selectDateSwal = selectDateSwal;
    doctorServices.prescriptionsOfPatient = prescriptionsOfPatient;
    doctorServices.addPatientFromDrugController = addPatientFromDrugController;
    doctorServices.getDoctorTemplates = getDoctorTemplates;
    doctorServices.getPatientCaseHistory = getPatientCaseHistory;
    doctorServices.registerPatient = registerPatient;
    doctorServices.getOrgPatientDetails = getOrgPatientDetails;
    doctorServices.getPrescriptionsOfCase = getPrescriptionsOfCase;
    doctorServices.getLocalObject = getLocalObject;
    doctorServices.getDrugList = getDrugList;
    doctorServices.saveTemplateInstance = saveTemplateInstance;
    doctorServices.closeCase = closeCase;
    doctorServices.longDateToReadableDate = longDateToReadableDate;
    doctorServices.getCurrentActivePrescription = getCurrentActivePrescription;
    doctorServices.addImages = addImages;

    function longDateToReadableDate(longDate) {
        var result;
        if (longDate == undefined || longDate == "") {
            result = "";
        } else {
            result = new Date(longDate);
            result = result.toLocaleString();
            var resultArray = result.split(',');
            var resultArrayDate = resultArray[0];
            var resultArrayDateReadable = resultArrayDate.split('/');
            result = resultArrayDateReadable[1] + '/' + resultArrayDateReadable[0] + '/' + resultArrayDateReadable[2];
        }
        return result;
    }

    function addImages(image) {
        $log.log('kdfd---', image);
        //var fd = new FormData(image);
        var fd = new FormData();
        fd.append('file', image.file);
        fd.append('imageName', image.imageName);
        $log.log('fd is----', fd); 
        var deferred = $q.defer();
        var imageRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/doctor/addDoctorDiseaseImage',
            headers: {
                //'Content-Type': 'multipart/form-data;boundary=diseaseImage',
                'Content-Type': undefined,
                'Accept' : 'application/json'

            },
            processData: false,
            withCredentials: true,
            data: fd
        }
        $log.log('request is in service-----', imageRequest);
        $http(imageRequest).then(function(imageSuccess) {
            deferred.resolve(imageSuccess);
        }, function(imageError) {
            deferred.reject(imageError);
        });
        return deferred.promise;
    }

    function getCurrentActivePrescription(prescriptionId) {
        var deferred = $q.defer();
        var prescriptionsRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getPrescriptionById?prescriptionId=' + prescriptionId,
            withCredentials: true
        }
        $http(prescriptionsRequest).then(function(prescriptionsSuccess) {
            deferred.resolve(prescriptionsSuccess);
        }, function(prescriptionsError) {
            deferred.reject(prescriptionsError);
        });
        return deferred.promise;
    }

    function loginErrorSwal() {
        swal({
            title: "Error",
            text: "Please enter login credentials!!!!",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function closeCase(caseId) {
        var deferred = $q.defer();
        var organizationCaseId = caseId;
        var closeRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/closeOrganizationCase',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: organizationCaseId
        }
        $http(closeRequest).then(function(closeCaseSuccess) {
            deferred.resolve(closeCaseSuccess);
        }, function(closeCaseError) {
            deferred.reject(closeCaseError);
        });
        return deferred.promise;
    }

    function getDrugList(drugEntity) {
        var localDrugObject = {};
        localDrugObject.brandName = drugEntity.brandName;
        if (drugEntity.perServing == 1) {
            localDrugObject.perServing = 1 + ' unit';
        } else {
            localDrugObject.perServing = drugEntity.perServing + ' units';
        }
        localDrugObject.usageDirection = drugEntity.usageDirection;
        localDrugObject.remarks = drugEntity.remarks;
        if (drugEntity.daysOrQuantity == 'Days') {
            if (drugEntity.noOfDays == 1) {
                localDrugObject.noOfDays = 1 + ' Day';
            } else {
                localDrugObject.noOfDays = drugEntity.noOfDays + ' Days';
            }
        }
        if (drugEntity.daysOrQuantity == 'Quantity') {
            localDrugObject.noOfDays = drugEntity.quantity + ' Quantity';
        }
        return localDrugObject;
    }

    function getLocalObject(fieldName, fieldValue) {
        var localObject = {};
        localObject.name = fieldName;
        localObject.value = fieldValue;
        return localObject;
    }

    function getPrescriptionsOfCase(caseId) {
        var deferred = $q.defer();
        var caseRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getPrescriptionsByCase?organizationCaseId=' + caseId,
            withCredentials: true
        }
        $http(caseRequest).then(function(caseSuccess) {
            deferred.resolve(caseSuccess);
        }, function(caseError) {
            deferred.reject(caseError);
        });
        return deferred.promise;
    }

    function getOrgPatientDetails(patientId) {
        var deferred = $q.defer();
        var orgPatientRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getOrgPatientByPatientId?patientId=' + patientId,
            withCredentials: true
        }
        $http(orgPatientRequest).then(function(orgPatientSuccess) {
            deferred.resolve(orgPatientSuccess);
        }, function(orgPatientError) {
            deferred.reject(orgpatientError);
        });
        return deferred.promise;
    }

    function saveTemplateInstance(templateInstance) {
        var deferred = $q.defer();
        var templateRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/template/addTemplateInstances',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(templateInstance)
        }
        $http(templateRequest).then(function(templateSuccess) {
            deferred.resolve(templateSuccess);
        }, function(templateError) {
            deferred.reject(templateError);
        });
        return deferred.promise;
    }

    function registerPatient(registerPatientRequest) {
        var deferred = $q.defer();
        var registerPatientRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/updatePatient',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(registerPatientRequest)
        }
        $http(registerPatientRequest).then(function(registerPatientSuccess) {
            deferred.resolve(registerPatientSuccess);
        }, function(registerPatientError) {
            deferred.reject(registerPatientError);
        });
        return deferred.promise;
    }

    function getPatientCaseHistory(patientId) {
        var deferred = $q.defer();
        var caseHistoryRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getCaseHistory?patientId=' + patientId,
            withCredentials: true
        }
        $http(caseHistoryRequest).then(function(caseHistorySuccess) {
            deferred.resolve(caseHistorySuccess);
        }, function(caseHistoryError) {
            deferred.reject(caseHistoryError);
        });
        return deferred.promise;
    }

    function getDoctorTemplates(organizationId) {
        var deferred = $q.defer();
        var template = '';
        var visibility = true;
        var getTemplatesRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/template/getTemplates?organizationId=' + organizationId + '&name=' + template + '&showInvisible=' + visibility,
            withCredentials: true
        }
        $http(getTemplatesRequest).then(function(getTemplateSuccess) {
            deferred.resolve(getTemplateSuccess);
        }, function(getTemplatesError) {
            deferred.reject(getTemplatesError);
        });
        return deferred.promise;
    }

    function addPatientFromDrugController(addPatient) {
        var deferred = $q.defer();
        var addPatientRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/doctor/addMyPatients',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(addPatient)
        }
        $http(addPatientRequest).then(function(addPatientResponse) {
            deferred.resolve(addPatientResponse);
        }, function(addPatientError) {
            deferred.reject(addPatientError);
        });
        return deferred.promise;
    }

    function getTodayString() {
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;
        var today = day + "/" + month + "/" + year;
        return today;
    }

    function referDetailsErrorSwal() {
        swal({
            title: "Error",
            text: "Kindly enter the details",
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
            url: 'http://localhost:8080/dbotica-spring/doctor/login',
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
            url: 'http://localhost:8080/dbotica-spring/doctor/referDoctor',
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
            url: 'http://localhost:8080/dbotica-spring/doctor/logout',
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
            url: 'http://localhost:8080/dbotica-spring/doctor/getPatients?patientIds=' + phoneNumberForSearch,
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
            url: 'http://localhost:8080/dbotica-spring/doctor/addPatient',
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
            url: 'http://localhost:8080/dbotica-spring/diagnosis/getDiagnosisTest?diagnosisTest=' + test,
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
            url: 'http://localhost:8080/dbotica-spring/prescription/updatePrescription',
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

    function selectDateSwal() {
        swal({
            title: "Info",
            text: "Please Select Date for booking appointment!!!",
            type: "info",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function changePasswordFieldsSwal() {
        swal({
            title: "Error",
            text: "Please Enter all the fields",
            type: "error",
            confirmButtonText: "OK"
        });
    }

    function changeDoctorPassword(changePasswordRequest) {
        var deferred = $q.defer();
        var changePasswordRequestEntity = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/doctor/changePassword',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(changePasswordRequest)
        }
        $http(changePasswordRequestEntity).then(function(changePasswordSuccess) {
            deferred.resolve(changePasswordSuccess);
        }, function(changePasswordError) {
            deferred.reject(changePasswordError);
        });
        return deferred.promise;
    }

    function changePasswordSuccessSwal() {
        swal({
            title: "Success",
            text: "Password successfully changed!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function newOldPasswordsSameSwal() {
        swal({
            title: "Error",
            text: "New password and Re-enter Password has to be same!!!!",
            type: "error",
            confirmButtonText: "OK"
        });
    }

    function updateDetailsSuccessSwal() {
        swal({
            title: "Success",
            text: "Doctor Details Successfully Updated!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function updateDetails(changeDetails) {
        var deferred = $q.defer();
        var changeDetailsRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/doctor/updateProfile',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(changeDetails)
        }
        $http(changeDetailsRequest).then(function(changeDetailsSuccess) {
            deferred.resolve(changeDetailsSuccess);
        }, function(changeDetailsError) {
            deferred.reject(changeDetailsError);
        });
        return deferred.promise;
    }

    function getMyAssistants() {
        var deferred = $q.defer();
        var getAssistantsRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/doctor/getMyAssistants',
            withCredentials: true
        }
        $http(getAssistantsRequest).then(function(assistantsSuccess) {
            deferred.resolve(assistantsSuccess);
        }, function(assistantsError) {
            deferred.reject(assistantsError);
        });
        return deferred.promise;
    }

    function markAssistantStatus(markAssistantObject) {
        var deferred = $q.defer();
        var markAssistantRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/doctor/markAssistantStatus',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(markAssistantObject)
        }
        $http(markAssistantRequest).then(function(markAssistantSuccess) {
            deferred.resolve(markAssistantSuccess);
        }, function(markAssistantError) {
            deferred.reject(markAssistantError);
        });
        return deferred.promise;
    }

    function getCreditsHistoryOfDoctor(doctorId) {
        var deferred = $q.defer();
        var getCreditsRequestData = {};
        var start = 0;
        var limit = 20;
        var getCreditsRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/doctor/getCreditHistory?start=' + start + '&limit=' + limit + '&doctorId=' + doctorId,
            withCredentials: true
        }
        $http(getCreditsRequest).then(function(getCreditsSuccess) {
            deferred.resolve(getCreditsSuccess);
        }, function(getCreditsError) {
            deferred.reject(getCreditsError);
        });
        return deferred.promise;
    }

    function getClinicsAddress() {
        var deferred = $q.defer();
        var getAddressesRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/doctor/getAddress',
            withCredentials: true
        }
        $http(getAddressesRequest).then(function(getAddressesSuccess) {
            deferred.resolve(getAddressesSuccess);
        }, function(getAddressesError) {
            deferred.reject(getAddressesError);
        });
        return deferred.promise;
    }

    function enterAddressSwal() {
        swal({
            title: "Error",
            text: "Please Enter Address Details",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function updateAddressSuccessSwal() {
        swal({
            title: "Success",
            text: "Address Details has been updated successfully",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function updateClinicAddress(updateAddress) {
        var deferred = $q.defer();
        var updateAddressRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/doctor/updateAddress',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(updateAddress)
        }
        $http(updateAddressRequest).then(function(updateAddressSuccess) {
            deferred.resolve(updateAddressSuccess);
        }, function(updateAddressError) {
            deferred.reject(updateAddressError);
        });
        return deferred.promise;
    }

    function getLongValueOfDate(dateSelected) {
        var dateArray = dateSelected.split('-');
        longDate = dateArray[1] + '-' + dateArray[0] + '-' + dateArray[2];
        longDate = new Date(longDate);
        $log.log('long date in servicw is---', longDate);
        longDate = longDate.getTime();
        $log.log('in second print service is---', longDate);
        return longDate;
    }

    function getAllMyPatients() {
        var deferred = $q.defer();
        var getAllPatientsRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/doctor/getMyPatients',
            withCredentials: true
        }
        $http(getAllPatientsRequest).then(function(getAllPatientsSuccess) {
            deferred.resolve(getAllPatientsSuccess);
        }, function(getAllPatientsError) {
            deferred.reject(getAllPatientsError);
        });
        return deferred.promise;
    }

    function referDoctorToDbotica(doctor) {
        var deferred = $q.defer();
        var referRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/doctor/referDoctor',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(doctor)
        }
        $http(referRequest).then(function(referSuccess) {
            deferred.resolve(referSuccess);
        }, function(referError) {
            deferred.reject(referError);
        });
        return deferred.promise;
    }

    function referDoctorSuccessSwal() {
        swal({
            title: "success",
            text: "Details are successfully saved. Thank you for referring to dBotica",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function getDoctorEvents(doctorId) {
        var deferred = $q.defer();
        var doctorEventsRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/doctor/getDoctorEvents?doctorId=' + doctorId,
            withCredentials: true
        }
        $http(doctorEventsRequest).then(function(doctorEventsSuccess) {
            deferred.resolve(doctorEventsSuccess);
        }, function(doctorEventsError) {
            deferred.reject(doctorEventsError);
        });
        return deferred.promise;
    }

    function drugTemplate(drugEntity) {
        var deferred = $q.defer();
        var drugRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/doctor/drugTemplate',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(drugEntity)
        }
        $http(drugRequest).then(function(drugTemplateSuccess) {
            deferred.resolve(drugTemplateSuccess);
        }, function(drugTemplateError) {
            deferred.reject(drugTemplateError);
        });
        return deferred.promise;
    }

    function getDrugTemplates() {
        var deferred = $q.defer();
        var getTemplateRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/doctor/getDrugTemplates',
            withCredentials: true
        }
        $http(getTemplateRequest).then(function(getTemplateSuccess) {
            deferred.resolve(getTemplateSuccess);
        }, function(getTemplateError) {
            deferred.reject(getTemplateError);
        });
        return deferred.promise;
    }

    function noPatientBeforeDrugTemplateSwal() {
        swal({
            title: "Info",
            text: "Please Select Patient before adding Drugs!!!",
            type: "info",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function bookAppointmentForPatient(patientEntity) {
        var deferred = $q.defer();
        var bookAppointmentRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/doctor/addCalendarEvent',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(patientEntity)
        }
        $http(bookAppointmentRequest).then(function(bookAppointmentSuccess) {
            deferred.resolve(bookAppointmentSuccess);
        }, function(bookAppointmentError) {
            deferred.reject(bookAppointmentError);
        });
        return deferred.promise;
    }

    function appointmentSuccessSwal() {
        swal({
            title: "success",
            text: "Appointment successfully Booked",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function appointmentBookFail() {
        swal({
            title: "Error",
            text: "Error updating the appointment details",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function prescriptionsOfPatient(idOfPatient) {
        var deferred = $q.defer();
        var prescriptionsRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/doctor/patientPrescriptions?patientId=' + idOfPatient + '&start=' + 0 + '&limit=' + 5,
            withCredentials: true
        }
        $http(prescriptionsRequest).then(function(prescriptionsSuccess) {
            deferred.resolve(prescriptionsSuccess);
        }, function(prescriptionsError) {
            deferred.reject(prescriptionsError);
        });
        return deferred.promise;
    }

};
