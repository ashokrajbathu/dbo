angular.module('personalAssistant').controller('intakeOutputController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', '$timeout', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, $timeout, doctorServices, SweetAlert) {
    angular.element("#inputModalDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });
    angular.element("#inputModalOutputDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });

    var intakeOutput = this;

    intakeOutput.getData = getData;
    intakeOutput.saveIntakeInModal = saveIntakeInModal;
    intakeOutput.timeChangeInTxtBox = timeChangeInTxtBox;
    intakeOutput.removeIntake = removeIntake;
    intakeOutput.saveOutputInModal = saveOutputInModal;
    intakeOutput.removeOutputEntity = removeOutputEntity;

    intakeOutput.mytime = new Date();
    intakeOutput.myOutputTime = new Date();

    var loggedInAss = localStorage.getItem('assistantCurrentlyLoggedIn');
    loggedInAss = angular.fromJson(loggedInAss);
    intakeOutput.assistantName = loggedInAss.firstName;

    intakeOutput.hstep = 1;
    intakeOutput.mstep = 1;
    intakeOutput.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };
    intakeOutput.ismeridian = true;

    $scope.popupCloseDelay = 2000;

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
    intakeOutput.intake = {};
    intakeOutput.intake.ivfluids = '';
    intakeOutput.intake.oral = '';
    intakeOutput.intake.particular = '';
    intakeOutput.intake.noOf = '';
    intakeOutput.intake.noOfUr = '';

    intakeOutput.output = {};
    intakeOutput.output.noOfUr = '';
    intakeOutput.output.feaces = '';
    intakeOutput.output.respitation = '';
    intakeOutput.output.skin = '';


    intakeOutput.patientEventsList = [];
    intakeOutput.outputPatientEventsList = [];
    var intakeEventsForSetter = [];
    var outputEventsForSetter = [];

    var date = new Date();
    var dateSorted = moment(date).format("DD/MM/YYYY,hh:mm A");
    var timeArray = dateSorted.split(",");
    intakeOutput.intake.date = timeArray[0];
    intakeOutput.output.date = timeArray[0];
    intakeOutput.intake.time = timeArray[1];
    intakeOutput.output.time = timeArray[1];

    var organizationId = localStorage.getItem('orgId');

    intakeOutput.dateToolTip = false;
    intakeOutput.particularToolTip = false;
    intakeOutput.ivFluidsToolTip = false;
    intakeOutput.oralToolTip = false;
    intakeOutput.dateToolTipOutput = false;
    intakeOutput.urToolTip = false;
    intakeOutput.feacesToolTip = false;
    intakeOutput.respToolTip = false;
    intakeOutput.skinToolTip = false;

    function timeChangeInTxtBox() {
        $scope.$watch('intakeOutput.mytime', function() {
            intakeOutput.intake.time = moment(intakeOutput.mytime).format("hh:mm A");
        });
    }

    function getData() {
        intakeOutput.patient = dboticaServices.getPatientDetailsFromService();
        intakeOutput.patientEventsList = [];
        intakeOutput.outputPatientEventsList = [];
        intakeOutput.patientEventsList = dboticaServices.getIntakeEvents();
        intakeOutput.outputPatientEventsList = dboticaServices.getOutputEvents();
        if (intakeOutput.patientEventsList !== intakeEventsForSetter) {
            angular.copy(intakeOutput.patientEventsList, intakeEventsForSetter);
        }
        if (intakeOutput.outputPatientEventsList !== outputEventsForSetter) {
            angular.copy(intakeOutput.outputPatientEventsList, outputEventsForSetter);
        }
        return true;
    }

    function saveIntakeInModal() {
        if (!jQuery.isEmptyObject(intakeOutput.patient)) {
            var intakeDate = intakeOutput.intake.date;
            var intakeParticular = intakeOutput.intake.particular;
            var intakeIvFluids = intakeOutput.intake.ivfluids;
            var intakeOral = intakeOutput.intake.oral;
            if (intakeDate !== undefined && intakeDate !== '' && intakeParticular !== undefined && intakeParticular !== '' && intakeIvFluids !== undefined && intakeIvFluids !== '' && intakeOral !== undefined && intakeOral !== '') {
                var outputrequestEntity = {};
                outputrequestEntity.organizationId = organizationId;
                outputrequestEntity.patientId = intakeOutput.patient.id;
                outputrequestEntity.patientName = intakeOutput.patient.firstName;
                outputrequestEntity.patientPhoneNumber = intakeOutput.patient.phoneNumber;
                outputrequestEntity.patientEventType = 'PATIENT_DETAILS';
                var currentDate = new Date();
                outputrequestEntity.startTime = currentDate.getTime();
                outputrequestEntity.alertTime = '';
                outputrequestEntity.referenceId = '';
                var newIntakeDetails = {};
                newIntakeDetails.type = 'INTAKE_RECORD';
                newIntakeDetails.date = intakeDate;
                newIntakeDetails.time = intakeOutput.intake.time;
                newIntakeDetails.particular = intakeOutput.intake.particular;
                newIntakeDetails.ivfluids = intakeOutput.intake.ivfluids;
                newIntakeDetails.oral = intakeOutput.intake.oral;
                newIntakeDetails.noOf = intakeOutput.intake.noOf;
                newIntakeDetails.noOfUr = intakeOutput.intake.noOfUr;
                newIntakeDetails = JSON.stringify(newIntakeDetails);
                outputrequestEntity.referenceDetails = newIntakeDetails;
                var intakePromise = dboticaServices.patientEvent(outputrequestEntity);
                intakePromise.then(function(intakeSuccess) {
                    var errorCode = intakeSuccess.data.errorCode;
                    if (!!errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        var intakeResponse = angular.fromJson(intakeSuccess.data.response);
                        if (errorCode == null && intakeSuccess.data.success == true) {
                            intakeResponse.referenceDetails = angular.fromJson(intakeResponse.referenceDetails);
                            intakeOutput.patientEventsList.unshift(intakeResponse);
                            dboticaServices.setIntakeEvents(intakeOutput.patientEventsList);
                            dboticaServices.intakeEventSuccessSwal();
                            angular.element('#addIntakeModal').modal('hide');
                        }
                    }
                }, function(intakeError) {
                    dboticaServices.noConnectivityError();
                });

            } else {
                if (intakeDate == undefined || intakeDate == '') {
                    intakeOutput.dateToolTip = true;
                    $timeout(function() {
                        intakeOutput.dateToolTip = false;
                    }, 400);
                }
                if (intakeParticular == undefined || intakeParticular == '') {
                    intakeOutput.particularToolTip = true;
                    $timeout(function() {
                        intakeOutput.particularToolTip = false;
                    }, 400);
                }
                if (intakeIvFluids == undefined || intakeIvFluids == '') {
                    intakeOutput.ivFluidsToolTip = true;
                    $timeout(function() {
                        intakeOutput.ivFluidsToolTip = false;
                    }, 400);
                }
                if (intakeOral == undefined || intakeOral == '') {
                    intakeOutput.oralToolTip = true;
                    $timeout(function() {
                        intakeOutput.oralToolTip = false;
                    }, 400);
                }

            }
        } else {
            angular.element("#addIntakeModal").modal('hide');
            dboticaServices.pleaseSelectPatientSwal();
        }
    }

    function removeIntake(intakeUnit, index) {
        var removeRequestEntity = {};
        angular.copy(intakeUnit, removeRequestEntity);
        removeRequestEntity.referenceDetails = JSON.stringify(removeRequestEntity.referenceDetails);
        removeRequestEntity.state = 'INACTIVE';
        var removeEventPromise = dboticaServices.patientEvent(removeRequestEntity);
        removeEventPromise.then(function(removeEventSuccess) {
            var errorCode = removeEventSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                if (errorCode == null && removeEventSuccess.data.success == true) {
                    var searchedIndex = dboticaServices.requiredIndexFromArray(intakeEventsForSetter, intakeUnit.id);
                    intakeEventsForSetter.splice(searchedIndex, 1);
                    dboticaServices.setIntakeEvents(intakeEventsForSetter);
                    intakeOutput.patientEventsList.splice(index, 1);
                    dboticaServices.intakeRecordDeleteSuccessSwal();
                }
            }
        }, function(removeEventError) {
            dboticaServices.noConnectivityError();
        });
    }

    function saveOutputInModal() {
        if (!jQuery.isEmptyObject(intakeOutput.patient)) {
            var outputDate = intakeOutput.output.date;
            var outputUr = intakeOutput.output.noOfUr;
            var outputFeaces = intakeOutput.output.feaces;
            var outputRespitation = intakeOutput.output.respitation;
            if (outputDate !== undefined && outputDate !== '' && outputUr !== undefined && outputUr !== '' && outputFeaces !== undefined && outputFeaces !== '' && outputRespitation !== undefined && outputRespitation !== '') {
                var outputrequestEntity = {};
                outputrequestEntity.organizationId = organizationId;
                outputrequestEntity.patientId = intakeOutput.patient.id;
                outputrequestEntity.patientName = intakeOutput.patient.firstName;
                outputrequestEntity.patientPhoneNumber = intakeOutput.patient.phoneNumber;
                outputrequestEntity.patientEventType = 'PATIENT_DETAILS';
                var currentDate = new Date();
                outputrequestEntity.startTime = currentDate.getTime();
                outputrequestEntity.alertTime = '';
                outputrequestEntity.referenceId = '';
                var newOutputDetails = {};
                newOutputDetails.type = 'OUTPUT_RECORD';
                newOutputDetails.date = outputDate;
                newOutputDetails.time = intakeOutput.output.time;
                newOutputDetails.noOfUr = intakeOutput.output.noOfUr;
                newOutputDetails.feaces = intakeOutput.output.feaces;
                newOutputDetails.respitation = intakeOutput.output.respitation;
                newOutputDetails.skin = intakeOutput.output.skin;
                newOutputDetails = JSON.stringify(newOutputDetails);
                outputrequestEntity.referenceDetails = newOutputDetails;
                var outputRecordPromise = dboticaServices.patientEvent(outputrequestEntity);
                outputRecordPromise.then(function(outputRecordSuccess) {
                    var errorCode = outputRecordSuccess.data.errorCode;
                    if (!!errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        outputSuccess = angular.fromJson(outputRecordSuccess.data.response);
                        if (errorCode == null && outputRecordSuccess.data.success == true) {
                            outputSuccess.referenceDetails = angular.fromJson(outputSuccess.referenceDetails);
                            intakeOutput.outputPatientEventsList.unshift(outputSuccess);
                            dboticaServices.setOutputEvents(intakeOutput.outputPatientEventsList);
                            dboticaServices.outputEventSuccessSwal();
                            angular.element('#outputModal').modal('hide');

                        }
                    }
                }, function(outputRecordError) {
                    dboticaServices.noConnectivityError();
                });
            } else {
                if (outputDate == undefined || outputDate == '') {
                    intakeOutput.dateToolTipOutput = true;
                    $timeout(function() {
                        intakeOutput.dateToolTipOutput = false;
                    }, 400);
                }
                if (outputUr == undefined || outputUr == '') {
                    intakeOutput.urToolTip = true;
                    $timeout(function() {
                        intakeOutput.urToolTip = false;
                    }, 400);
                }
                if (outputFeaces == undefined || outputFeaces == '') {
                    intakeOutput.feacesToolTip = true;
                    $timeout(function() {
                        intakeOutput.feacesToolTip = false;
                    }, 400);
                }
                if (outputRespitation == undefined || outputRespitation == '') {
                    intakeOutput.respToolTip = true;
                    $timeout(function() {
                        intakeOutput.respToolTip = false;
                    }, 400);
                }

            }
        } else {
            angular.element("#outputModal").modal('hide');
            dboticaServices.pleaseSelectPatientSwal();
        }
    }

    function removeOutputEntity(outputEntity, index) {
        var removeRequestEntity = {};
        angular.copy(outputEntity, removeRequestEntity);
        removeRequestEntity.referenceDetails = JSON.stringify(removeRequestEntity.referenceDetails);
        removeRequestEntity.state = 'INACTIVE';
        var removeEventPromise = dboticaServices.patientEvent(removeRequestEntity);
        removeEventPromise.then(function(removeEventSuccess) {
            var errorCode = removeEventSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                if (errorCode == null && removeEventSuccess.data.success == true) {
                    var searchedIndex = dboticaServices.requiredIndexFromArray(outputEventsForSetter, outputEntity.id);
                    outputEventsForSetter.splice(searchedIndex, 1);
                    dboticaServices.setOutputEvents(outputEventsForSetter);
                    intakeOutput.outputPatientEventsList.splice(index, 1);
                    dboticaServices.outputRecordDeleteSuccessSwal();
                }
            }
        }, function(removeEventError) {
            dboticaServices.noConnectivityError();
        });
    }

}]);
