angular.module('personalAssistant').controller('addTemplateController', addTemplateController);
addTemplateController.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function addTemplateController($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var addTemplate = this;
    var selectFieldTypeString = '---Select Field Type---';
    addTemplate.fieldType = "---Select Field Type---";
    addTemplate.fieldTypesList = [{ 'fieldName': '---Select Field Type---' }, { 'fieldName': 'TEXTBOX' }, { 'fieldName': 'CHECKBOX' }, { 'fieldName': 'DROPDOWN' }, { 'fieldName': 'TEXTAREA' }, { 'fieldName': 'BUTTON' }]
    addTemplate.sectionName = '';
    addTemplate.fieldName = '';
    addTemplate.fieldHeaderName = '';
    addTemplate.sectionNameDiv = false;
    addTemplate.showDropdownDiv = false;
    addTemplate.selectFieldType = selectFieldType;
    addTemplate.addField = addField;
    addTemplate.addNewDropdownField = addNewDropdownField;
    addTemplate.selectSectionName = selectSectionName;
    addTemplate.addHeaderFields = addHeaderFields;
    var selectedFieldTypeIs = '';
    addTemplate.addedFieldsForDropdown = '';
    addTemplate.addedTableHeaderFields = '';
    addTemplate.tableHeaderFields = '';
    addTemplate.sectionNamesList = [];
    addTemplate.sectionObjectsList = [];
    var initialSectionName = '---Select Section Name---';
    addTemplate.sectionNameToDisplay = '---Select Section Name---';
    var sectionNameObject = { 'sectionName': '---Select Section Name---' };
    var newSectionObject = { 'sectionName': 'New Section' };

    var organizationId = localStorage.getItem('orgId');

    var getTemplatesPromise = dboticaServices.getAllTemplates(organizationId, 'template', true);
    $log.log('templates promise is-------', getTemplatesPromise);
    getTemplatesPromise.then(function(getTemplatesSuccess) {
        var errorCode = getTemplatesSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var getTemplatesResponse = angular.fromJson(getTemplatesSuccess.data.response);
            $log.log('templates Response is--------', getTemplatesResponse);
            if (errorCode == null && getTemplatesSuccess.data.success) {
                angular.forEach(getTemplatesResponse, function(templateEntity) {
                    addTemplate.sectionObjectsList.push(templateEntity.templateFields);
                });
                angular.forEach(addTemplate.sectionObjectsList, function(objectEntity) {
                    addTemplate.sectionNamesList.push(objectEntity[0]);
                });
                addTemplate.sectionNamesList = _.uniqBy(addTemplate.sectionNamesList, 'sectionName');
                addTemplate.sectionNamesList.unshift(sectionNameObject);
                addTemplate.sectionNamesList.push(newSectionObject);
                $log.log('section names are-----', addTemplate.sectionNamesList);
            }
        }
    }, function(getTemplatesError) {
        dboticaServices.noConnectivityError();
    });

    function selectFieldType(fieldTypeEntity) {
        addTemplate.fieldType = fieldTypeEntity.fieldName;
        switch (addTemplate.fieldType) {
            case 'TEXTBOX':
                selectedFieldTypeIs = 'TEXT_BOX';
                addTemplate.showDropdownDiv = false;
                break;
            case 'CHECKBOX':
                selectedFieldTypeIs = 'CHECK_BOX';
                addTemplate.showDropdownDiv = true;
                break;
            case 'DROPDOWN':
                selectedFieldTypeIs = 'DROPDOWN';
                addTemplate.showDropdownDiv = true;
                break;
            case 'TEXTAREA':
                selectedFieldTypeIs = 'TEXT_AREA';
                addTemplate.showDropdownDiv = false;
                break;
            case 'BUTTON':
                selectedFieldTypeIs = 'BUTTON';
                addTemplate.showDropdownDiv = false;
                break;
            case '---Select Field Type---':
                addTemplate.showDropdownDiv = false;
                break;
        }
    }

    function addField() {
        $log.log('kjsdkjs----', addTemplate.sectionName);
        if (addTemplate.sectionName !== '' && addTemplate.sectionName !== initialSectionName && addTemplate.fieldName !== '' && addTemplate.fieldType !== selectFieldTypeString && addTemplate.fieldHeaderName !== '') {
            var addFieldRequestEntity = {};
            addFieldRequestEntity.organizationId = organizationId;
            addFieldRequestEntity.name = 'template';
            addFieldRequestEntity.permissions = ['NURSE'];
            addFieldRequestEntity.visibility = 'ACTIVE';
            addFieldRequestEntity.templateFields = [];
            var templateFieldObject = {};
            templateFieldObject.tableHeaders = [];
            templateFieldObject.headerFieldName = addTemplate.fieldHeaderName;
            templateFieldObject.fieldType = selectedFieldTypeIs;
            templateFieldObject.fieldState = 'ACTIVE';
            templateFieldObject.mandatory = true;
            templateFieldObject.minValue = '';
            templateFieldObject.maxValue = '';
            if (selectedFieldTypeIs == 'TEXT_BOX' || selectedFieldTypeIs == 'BUTTON' || selectedFieldTypeIs == 'TEXT_AREA') {
                templateFieldObject.restrictValues = [];
                templateFieldObject.description = '';
            }
            if (selectedFieldTypeIs == 'DROPDOWN') {
                var dropdownFields = [];
                templateFieldObject.restrictValues = [];
                dropdownFields = _.split(addTemplate.addedFieldsForDropdown, ',');
                templateFieldObject.description = dropdownFields[0];
                angular.forEach(dropdownFields, function(dropdownEntity) {
                    var localFieldObject = {};
                    localFieldObject.name = dropdownEntity;
                    localFieldObject.value = dropdownEntity;
                    templateFieldObject.restrictValues.push(localFieldObject);
                });
            }
            if (selectedFieldTypeIs == 'CHECK_BOX') {
                var checkboxFields = [];
                templateFieldObject.restrictValues = [];
                templateFieldObject.description = '';
                checkBoxFields = _.split(addTemplate.addedFieldsForDropdown, ',');
                angular.forEach(checkBoxFields, function(checkBoxEntity) {
                    var localCheckObject = {};
                    localCheckObject.name = checkBoxEntity;
                    localCheckObject.checkBoxValue = false;
                    templateFieldObject.restrictValues.push(localCheckObject);
                });
            }
            templateFieldObject.name = addTemplate.fieldName;
            templateFieldObject.sectionName = addTemplate.sectionName;
            addFieldRequestEntity.templateFields.push(templateFieldObject);
            /*var tableHeaders = [];
            tableHeaders = _.split(addTemplate.addedTableHeaderFields, ',');
            angular.forEach(tableHeaders, function(headerEntity) {
                var localHeaderObject = {};
                localHeaderObject.headerField = headerEntity;
                templateFieldObject.tableHeaders.push(localHeaderObject);
            });*/
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

    function addNewDropdownField() {
        if (addTemplate.addedFieldsForDropdown == '') {
            addTemplate.addedFieldsForDropdown += addTemplate.newDropdownFieldText;
            addTemplate.newDropdownFieldText = '';
        } else {
            addTemplate.addedFieldsForDropdown += ',';
            addTemplate.addedFieldsForDropdown += addTemplate.newDropdownFieldText;
            addTemplate.newDropdownFieldText = '';
        }
    }

    function selectSectionName(sectionEntity) {
        addTemplate.sectionNameToDisplay = sectionEntity.sectionName;
        if (sectionEntity.sectionName == 'New Section') {
            addTemplate.sectionNameDiv = true;
        } else {
            addTemplate.sectionName = sectionEntity.sectionName;
            addTemplate.sectionNameDiv = false;
        }
    }

    function addHeaderFields() {
        if (addTemplate.addedTableHeaderFields == '') {
            addTemplate.addedTableHeaderFields += addTemplate.tableHeaderFields;
            addTemplate.tableHeaderFields = '';
        } else {
            addTemplate.addedTableHeaderFields += ',';
            addTemplate.addedTableHeaderFields += addTemplate.tableHeaderFields;
            addTemplate.tableHeaderFields = '';
        }

    }
}
