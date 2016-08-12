angular.module('personalAssistant').controller('medicationController', medicationController);
medicationController.$inject = ['$rootScope', '$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', '$timeout', 'SweetAlert', 'doctorServices'];

function medicationController($rootScope, $scope, $log, dboticaServices, $state, $http, $parse, $timeout, doctorServices, SweetAlert) {
    var medication = this;

    medication.getData = getData;
    medication.saveMedicationDetails = saveMedicationDetails;
    medication.drugTypeNameSelection = drugTypeNameSelection;
    medication.removeParticularEvent = removeParticularEvent;
    medication.medicineSearch = medicineSearch;
    medication.selectTestFromTheDropdown = selectTestFromTheDropdown;

    medication.patient = {};
    var medicinesListOnLoad = [];
    medication.medicineNamesList = [];
    medication.newMedicine = {};
    medication.patientEventsList = [];
    var medicinesListForSetter = [];

    medication.categoryNameToolTip = false;
    medication.dropdownActive = false;
    medication.newMedicine.drugName = '';
    medication.newMedicine.days = '';
    medication.newMedicine.quantity = '';
    medication.newMedicine.instructions = '';
    medication.newMedicine.advice = '';
    medication.newMedicine.drugType = '-Category Name-';
    var drugTypeNameSelected = '-Category Name-';

    var organizationId = localStorage.getItem('orgId');
    var loggedInAss = localStorage.getItem('assistantCurrentlyLoggedIn');
    loggedInAss = angular.fromJson(loggedInAss);
    medication.assistantName = loggedInAss.firstName;
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

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);

    var getDoctorsCategoriesPromise = dboticaServices.getDoctorCategories(organizationId);
    getDoctorsCategoriesPromise.then(function(doctorsCategoriesPromise) {
        angular.element('#nurseHeader').addClass('activeAdminLi');
        var errorCode = doctorsCategoriesPromise.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {}
    }, function(docotorCategoriesError) {
        dboticaServices.noConnectivityError();
    });

    var medicinesPromise = dboticaServices.getItemsOfTheTable(0, 100, 'All', 'Drug', organizationId);
    medicinesPromise.then(function(getMedicinesSuccess) {
        var errorCode = getMedicinesSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var medicinesResponse = angular.fromJson(getMedicinesSuccess.data.response);
            if (medicinesResponse.inventoryItems.length > 0) {
                angular.forEach(medicinesResponse.inventoryItems, function(medicineEntity) {
                    if (medicineEntity.availableStock > parseInt(0)) {
                        medicinesListOnLoad.push(medicineEntity);
                    }
                });
            }
        }
    }, function(getMedicinesError) {
        dboticaServices.noConnectivityError();
    });

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
            /* medicineDetails.drugType = medication.newMedicine.drugType;*/
            medicineDetails.medicineName = medication.newMedicine.drugName;
            medicineDetails.days = medication.newMedicine.days;
            medicineDetails.quantity = medication.newMedicine.quantity;
            medicineDetails.instructions = medication.newMedicine.instructions;
            medicineDetails.advice = medication.newMedicine.advice;
            medicineDetails = JSON.stringify(medicineDetails);
            medicationRequestEntity.referenceDetails = medicineDetails;
            var saveMedicinesPromise = dboticaServices.patientEvent(medicationRequestEntity);
            saveMedicinesPromise.then(function(saveMedicineSuccess) {
                var errorCode = saveMedicineSuccess.data.errorCode;
                if (errorCode) {
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
            if (errorCode) {
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

    function medicineSearch() {
        medication.medicineNamesList = [];
        if (medication.newMedicine.drugName.length >= parseInt(2)) {
            angular.forEach(medicinesListOnLoad, function(medicineEntity) {
                if (medicineEntity.itemName.toLowerCase().indexOf(medication.newMedicine.drugName.toLowerCase()) > -1) {
                    medication.medicineNamesList.push(medicineEntity);
                }
            });
            if (medication.medicineNamesList.length > 0) {
                $('#medicinesDropDown').css('display', 'block');
                medication.dropdownActive = true;
            }
        } else {
            medication.dropdownActive = false;
        }
    }

    $(document).on('click', function(e) {
        if ($(e.target).closest("#inputDrugInMedication").length === 0) {
            $("#medicinesDropDown").hide();
            medication.dropdownActive = false;
        }
    });

    angular.element(window).resize(function() {
        $('#medicinesDropDown').css('display', 'none');
    });

    function selectTestFromTheDropdown(medicine) {
        medication.newMedicine.drugName = medicine.itemName;
        medication.dropdownActive = false;
    }
};
