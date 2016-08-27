angular.module('personalAssistant').controller('patientDetailsController', patientDetailsController);
patientDetailsController.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function patientDetailsController($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var detail = this;
    var organizationId = localStorage.getItem('orgId');
    var templatesList = [];
    detail.activeTemplate = {};

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


};
