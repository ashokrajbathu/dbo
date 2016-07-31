angular.module('doctor').controller('settingsController', settingsController);
settingsController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function settingsController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'settings');
    var settings = this;
    var classDefault = 'default';
    settings.Before_BreakFast = classDefault;
    settings.After_BreakFast = classDefault;
    settings.Before_Lunch = classDefault;
    settings.After_Lunch = classDefault;
    settings.Before_Dinner = classDefault;
    settings.After_Dinner = classDefault;
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
    var selectedDrug;
    var selectedDrugId;
    var selectedDrugType;
    settings.addDrugInModal.daysOrQuantity = 'Days';
    var capsuleTypes = ['TABLET', 'CAPSULE', 'INJECTION', 'SACHET', 'LOZENGES', 'SUPPOSITORY', 'RESPULES', 'PEN', 'APLICAPS', 'ENEMA', 'PATCH'];

    settings.addSuccess = addSuccess;
    settings.addDrugToTemplate = addDrugToTemplate;
    settings.saveTheDrugTemplate = saveTheDrugTemplate;

    try {
        openDb();
    } catch (e) {
        console.log("Error in openDb");
    }

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
            $log.log('response is---', getTemplateResponse);
            if (errorCode == null && getTemplatesSuccess.data.success) {
                settings.templatesList = _.filter(getTemplateResponse, function(entity) {
                    return entity.state == 'ACTIVE';
                });
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
                    selectedDrugId = entity.id;
                    selectedDrugType = entity.drugType;
                    $log.log('selected drugType is----', selectedDrugType);
                    $log.log('selected drugId is----', selectedDrugId);
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
        $log.log('in saveTheDrugTemplate');
        var drugRequestEntity = {};
        drugRequestEntity.doctorId = activeDoctor.id;
        drugRequestEntity.drugDosage = {};
        drugRequestEntity.drugDosage.drugId = selectedDrugId;
        drugRequestEntity.drugDosage.drugType = selectedDrugType;
        drugRequestEntity.drugDosage.brandName = selectedDrug;
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
        $log.log('req entity is----', drugRequestEntity);
        var drugTemplatePromise = doctorServices.drugTemplate(drugRequestEntity);
        drugTemplatePromise.then(function(drugTemplateSuccess) {
            var errorCode = drugTemplateSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                var drugTemplateResponse = angular.fromJson(drugTemplateSuccess.data.response);
                $log.log('tem success is---', drugTemplateResponse);
            }
        }, function(drugTemplateError) {
            doctorServices.noConnectivityError();
        });
    }
};
