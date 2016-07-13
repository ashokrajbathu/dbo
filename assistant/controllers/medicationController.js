angular.module('personalAssistant').controller('medicationController', ['$rootScope', '$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', '$timeout', 'SweetAlert', 'doctorServices', function($rootScope, $scope, $log, dboticaServices, $state, $http, $parse, $timeout, doctorServices, SweetAlert) {
    var medication = this;

    medication.getData = getData;
    medication.saveMedicationDetails = saveMedicationDetails;
    medication.drugTypeNameSelection = drugTypeNameSelection;
    medication.removeParticularEvent = removeParticularEvent;

    medication.patient = {};
    medication.newMedicine = {};
    medication.patientEventsList = [];
    var medicinesListForSetter = [];

    medication.categoryNameToolTip = false;
    medication.newMedicine.drugName = '-Drug Name-';
    medication.newMedicine.days = '';
    medication.newMedicine.quantity = '';
    medication.newMedicine.instructions = '';
    medication.newMedicine.advice = '';
    medication.newMedicine.drugType = '-Category Name-';
    var drugTypeNameSelected = '-Category Name-';

    var organizationId = localStorage.getItem('orgId');
    var loggedInAss = localStorage.getItem('assistantCurrentlyLoggedIn');
    medication.categoryNamesArray = [
        { 'name': 'ANTI-ALLERGIC' },
        { 'name': 'ANTI-ANXIETY' },
        { 'name': 'ANTI-ARRHYTHMIA' },
        { 'name': 'ANTI-ASTHMATIC' },
        { 'name': 'ANTI-BACTERIAL' },
        { 'name': 'CATEGORY' },
        { 'name': 'ANTI-CHOLINERGICS' },
        { 'name': 'ANTI-CHOLINESTERASES' },
        { 'name': 'ANTI-HIV' },
        { 'name': 'ANTI-INFECTIVE' },
        { 'name': '-Category Name-' }
    ];



    function getData() {
        medication.patient = dboticaServices.getPatientDetailsFromService();
        medication.patientEventsList = [];
        medication.patientEventsList = dboticaServices.getPatientsEvents();
        if (medication.patientEventsList !== medicinesListForSetter) {
            angular.copy(medication.patientEventsList, medicinesListForSetter);
        }
        return true;
    }

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

    function saveMedicationDetails() {
        if (!jQuery.isEmptyObject(medication.patient)) {
            if (medication.newMedicine.drugType !== '-Category Name-') {
                var medicationRequestEntity = {};
                medicationRequestEntity.organizationId = organizationId;
                medicationRequestEntity.patientId = medication.patient.id;
                medicationRequestEntity.patientName = medication.patient.firstName;
                medicationRequestEntity.patientPhoneNumber = medication.patient.phoneNumber;
                medicationRequestEntity.patientEventType = 'MEDICINE_PROVIDED';
                var currentDate = new Date();
                medicationRequestEntity.startTime = currentDate.getTime();
                medicationRequestEntity.alertTime = '';
                medicationRequestEntity.referenceId = '';
                var medicineDetails = {};
                medicineDetails.drugType = medication.newMedicine.drugType;
                medicineDetails.days = medication.newMedicine.days;
                medicineDetails.quantity = medication.newMedicine.quantity;
                medicineDetails.instructions = medication.newMedicine.instructions;
                medicineDetails.advice = medication.newMedicine.advice;
                medicineDetails = JSON.stringify(medicineDetails);
                medicationRequestEntity.referenceDetails = medicineDetails;
                var saveMedicinesPromise = dboticaServices.patientEvent(medicationRequestEntity);
                saveMedicinesPromise.then(function(saveMedicineSuccess) {
                    var errorCode = saveMedicineSuccess.data.errorCode;
                    if (!!errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        var medicineResponse = angular.fromJson(saveMedicineSuccess.data.response);
                        medicineResponse.referenceDetails = angular.fromJson(medicineResponse.referenceDetails);
                        var referenceDetailsNew = angular.fromJson(medicineResponse);
                        medication.patientEventsList.unshift(referenceDetailsNew);
                        dboticaServices.setPatientEvents(medication.patientEventsList);
                        dboticaServices.saveMedicineSuccessSwal();
                        angular.element("#addMedicationModal").modal('hide');
                    }
                }, function(saveMedicineError) {
                    dboticaServices.noConnectivityError();
                });
            } else {
                medication.categoryNameToolTip = true;
                $timeout(function() {
                    medication.categoryNameToolTip = false;
                }, 100);
            }
        } else {
            angular.element("#addMedicationModal").modal('hide');
            dboticaServices.pleaseSelectPatientSwal();
        }
    }

    function drugTypeNameSelection(option) {
        medication.newMedicine.drugType = option.name;
    }

    function removeParticularEvent(eventEntity, index) {
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
                    var searchedIndex = dboticaServices.requiredIndexFromArray(medicinesListForSetter, eventEntity.id);
                    medicinesListForSetter.splice(searchedIndex, 1);
                    dboticaServices.setPatientEvents(medicinesListForSetter);
                    medication.patientEventsList.splice(index, 1);
                    dboticaServices.medicationDeleteSuccessSwal();
                }
            }
        }, function(removeEventError) {
            dboticaServices.noConnectivityError();
        });
    }


}]);
