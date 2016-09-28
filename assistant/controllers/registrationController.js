angular.module('personalAssistant').controller('registrationController', registrationController);
registrationController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function registrationController($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    angular.element('#insuranceActive').addClass('activeAdminLi');

    /*var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);
    var registration = this;
    registration.patientSearch = patientSearch;
    registration.patientsList = [];
    var activePatient = {};
    registration.patientPhoneNumber = '';
    registration.insuranceType = 'TYPE_1';
    registration.insuranceName = 'NAME_1';
    registration.patientPhoneNumber = '';
    registration.primaryRelation = 'SELF';
    registration.primaryPatientName = '';
    registration.insuranceCompany = '';
    registration.insuranceReferenceNo = '';
    registration.numberErrorMessage = false;
    registration.disableSearchBtn = true;
    registration.patientNumberValidation = patientNumberValidation;
    registration.selectPatient = selectPatient;
    registration.registerInsurance = registerInsurance;

    function patientSearch() {
        var patientSearchPromise = dboticaServices.getInPatientsWithPhoneNumber(registration.patientPhoneNumber);
        $log.log('patient search response----', patientSearchPromise);
        patientSearchPromise.then(function(patientSuccess) {
            var errorCode = patientSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                patientSearchResponse = angular.fromJson(patientSuccess.data.response);
                $log.log('search----------', patientSearchResponse);
                if (errorCode == null && patientSuccess.data.success) {
                    angular.copy(patientSearchResponse, registration.patientsList);
                }
            }
        }, function(patientSearchError) {
            dboticaServices.noConnectivityError();
        });
    }

    function selectPatient(patientEntity) {
        angular.element('#registrationModal').modal('hide');
        $log.log('selected patient is-----', patientEntity);
        angular.copy(patientEntity, activePatient);
    }

    function registerInsurance() {
        var check = registration.insuranceReferenceNo !== '' && registration.insuranceCompany !== '' && registration.primaryPatientName !== '' && registration.primaryRelation !== '' && registration.patientPhoneNumber !== '';
        if (check) {
            var registerInsuranceRequest = {};
            registerInsuranceRequest.patientId = activePatient.patientDetail.id;
            registerInsuranceRequest.patientName = registration.patientName;
            registerInsuranceRequest.organizationCaseId = activePatient.organizationCaseId;
            registerInsuranceRequest.organizationCaseNo = activePatient.organizationCaseNo;
            registerInsuranceRequest.insuranceType = registration.insuranceType;
            registerInsuranceRequest.insuranceName = registration.insuranceName;
            registerInsuranceRequest.insuranceReferenceNo = registration.insuranceReferenceNo;
            registerInsuranceRequest.insuranceCompany = registration.insuranceCompany;
            registerInsuranceRequest.primaryPatientName = registration.primaryPatientName;
            registerInsuranceRequest.primaryRelation = registration.primaryRelation;
            registerInsuranceRequest.patientPhoneNumber = registration.patientPhoneNumber;
            registerInsuranceRequest.organizationPatientId = activePatient.id;
            $log.log('request is------', registerInsuranceRequest);
            var registerInsurancePromise = dboticaServices.registerPatientInsurance(registerInsuranceRequest);
            $log.log('insurance promise is-------', registerInsurancePromise);
            registerInsurancePromise.then(function(insuranceSuccess) {
                var errorCode = insuranceSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var insuranceResponse = angular.fromJson(insuranceSuccess.data.response);
                    $log.log('insurance response is-----', insuranceResponse);
                    if (errorCode == null && insuranceSuccess.data.success) {
                        dboticaServices.insuranceSuccessSwal();
                        registration.patientsList = [];
                        activePatient = {};
                        registration.disableSearchBtn = true;
                        registration.patientPhoneNumber = '';
                        registration.insuranceType = 'TYPE_1';
                        registration.insuranceName = 'NAME_1';
                        registration.patientPhoneNumber = '';
                        registration.primaryRelation = 'SELF';
                        registration.primaryPatientName = '';
                        registration.insuranceCompany = '';
                        registration.insuranceReferenceNo = '';
                    }
                }
            }, function(insuranceError) {
                dboticaServices.noConnectivityError();
            });

        } else {
            dboticaServices.templateMandatoryFieldsSwal();
        }
    }

    function patientNumberValidation() {
        var phoneNumber = registration.patientPhoneNumber;
        if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
            if (phoneNumber.length < 10) {
                registration.disableSearchBtn = true;
                if (phoneNumber.length == 0) {
                    registration.numberErrorMessage = false;
                } else {
                    registration.numberErrorMessage = true;
                }
            } else {
                if (phoneNumber.length == 10) {
                    registration.disableSearchBtn = false;
                    registration.numberErrorMessage = false;
                } else {
                    registration.disableSearchBtn = true;
                    registration.numberErrorMessage = true;
                }
            }
        } else {
            registration.numberErrorMessage = false;
            registration.disableSearchBtn = true;
        }
    }*/
}
