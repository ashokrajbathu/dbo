angular.module('personalAssistant').controller('addTemplateController', addTemplateController);
addTemplateController.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function addTemplateController($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var addTemplate = this;
    var selectFieldTypeString = '---Select Field Type---';
    addTemplate.fieldType = "---Select Field Type---";
    addTemplate.fieldTypesList = [{ 'fieldName': '---Select Field Type---' }, { 'fieldName': 'TEXTBOX' }, { 'fieldName': 'CHECKBOX' }, { 'fieldName': 'DROPDOWN' }, { 'fieldName': 'TEXTAREA' }]
    addTemplate.sectionName = '';
    addTemplate.fieldName = '';
    addTemplate.selectFieldType = selectFieldType;
    addTemplate.addField = addField;
    var selectedFieldTypeIs = '';

    var organizationId = localStorage.getItem('orgId');

    function selectFieldType(fieldTypeEntity) {
        addTemplate.fieldType = fieldTypeEntity.fieldName;
        switch (addTemplate.fieldType) {
            case 'TEXTBOX':
                selectedFieldTypeIs = 'TEXT_BOX';
                break;
            case 'CHECKBOX':
                selectedFieldTypeIs = 'CHECK_BOX';
                break;
            case 'DROPDOWN':
                selectedFieldTypeIs = 'DROPDOWN';
                break;
            case 'TEXTAREA':
                selectedFieldTypeIs = 'TEXT_AREA';
                break;
        }
    }

    function addField() {
        if (addTemplate.sectionName !== '' && addTemplate.fieldName !== '' && addTemplate.fieldType !== selectFieldTypeString) {
            var addFieldRequestEntity = {};
            addFieldRequestEntity.organizationId = organizationId;
            addFieldRequestEntity.name = 'template';
            addFieldRequestEntity.permissions = ['NURSE'];
            addFieldRequestEntity.visibility = 'ACTIVE';
            addFieldRequestEntity.templateFields = [];
            var templateFieldObject = {};
            templateFieldObject.fieldType = selectedFieldTypeIs;
            templateFieldObject.fieldState = 'ACTIVE';
            templateFieldObject.mandatory = true;
            if (selectedFieldTypeIs == 'TEXT_BOX') {
                templateFieldObject.restrictValues = [];
                templateFieldObject.minValue = '';
                templateFieldObject.maxValue = '';
            }
            templateFieldObject.name = addTemplate.fieldName;
            templateFieldObject.description = dboticaServices.getDescription(addTemplate.fieldName);
            templateFieldObject.sectionName = addTemplate.sectionName;
            addFieldRequestEntity.templateFields.push(templateFieldObject);
            $log.log('req is----', addFieldRequestEntity);
            var addFieldPromise = dboticaServices.addFieldRequest(addFieldRequestEntity);
            $log.log('promise is------', addFieldPromise);
            addFieldPromise.then(function(addNewFieldSuccess) {
                var errorCode = addNewFieldSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var addFieldResponse = angular.fromJson(addNewFieldSuccess.data.response);
                    $log.log('new field response is----', addFieldResponse);
                }
            }, function(addNewFieldError) {
                dboticaServices.noConnectivityError();
            });
        } else {
            dboticaServices.templateMandatoryFieldsSwal();
        }
    }
}
