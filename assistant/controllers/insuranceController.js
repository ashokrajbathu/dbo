angular.module('personalAssistant').controller('insuranceController', insuranceController);
insuranceController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function insuranceController($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem('currentState', 'insurance');
    var insurance = this;

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);
    var registration = this;
    insurance.patientSearch = patientSearch;
    insurance.patientsList = [];
    var activePatient = {};
    insurance.patientCases = [];
    insurance.patientPhoneNumber = '';
    insurance.insuranceType = 'TYPE_1';
    insurance.insuranceName = 'NAME_1';
    insurance.patientPhoneNumber = '';
    insurance.primaryRelation = 'SELF';
    insurance.primaryPatientName = '';
    insurance.insuranceCompany = '';
    insurance.displaySelectedCaseNumber = '---Select Case Number---';
    insurance.insuranceReferenceNo = '';
    insurance.numberErrorMessage = false;
    insurance.disableSearchBtn = true;
    insurance.patientNumberValidation = patientNumberValidation;
    insurance.selectPatient = selectPatient;
    insurance.selectCaseNumber = selectCaseNumber;
    insurance.registerInsurance = registerInsurance;

    function patientSearch() {
        var patientSearchPromise = dboticaServices.getInPatientsWithPhoneNumber(insurance.patientPhoneNumber);
        $log.log('patient search response----', patientSearchPromise);
        patientSearchPromise.then(function(patientSuccess) {
            var errorCode = patientSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                patientSearchResponse = angular.fromJson(patientSuccess.data.response);
                $log.log('search----------', patientSearchResponse);
                if (errorCode == null && patientSuccess.data.success) {
                    angular.copy(patientSearchResponse, insurance.patientsList);
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
        var getCaseHistoryPromise = dboticaServices.getPatientCaseHistory(activePatient.patientDetail.id);
        $log.log('case promise is----', getCaseHistoryPromise);
        getCaseHistoryPromise.then(function(getCaseSuccess) {
            var errorCode = getCaseSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var getCaseResponse = angular.fromJson(getCaseSuccess.data.response);
                $log.log('case response is----', getCaseResponse);
                if (errorCode == null && getCaseSuccess.data.success) {
                    angular.copy(getCaseResponse, insurance.patientCases);
                }
            }
        }, function(getCaseError) {
            dboticaServices.noConnectivityError();
        });
    }

    function registerInsurance() {
        var check = insurance.insuranceReferenceNo !== '' && insurance.insuranceCompany !== '' && insurance.primaryPatientName !== '' && insurance.primaryRelation !== '' && insurance.patientPhoneNumber !== '';
        if (check) {
            var registerInsuranceRequest = {};
            registerInsuranceRequest.patientId = activePatient.patientDetail.id;
            registerInsuranceRequest.patientName = insurance.patientName;
            registerInsuranceRequest.organizationCaseId = activePatient.organizationCaseId;
            registerInsuranceRequest.organizationCaseNo = activePatient.organizationCaseNo;
            registerInsuranceRequest.insuranceType = insurance.insuranceType;
            registerInsuranceRequest.insuranceName = insurance.insuranceName;
            registerInsuranceRequest.insuranceReferenceNo = insurance.insuranceReferenceNo;
            registerInsuranceRequest.insuranceCompany = insurance.insuranceCompany;
            registerInsuranceRequest.primaryPatientName = insurance.primaryPatientName;
            registerInsuranceRequest.primaryRelation = insurance.primaryRelation;
            registerInsuranceRequest.patientPhoneNumber = insurance.patientPhoneNumber;
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
                        insurance.patientsList = [];
                        activePatient = {};
                        insurance.disableSearchBtn = true;
                        insurance.patientPhoneNumber = '';
                        insurance.insuranceType = 'TYPE_1';
                        insurance.insuranceName = 'NAME_1';
                        insurance.patientPhoneNumber = '';
                        insurance.primaryRelation = 'SELF';
                        insurance.primaryPatientName = '';
                        insurance.insuranceCompany = '';
                        insurance.insuranceReferenceNo = '';
                    }
                }
            }, function(insuranceError) {
                dboticaServices.noConnectivityError();
            });

        } else {
            dboticaServices.templateMandatoryFieldsSwal();
        }
    }

    function selectCaseNumber(caseEntity) {
        if (caseEntity.organizationCaseNo !== '---Select Case Number---') {
            insurance.displaySelectedCaseNumber = caseEntity.organizationCaseNo + '-' + dboticaServices.longDateToReadableDate(caseEntity.lastUpdated);
            getPrescriptionsOfCaseNumber(caseEntity);
        } else {
            insurance.displaySelectedCaseNumber = '---Select Case Number---';
        }
    }

    function getPrescriptionsOfCaseNumber(caseEntity) {
        var prescriptionsPromise = dboticaServices.getPrescriptionsOfCase(caseEntity.id);
        $log.log('presc promise is------', prescriptionsPromise);
        prescriptionsPromise.then(function(prescriptionSuccess) {
            var errorCode = prescriptionSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var prescriptionResponse = angular.fromJson(prescriptionSuccess.data.response);
                $log.log('presc response is------', prescriptionResponse);
            }
        }, function(prescriptionError) {
            dboticaServices.noConnectivityError();
        });
    }

    function patientNumberValidation() {
        var phoneNumber = insurance.patientPhoneNumber;
        if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
            if (phoneNumber.length < 10) {
                insurance.disableSearchBtn = true;
                if (phoneNumber.length == 0) {
                    insurance.numberErrorMessage = false;
                } else {
                    insurance.numberErrorMessage = true;
                }
            } else {
                if (phoneNumber.length == 10) {
                    insurance.disableSearchBtn = false;
                    insurance.numberErrorMessage = false;
                } else {
                    insurance.disableSearchBtn = true;
                    insurance.numberErrorMessage = true;
                }
            }
        } else {
            insurance.numberErrorMessage = false;
            insurance.disableSearchBtn = true;
        }
    }
}
