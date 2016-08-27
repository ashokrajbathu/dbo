angular.module('personalAssistant').controller('addTemplateController', addTemplateController);
addTemplateController.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function addTemplateController($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var addTemplate = this;

    addTemplate.templateNameToDisplay = '-Select Template Name-';
    var newTemplateObject = { 'name': 'New Template' };
    var selectTemplateObject = { 'name': '-Select Template Name-' };
    addTemplate.templatesList = [];
    var activeTemplate = {};
    var selectFieldTypeString = '---Select Field Type---';
    addTemplate.newTemplateName = '';
    addTemplate.showDropdownDiv = false;
    addTemplate.templateName = false;
    addTemplate.addBtn = false;
    addTemplate.addNewFieldBtn = true;
    var organizationId = localStorage.getItem('orgId');
    addTemplate.sectionNameToDisplay = '-Select Section Name-';
    var selectSectionObject = { 'sectionName': '-Select Section Name-' };
    var sectionNameObject = { 'sectionName': 'New Section' };
    addTemplate.sectionNamesList = [];
    addTemplate.fieldTypesList = [];
    addTemplate.fieldType = "---Select Field Type---";
    addTemplate.fieldTypesList = [{ 'fieldName': '---Select Field Type---' }, { 'fieldName': 'TEXTBOX' }, { 'fieldName': 'CHECKBOX' }, { 'fieldName': 'DROPDOWN' }, { 'fieldName': 'TEXTAREA' }, { 'fieldName': 'BUTTON' }]
    addTemplate.sectionNamesList.push(sectionNameObject);
    addTemplate.newTemplateSection = false;
    addTemplate.fieldTypeDropdown = false;
    addTemplate.newLabelSection = false;
    addTemplate.showDropdownDiv = false;
    addTemplate.addedFieldsForDropdown = '';
    addTemplate.newSectionName = '';
    addTemplate.newLabelName = '';

    addTemplate.selectTemplate = selectTemplate;
    addTemplate.addNewTemplate = addNewTemplate;
    addTemplate.addNewFieldModal = addNewFieldModal;
    addTemplate.selectFieldType = selectFieldType;
    addTemplate.selectSectionnameInModal = selectSectionnameInModal;
    addTemplate.addEntityToTemplate = addEntityToTemplate;

    var getTemplatesPromise = dboticaServices.getAllTemplates(organizationId, '', true);
    $log.log('get promise is-----------', getTemplatesPromise);
    getTemplatesPromise.then(function(getTemplateSuccess) {
        var errorCode = getTemplateSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var getTemplateResponse = angular.fromJson(getTemplateSuccess.data.response);
            $log.log('resp is-----', getTemplateResponse);
            if (errorCode == null && getTemplateSuccess.data.success) {
                addTemplate.templatesList = _.filter(getTemplateResponse, function(entity) {
                    return entity.state == 'ACTIVE';
                });
                addTemplate.templatesList.push(newTemplateObject);
                addTemplate.templatesList.unshift(selectTemplateObject);
            }
        }
    }, function(getTemplateError) {
        dboticaServices.noConnectivityError();
    });

    function selectTemplate(template) {
        addTemplate.templateNameToDisplay = template.name;
        if (template.name == 'New Template') {
            activeTemplate = {};
            addTemplate.addNewFieldBtn = false;
            addTemplate.templateName = true;
            addTemplate.addBtn = true;
        } else {
            if (template.name !== '-Select Template Name-') {
                activeTemplate = template;
            }
            addTemplate.addNewFieldBtn = true;
            addTemplate.templateName = false;
            addTemplate.addBtn = false;
        }
    }

    function addNewTemplate() {
        if (addTemplate.templateName && addTemplate.addBtn && addTemplate.newTemplateName !== '') {
            var addTemplateRequestEntity = {};
            addTemplateRequestEntity.organizationId = organizationId;
            addTemplateRequestEntity.permissions = ['NURSE'];
            addTemplateRequestEntity.name = addTemplate.newTemplateName;
            addTemplateRequestEntity.visibility = 'ACTIVE';
            addTemplateRequestEntity.templateFields = [];
            var addTemplatePromise = dboticaServices.addFieldRequest(addTemplateRequestEntity);
            $log.log('promise is------', addTemplatePromise);
            addTemplatePromise.then(function(addTemplateSuccess) {
                var errorCode = addTemplateSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var addTemplateResponse = angular.fromJson(addTemplateSuccess.data.response);
                    $log.log('add template response is-------', addTemplateResponse);
                    if (errorCode == null && addTemplateSuccess.data.success) {
                        dboticaServices.newTemplateSuccessSwal();
                        addTemplate.newTemplateName = '';
                        addTemplate.templatesList.splice(1, 0, addTemplateResponse);
                    }
                }
            }, function(addTemplateError) {
                dboticaServices.noConnectivityError();
            });
        } else {
            dboticaServices.addTemplateNameSwal();
        }
    }

    function addNewFieldModal() {
        if (!_.isEmpty(activeTemplate)) {
            angular.element('#addNewFieldModal').modal('show');
            var sectionObjectsList = _.filter(activeTemplate.templateFields, function(templateEntity) {
                if (templateEntity.fieldState == 'ACTIVE') {
                    return templateEntity;
                }
            });
            addTemplate.sectionNamesList = _.uniqBy(sectionObjectsList, 'sectionName');
            addTemplate.sectionNamesList.unshift(selectSectionObject);
            addTemplate.sectionNamesList.push(sectionNameObject);
        } else {
            dboticaServices.selectTemplateSwal();
        }
    }

    function selectSectionnameInModal(selectedSection) {
        addTemplate.sectionNameToDisplay = selectedSection.sectionName;
        if (selectedSection.sectionName == 'New Section') {
            addTemplate.newTemplateSection = true;
            addTemplate.newLabelSection = true;
            addTemplate.fieldTypeDropdown = true;
        } else {
            addTemplate.newLabelSection = true;
            addTemplate.fieldTypeDropdown = true;
            addTemplate.newTemplateSection = false;
        }
    }

    function selectFieldType(fieldType) {
        addTemplate.fieldType = fieldType.fieldName;
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

    function addEntityToTemplate() {
        $log.log('template active is-----', activeTemplate);
        if (addTemplate.sectionNameToDisplay !== '-Select Section Name-') {
            var requestEntity = {};
            var check = false;
            angular.copy(activeTemplate, requestEntity);
            var templateFieldObject = {};
            if (addTemplate.sectionNameToDisplay == 'New Section') {
                templateFieldObject.sectionName = addTemplate.newSectionName;
                check = addTemplate.newSectionName !== '' && addTemplate.newLabelName !== '' && addTemplate.fieldType !== '---Select Field Type---';
            }
            if (addTemplate.sectionNameToDisplay !== 'New Section' && addTemplate.sectionNameToDisplay !== '-Select Section Name-') {
                templateFieldObject.sectionName = addTemplate.sectionNameToDisplay;
                check = addTemplate.newLabelName !== '' && addTemplate.fieldType !== '---Select Field Type---';
            }
            templateFieldObject.name = addTemplate.newLabelName;
            templateFieldObject.headerFieldName = '';
            templateFieldObject.tableHeaders = [];
            templateFieldObject.fieldState = 'ACTIVE';
            templateFieldObject.mandatory = true;
            templateFieldObject.minValue = '';
            templateFieldObject.maxValue = '';
            templateFieldObject.value = '';
            templateFieldObject.fieldType = selectedFieldTypeIs;
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
            requestEntity.templateFields.push(templateFieldObject);
            $log.log('request is-----', requestEntity);
            if (check) {
                var addSectionPromise = dboticaServices.addFieldRequest(requestEntity);
                addSectionPromise.then(function(addSectionSuccess) {
                    var errorCode = addSectionSuccess.data.errorCode;
                    if (errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        var addSectionResponse = angular.fromJson(addSectionSuccess.data.response);
                        $log.log('response is------', addSectionResponse);
                        if (errorCode == null && addSectionSuccess.data.success) {
                            dboticaServices.fieldDetailsUpdateSuccessSwal();
                            addTemplate.newSectionName = '';
                            addTemplate.newLabelName = '';
                            addTemplate.newTemplateSection = false;
                            addTemplate.showDropdownDiv = false;
                            activeTemplate = {};
                            addTemplate.sectionNameToDisplay = '-Select Section Name-';
                            addTemplate.fieldType = '---Select Field Type---';
                        }
                    }
                }, function(addSectionError) {
                    dboticaServices.noConnectivityError();
                });
            } else {
                dboticaServices.templateMandatoryFieldsSwal();
            }
        } else {
            dboticaServices.templateMandatoryFieldsSwal();
        }
    }
}
