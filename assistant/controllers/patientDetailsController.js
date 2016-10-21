angular.module('personalAssistant').controller('patientDetailsController', patientDetailsController);
patientDetailsController.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function patientDetailsController($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var detail = this;
    detail.activeTemplateInstances = [];
    var organizationId = localStorage.getItem('orgId');
    var templatesList = [];
    detail.activeTemplate = {};
    detail.patient = {};
    var onLoadTemplateFields = {};

    detail.submitPatientFullForm = submitPatientFullForm;
    detail.getData = getData;
    detail.viewPreviousForms = viewPreviousForms;

    var assistantObject = localStorage.getItem('assistant');
    var organizationId = localStorage.getItem('orgId');
    assistantObject = angular.fromJson(assistantObject);
    angular.copy($scope.activeTemplateFields, onLoadTemplateFields);

    var getTemplatesPromise = dboticaServices.getAllTemplates(organizationId, '', true);
    getTemplatesPromise.then(function(getTemplateSuccess) {
        var errorCode = getTemplateSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var getTemplatesResponse = angular.fromJson(getTemplateSuccess.data.response);
            if (errorCode == null && getTemplateSuccess.data.success) {
                templatesList = _.filter(getTemplatesResponse, function(entity) {
                    return entity.state == 'ACTIVE';
                });
                var activeTemplateIndex = _.findLastIndex(templatesList, function(templateEntity) {
                    return templateEntity.name == $scope.templateName;
                });
                detail.activeTemplate = templatesList[activeTemplateIndex];
            }
        }
    }, function(getTemplateError) {
        dboticaServices.noConnectivityError();
    });

    function viewPreviousForms() {
        var patientTemplateInstancesPromise = dboticaServices.getPatientTemplateInstances(detail.patient.organizationCaseId, detail.patient.organizationId);
        patientTemplateInstancesPromise.then(function(instanceSuccess) {
            var errorCode = instanceSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var instanceResponse = angular.fromJson(instanceSuccess.data.response);
                if (errorCode == null && instanceSuccess.data.success) {
                    if (!_.isEmpty(detail.patient)) {
                        instanceResponse = _.filter(instanceResponse, function(entity) {
                            return entity.state == 'ACTIVE';
                        });
                        var prescriptionEntities = [];
                        if (instanceResponse.length > 0) {
                            angular.forEach(instanceResponse, function(instanceEntity) {
                                var localFieldValues = angular.fromJson(instanceEntity.templateValues);
                                var lastUpdatedValue = instanceEntity.lastUpdated;
                                angular.forEach(localFieldValues, function(field) {
                                    angular.forEach(field, function(fieldEntity) {
                                        var localObject = {};
                                        if (fieldEntity.description !== '' && fieldEntity.fieldType !== 'CHECK_BOX') {
                                            localObject.sectionName = fieldEntity.sectionName;
                                            localObject.lastUpdated = lastUpdatedValue;
                                            localObject.fieldType = fieldEntity.fieldType;
                                            localObject.name = fieldEntity.name;
                                            localObject.value = fieldEntity.description;
                                            prescriptionEntities.push(localObject);
                                        }
                                        if (fieldEntity.fieldType == 'CHECK_BOX') {
                                            localObject.sectionName = fieldEntity.sectionName;
                                            localObject.lastUpdated = lastUpdatedValue;
                                            localObject.fieldType = fieldEntity.fieldType;
                                            localObject.name = fieldEntity.name;
                                            var arr = [];
                                            angular.forEach(fieldEntity.restrictValues, function(restrictEntity) {
                                                if (restrictEntity.checkBoxValue) {
                                                    arr.push(restrictEntity.name);
                                                }
                                            });
                                            localObject.value = arr.join(',');
                                            prescriptionEntities.push(localObject);
                                        }
                                    });
                                });
                            });
                            prescriptionEntities = _.groupBy(prescriptionEntities, 'sectionName');
                            angular.forEach(prescriptionEntities, function(prescEntry) {
                                var localSortedArray = [];
                                localSortedArray = _.groupBy(prescEntry, 'lastUpdated');
                                detail.activeTemplateInstances.push(localSortedArray);
                            });
                        }
                        angular.element("#previousFormsModal").modal('show');
                    } else {
                        dboticaServices.selectInPatientSwal();
                    }
                }
            }
        }, function(instanceError) {
            dboticaServices.noConnectivityError();
        });
    }

    function submitPatientFullForm() {
        var templateInstance = {};
        templateInstance.templateId = detail.activeTemplate.id;
        var localTemplateValues = {};
        $log.log('patient data is----', detail.patient);
        angular.copy($scope.activeTemplateFields, localTemplateValues);
        templateInstance.templateValues = JSON.stringify(localTemplateValues);
        templateInstance.patientId = detail.patient.id;
        templateInstance.userId = assistantObject.id;
        templateInstance.userRole = 'ASSISTANT';
        templateInstance.organizationCaseId = detail.patient.organizationCaseId;
        templateInstance.organizationCaseNo = detail.patient.organizationCaseNo;
        templateInstance.organizationId = organizationId;
        templateInstance.overridePermissions = assistantObject.assistantPermissions;
        if (!_.isEmpty(detail.patient)) {
            var addTemplateInstancePromise = dboticaServices.addTemplateInstance(templateInstance);
            addTemplateInstancePromise.then(function(addInstanceSuccess) {
                var errorCode = addInstanceSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var addTemplateResponse = angular.fromJson(addInstanceSuccess.data.response);
                    if (errorCode == null && addInstanceSuccess.data.success) {
                        dboticaServices.templateInstanceSuccessSwal();
                        //angular.copy(onLoadTemplateFields, $scope.activeTemplateFields);
                    }
                }
            }, function(addTemplateError) {
                dboticaServices.noConnectivityError();
            });
        } else {
            dboticaServices.selectInPatientSwal();
        }
    }

    function getData() {
        detail.patient = dboticaServices.getPatientDetailsFromService();
        return true;
    }


};
