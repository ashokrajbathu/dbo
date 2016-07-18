angular.module('personalAssistant').controller('dischargeSummaryController', dischargeSummaryController);
dischargeSummaryController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', '$timeout', 'SweetAlert', 'doctorServices'];

function dischargeSummaryController($scope, $log, dboticaServices, $state, $http, $parse, $timeout, doctorServices, SweetAlert) {
    var discharge = this;

    var organizationId = localStorage.getItem('orgId');

    discharge.request = {};

    discharge.request.reasons = '';
    discharge.request.admittingImpression = '';
    discharge.request.finalDiagnosis = '';
    discharge.request.clinicalFindings = '';
    discharge.request.courseInTheWard = '';

    discharge.saveDischargeSummary = saveDischargeSummary;
    discharge.getData = getData;
    $scope.popupCloseDelay = 2000;
    discharge.categoryToolTip = false;

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);


    $scope.placement = {
        options: [
            'top',
            'top-left',
            'top-right',
            'bottom',
            'bottom-left',
            'bottom-right',
            'left',
            'left-top',
            'left-bottom',
            'right',
            'right-top',
            'right-bottom'
        ],
        selected: 'top'
    };

    function getData() {
        discharge.patient = dboticaServices.getPatientDetailsFromService();
    }

    function saveDischargeSummary() {
        if (!jQuery.isEmptyObject(discharge.patient)) {
            var conditionOnDischarge = angular.element("#condition option:selected").text();
            if (conditionOnDischarge !== '-Condition Upon Discharge-') {
                var dischargePatientRequestEntity = {};
                dischargePatientRequestEntity.organizationId = organizationId;
                dischargePatientRequestEntity.patientId = discharge.patient.id;
                dischargePatientRequestEntity.patientName = discharge.patient.firstName;
                dischargePatientRequestEntity.patientPhoneNumber = discharge.patient.phoneNumber;
                dischargePatientRequestEntity.patientEventType = 'DISCHARGED';
                var currentDate = new Date();
                dischargePatientRequestEntity.startTime = currentDate.getTime();
                dischargePatientRequestEntity.alertTime = '';
                dischargePatientRequestEntity.referenceId = '';
                var dischargeSummaryDetails = {};
                dischargeSummaryDetails.reasons = discharge.request.reasons;
                dischargeSummaryDetails.admittingImpression = discharge.request.admittingImpression;
                dischargeSummaryDetails.finalDiagnosis = discharge.request.finalDiagnosis;
                dischargeSummaryDetails.clinicalFindings = discharge.request.clinicalFindings;
                dischargeSummaryDetails.courseInTheWard = discharge.request.courseInTheWard;
                dischargeSummaryDetails.conditionUponDischarge = angular.element("#condition").text();
                dischargeSummaryDetails = JSON.stringify(dischargeSummaryDetails);
                dischargePatientRequestEntity.referenceDetails = dischargeSummaryDetails;
                var dischargePatientPromise = dboticaServices.patientEvent(dischargePatientRequestEntity);
                dischargePatientPromise.then(function(dischargePatientSuccess) {
                    var errorCode = dischargePatientSuccess.data.errorCode;
                    if (!!errorCode) {
                        dboticaServices.logoutFromThePage();
                    } else {
                        var dischargePatientResponse = angular.fromJson(dischargePatientSuccess.data.response);
                        if (errorCode == null && dischargePatientSuccess.data.success == true) {
                            dboticaServices.dischargeSummarySuccessSwal();
                        }
                    }
                }, function(dischargePatientError) {
                    dboticaServices.noConnectivityError();
                });
            } else {
                discharge.categoryToolTip = true;
                $timeout(function() {
                    discharge.categoryToolTip = false;
                }, 400);
            }
        } else {
            dboticaServices.pleaseSelectPatientSwal();
        }
    }
};
