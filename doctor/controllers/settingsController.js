angular.module('doctor').controller('settingsController', settingsController);
settingsController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function settingsController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'settings');
    var settings = this;
    var classDefault = 'default';
    var classSuccess = 'success';
    var underscore = '_';
    var hyphen = '-';
    var space = ' ';
    var comma = ',';
    var timingsArray = [];
    var totalDrugs = [];
    var drugObjectsShown = [];
    settings.addDrugInModal = {};
    var activeDoctor = {};
    settings.templatesList = [];
    var entitiesArray = [];
    var displayArray = [];
    var selectedDrug;
    var selectedDrugId;
    var selectedDrugType;
    var drugIndexInTemplatesList;
    var drugIndexInEntitiesArray;
    settings.addDrugInModal.daysOrQuantity = 'Days';
    settings.itemsPerPage = 1;
    settings.maxSize = 8;
    settings.currentPage = 1;
    var drugEdit = {};
    var capsuleTypes = ['TABLET', 'CAPSULE', 'INJECTION', 'SACHET', 'LOZENGES', 'SUPPOSITORY', 'RESPULES', 'PEN', 'APLICAPS', 'ENEMA', 'PATCH'];

    settings.addSuccess = addSuccess;
    settings.addDrugToTemplate = addDrugToTemplate;
    settings.saveTheDrugTemplate = saveTheDrugTemplate;
    settings.pageChanged = pageChanged;
    settings.editDrugTemplate = editDrugTemplate;
    settings.deleteDrugTemplate = deleteDrugTemplate;

    resetAllButtons();

    try {
        openDb();
    } catch (e) {}

    activeDoctor = localStorage.getItem('currentDoctor');
    activeDoctor = angular.fromJson(activeDoctor);

    if (_.isEmpty(activeDoctor)) {
        localStorage.clear();
        localStorage.setItem("isLoggedInDoctor", "false");
        $state.go('login');
    }

    var getDrugTemplatesPromise = doctorServices.getDrugTemplates();
    getDrugTemplatesPromise.then(function(getTemplatesSuccess) {
        var errorCode = getTemplatesSuccess.data.errorCode;
        if (errorCode) {
            doctorServices.logoutFromThePage(errorCode);
        } else {
            var getTemplateResponse = angular.fromJson(getTemplatesSuccess.data.response);
            if (errorCode == null && getTemplatesSuccess.data.success) {
                entitiesArray = _.filter(getTemplateResponse, function(entity) {
                    return entity.state == 'ACTIVE';
                });
                settings.totalItems = entitiesArray.length;
                displayArray = _.chunk(entitiesArray, settings.itemsPerPage);
                angular.copy(displayArray[0], settings.templatesList);
            }
        }
    }, function(getTemplatesError) {
        doctorServices.noConnectivityError();
    });

    function addSuccess(timing) {
        if (settings[timing] == classDefault) {
            settings[timing] = classSuccess;
            timing = _.replace(timing, underscore, space);
            timingsArray.push(timing);
        } else {
            settings[timing] = classDefault;
            timing = _.replace(timing, underscore, space);
            var timingIndex = _.findLastIndex(timingsArray, function(entity) {
                return entity == timing;
            });
            timingsArray.splice(timingIndex, 1);
        }
    }

    function addDrugToTemplate() {
        drugEdit = {};
        settings.addDrugInModal = {};
        settings.addDrugInModal.daysOrQuantity = 'Days';
        resetAllButtons();
        timingsArray = [];
        angular.element('#addDrugModal').modal('show');
    }

    angular.element('#exampleInputDrugName').autocomplete({
        source: function(request, callback) {
            var searchParam = request.term;
            prescriptionFormDrugCallback(searchParam, callback)
        },
        minLength: 2,
        open: function() {
            angular.element('ul.ui-menu').width($(this).innerWidth());
        },
        focus: function(event, ui) {
            event.preventDefault();
        },
        select: function(event, ui) {
            ui.item.value = ui.item.value.split('-')[0];
            angular.forEach(drugObjectsShown, function(entity) {
                if (entity.brandName == ui.item.value) {
                    selectedDrug = ui.item.value;
                    settings.addDrugInModal.brandName = ui.item.value;
                    selectedDrugId = entity.id;
                    selectedDrugType = entity.drugType;
                }
            });

        }
    });

    var prescriptionFormDrugCallback = function(brandName, callback) {
        autocompleteDrugIndexedDB(brandName, '#exampleInputDrugName', OnGetDrugsResponse, callback);
    }

    var OnGetDrugsResponse = function(data, callback) {
        var totalDrugObjects = [];
        if (data.length !== 0) {
            angular.copy(data, totalDrugs);
            angular.copy(data, drugObjectsShown);
            angular.forEach(data, function(entity) {
                var brandNameString = entity.brandName;
                if (entity.constituents) {
                    brandNameString += hyphen;
                    angular.forEach(entity.constituents, function(entity) {
                        brandNameString += entity.molecule + ':' + entity.weight + ',';
                    });
                    brandNameString = brandNameString.slice(0, -1);
                }
                totalDrugObjects.push(brandNameString);
            });
        }
        callback(totalDrugObjects);
    }

    function saveTheDrugTemplate() {
        var drugRequestEntity = {};
        if (!_.isEmpty(drugEdit)) {
            drugRequestEntity.id = drugEdit.id;
        }
        drugRequestEntity.doctorId = activeDoctor.id;
        drugRequestEntity.drugDosage = {};
        drugRequestEntity.drugDosage.drugId = selectedDrugId;
        drugRequestEntity.drugDosage.drugType = selectedDrugType;
        drugRequestEntity.drugDosage.brandName = settings.addDrugInModal.brandName;
        drugRequestEntity.drugDosage.remarks = settings.addDrugInModal.remarks;
        drugRequestEntity.drugDosage.daysOrQuantity = settings.addDrugInModal.daysOrQuantity;
        drugRequestEntity.drugDosage.usageDirection = _.join(timingsArray, comma);
        var drugTypeFlag = _.findLastIndex(capsuleTypes, function(entity) {
            return entity == selectedDrugType;
        });
        var perServing = settings.addDrugInModal.perServing;
        var units = settings.addDrugInModal.daysOrQuantityCount;
        if (units !== undefined && units !== '') {
            drugRequestEntity.drugDosage.noOfDays = units;
            drugRequestEntity.drugDosage.units = units;
        } else {
            units = 1;
            drugRequestEntity.drugDosage.units = units;
            drugRequestEntity.drugDosage.noOfDays = units;
        }
        var quantCount = timingsArray.length;
        if (quantCount == 0) {
            quantCount = 1;
        }
        if (perServing == undefined || perServing == '') {
            perServing = parseInt(1);
            drugRequestEntity.drugDosage.perServing = settings.addDrugInModal.perServing;
        } else {
            drugRequestEntity.drugDosage.perServing = settings.addDrugInModal.perServing;
        }
        if (drugTypeFlag !== -1) {
            if (settings.addDrugInModal.daysOrQuantity == 'Days') {
                drugRequestEntity.drugDosage.quantity = parseInt(units) * quantCount * parseInt(perServing);
            } else {
                drugRequestEntity.drugDosage.quantity = units;
                drugRequestEntity.drugDosage.noOfDays = quantCount != 0 ? Math.ceil(parseInt(units) / (parseInt(perServing) * quantCount)) : 1;
            }
        } else {
            if (settings.addDrugInModal.daysOrQuantity == 'Days') {
                drugRequestEntity.drugDosage.noOfDays = units;
                drugRequestEntity.drugDosage.quantity = 1;
            } else {
                drugRequestEntity.drugDosage.quantity = units;
                drugRequestEntity.drugDosage.noOfDays = 1;
            }
        }
        var drugTemplatePromise = doctorServices.drugTemplate(drugRequestEntity);
        drugTemplatePromise.then(function(drugTemplateSuccess) {
            var errorCode = drugTemplateSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                var drugTemplateResponse = angular.fromJson(drugTemplateSuccess.data.response);
                if (errorCode == null && drugTemplateSuccess.data.success) {
                    if (_.isEmpty(drugEdit)) {
                        if (settings.templatesList.length == settings.itemsPerPage) {
                            settings.templatesList.pop();
                        }
                        settings.templatesList.unshift(drugTemplateResponse);
                        entitiesArray.unshift(drugTemplateResponse);
                        settings.totalItems = entitiesArray.length;
                    } else {
                        settings.templatesList.splice(drugIndexInTemplatesList, 1, drugTemplateResponse);
                        entitiesArray.splice(drugIndexInEntitiesArray, 1, drugTemplateResponse);
                    }
                    angular.element('#addDrugModal').modal('hide');
                    settings.addDrugInModal = {};
                    resetAllButtons();
                    drugEdit = {};
                    selectedDrugId = '';
                    selectedDrugType = '';
                    settings.addDrugInModal.daysOrQuantity = 'Days';
                }
            }


        }, function(drugTemplateError) {
            doctorServices.noConnectivityError();
        });
    }

    function pageChanged() {
        var requiredIndex = settings.currentPage - 1;
        var displayArray = [];
        displayArray = _.chunk(entitiesArray, settings.itemsPerPage);
        angular.copy(displayArray[requiredIndex], settings.templatesList);
    }

    function deleteDrugTemplate(deleteDrug, index) {
        var deleteReq = {};
        angular.copy(deleteDrug, deleteReq);
        deleteReq.state = 'INACTIVE';
        var deleteRequestPromise = doctorServices.drugTemplate(deleteReq);
        deleteRequestPromise.then(function(deleteSuccess) {
            var errorCode = deleteSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                var deleteResponse = angular.fromJson(deleteSuccess.data.response);
                if (errorCode == null && deleteSuccess.data.success) {
                    settings.templatesList.splice(index, 1);
                }
                var deleteIndex = _.findLastIndex(entitiesArray, function(entity) {
                    return entity.id == deleteDrug.id;
                });
                entitiesArray.splice(deleteIndex, 1);
                settings.totalItems = entitiesArray.length;
                displayArray = _.chunk(entitiesArray, settings.itemsPerPage);
                var reqIndex = settings.currentPage - 1;
                angular.copy(displayArray[reqIndex], settings.templatesList);
            }
        }, function(deleteError) {
            doctorServices.noConnectivityError();
        });
    }

    function editDrugTemplate(editDrug, index) {
        angular.element('#addDrugModal').modal('show');
        angular.copy(editDrug, drugEdit);
        angular.copy(index, drugIndexInTemplatesList);
        drugIndexInEntitiesArray = _.findLastIndex(entitiesArray, function(entity) {
            return entity.id == editDrug.id;
        });
        selectedDrugId = editDrug.id;
        selectedDrugType = editDrug.drugDosage.drugType;
        settings.addDrugInModal.brandName = editDrug.drugDosage.brandName;
        settings.addDrugInModal.perServing = editDrug.drugDosage.perServing;
        settings.addDrugInModal.remarks = editDrug.drugDosage.remarks;
        settings.addDrugInModal.daysOrQuantity = editDrug.drugDosage.daysOrQuantity;
        settings.addDrugInModal.daysOrQuantityCount = editDrug.drugDosage.units;
        timingsArray = [];
        timingsArray = editDrug.drugDosage.usageDirection.split(',');
        resetAllButtons();
        angular.forEach(timingsArray, function(entity) {
            entity = _.replace(entity, space, underscore);
            settings[entity] = classSuccess;
        });

    }

    function resetAllButtons() {
        settings.Before_BreakFast = classDefault;
        settings.After_BreakFast = classDefault;
        settings.Before_Lunch = classDefault;
        settings.After_Lunch = classDefault;
        settings.Before_Dinner = classDefault;
        settings.After_Dinner = classDefault;
    }
};
