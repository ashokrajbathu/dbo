angular.module('personalAssistant').controller('patientDetailsController', patientDetailsController);
patientDetailsController.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function patientDetailsController($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var detail = this;
    var organizationId = localStorage.getItem('orgId');
    var templatesList = [];
    detail.activeTemplate = {};
    detail.patient = {};

    detail.submitPatientFullForm = submitPatientFullForm;
    detail.getData = getData;

    var assistantObject = localStorage.getItem('assistant');
    var organizationId = localStorage.getItem('orgId');
    assistantObject = angular.fromJson(assistantObject);

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

    function submitPatientFullForm() {
        var templateInstance = {};
        templateInstance.templateId = detail.activeTemplate.id;
        var localTemplateValues = {};
        angular.copy($scope.activeTemplateFields, localTemplateValues);
        templateInstance.templateValues = JSON.stringify(localTemplateValues);
        templateInstance.patientId = detail.patient.id;
        templateInstance.userId = assistantObject.id;
        templateInstance.userRole = 'ASSISTANT';
        templateInstance.organizationId = organizationId;
        templateInstance.overridePermissions = assistantObject.assistantPermissions;
        var addTemplateInstancePromise = dboticaServices.addTemplateInstance(templateInstance);
        addTemplateInstancePromise.then(function(addInstanceSuccess) {
            var errorCode = addInstanceSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var addTemplateResponse = angular.fromJson(addInstanceSuccess.data.response);
                if (errorCode == null && addInstanceSuccess.data.success) {
                    dboticaServices.templateInstanceSuccessSwal();
                }
            }
        }, function(addTemplateError) {
            dboticaServices.noConnectivityError();
        });

    }

    function getData() {
        detail.patient = dboticaServices.getPatientDetailsFromService();
        return true;
    }


};
