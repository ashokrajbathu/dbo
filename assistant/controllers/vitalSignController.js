angular.module('personalAssistant').controller('vitalSignController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', '$timeout', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, $timeout, doctorServices, SweetAlert) {
    angular.element("#inputVitalDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });

    var vitalSign = this;

    vitalSign.timeChangeInTxtBox = timeChangeInTxtBox;
    vitalSign.addVitalSignInModal = addVitalSignInModal;
    vitalSign.getData = getData;
    vitalSign.removeEvent = removeEvent;

    vitalSign.newSign = {};

    vitalSign.mytime = new Date();
    vitalSign.myOutputTime = new Date();

    vitalSign.dateToolTip = false;

    vitalSign.hstep = 1;
    vitalSign.mstep = 1;
    vitalSign.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };
    vitalSign.ismeridian = true;

    $scope.popupCloseDelay = 2000;

    vitalSign.patientEventsList = [];
    var vitalSignListForSetter = [];

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

    var organizationId = localStorage.getItem('orgId');

    function getData() {
        vitalSign.patient = dboticaServices.getPatientDetailsFromService();
        vitalSign.patientEventsList = [];
        vitalSign.patientEventsList = dboticaServices.getVitalSignEvents();
        $log.log('vital sign events are-----', vitalSign.patientEventsList);
        if (vitalSign.patientEventsList !== vitalSignListForSetter) {
            angular.copy(vitalSign.patientEventsList, vitalSignListForSetter);
        }
        return true;
    }

    var date = new Date();
    var dateSorted = moment(date).format("DD/MM/YYYY,hh:mm A");
    var timeArray = dateSorted.split(",");
    vitalSign.newSign.date = timeArray[0];
    vitalSign.newSign.time = timeArray[1];

    function timeChangeInTxtBox() {
        $scope.$watch('vitalSign.mytime', function() {
            vitalSign.newSign.time = moment(vitalSign.mytime).format("hh:mm A");
        });
    }

    function addVitalSignInModal() {
        if (!jQuery.isEmptyObject(vitalSign.patient)) {
            var addVitalSignRequestEntity = {};
            var dateInModal = vitalSign.newSign.date;
            var timeInModal = vitalSign.newSign.time;
            if (dateInModal !== undefined && dateInModal !== null && dateInModal !== '') {
                addVitalSignRequestEntity.organizationId = organizationId;
                addVitalSignRequestEntity.patientId = vitalSign.patient.id;
                addVitalSignRequestEntity.patientName = vitalSign.patient.firstName;
                addVitalSignRequestEntity.patientPhoneNumber = vitalSign.patient.phoneNumber;
                addVitalSignRequestEntity.patientEventType = 'PATIENT_DETAILS';
                var currentDate = new Date();
                addVitalSignRequestEntity.startTime = currentDate.getTime();
                addVitalSignRequestEntity.alertTime = '';
                addVitalSignRequestEntity.referenceId = '';
                var newVitalSignDetails = {};
                newVitalSignDetails.type = 'VITAL_SIGN';
                newVitalSignDetails.date = dateInModal;
                newVitalSignDetails.time = timeInModal;
                newVitalSignDetails.pulseRate = vitalSign.newSign.pulse + '/min';
                newVitalSignDetails.bp = vitalSign.newSign.bp + 'mm of Hg';
                newVitalSignDetails.temperature = vitalSign.newSign.temperature + 'C';
                newVitalSignDetails.respiration = vitalSign.newSign.respiration + '/min';
                newVitalSignDetails.height = vitalSign.newSign.height + 'Cm';
                newVitalSignDetails.weight = vitalSign.newSign.weight + 'Kg';
                newVitalSignDetails = JSON.stringify(newVitalSignDetails);
                addVitalSignRequestEntity.referenceDetails = newVitalSignDetails;
                $log.log('vital sign request is---', addVitalSignRequestEntity);
                var vitalSignPromise = dboticaServices.patientEvent(addVitalSignRequestEntity);
                vitalSignPromise.then(function(vitalSignSuccess) {
                    var errorCode = vitalSignSuccess.data.errorCode;
                    if (!!errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        var vitalSignResponse = angular.fromJson(vitalSignSuccess.data.response);
                        vitalSignResponse.referenceDetails = angular.fromJson(vitalSignResponse.referenceDetails);
                        $log.log('vital sign response---', vitalSignResponse);
                        if (errorCode == null && vitalSignSuccess.data.success == true) {
                            vitalSign.patientEventsList.unshift(vitalSignResponse);
                            dboticaServices.setVitalSignEvents(vitalSign.patientEventsList);
                            dboticaServices.addVitalSignSuccessSwal();
                            angular.element("#addVitalModal").modal('hide');
                        }
                    }
                }, function(vitalSignError) {
                    dboticaServices.noConnectivityError();
                });
            } else {
                vitalSign.dateToolTip = true;
                $timeout(function() {
                    vitalSign.dateToolTip = false;
                }, 400);
            }
        } else {
            angular.element("#addVitalModal").modal('hide');
            dboticaServices.pleaseSelectPatientSwal();
        }
    }

    function removeEvent(eventEntity, index) {
        var removeRequestEntity = {};
        angular.copy(eventEntity, removeRequestEntity);
        removeRequestEntity.referenceDetails = JSON.stringify(removeRequestEntity.referenceDetails);
        removeRequestEntity.state = 'INACTIVE';
        var removeEventPromise = dboticaServices.patientEvent(removeRequestEntity);
        removeEventPromise.then(function(removeEventSuccess) {
            var errorCode = removeEventSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                if (errorCode == null && removeEventSuccess.data.success == true) {
                    var searchedIndex = dboticaServices.requiredIndexFromArray(vitalSignListForSetter, eventEntity.id);
                    vitalSignListForSetter.splice(searchedIndex, 1);
                    dboticaServices.setVitalSignEvents(vitalSignListForSetter);
                    vitalSign.patientEventsList.splice(index, 1);
                    dboticaServices.vitalSignDeleteSuccessSwal();
                }
            }
        }, function(removeEventError) {
            dboticaServices.noConnectivityError();
        });
    }
}]);
