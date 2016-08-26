angular.module('personalAssistant').controller('addTemplateController', addTemplateController);
addTemplateController.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function addTemplateController($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var addTemplate = this;
    var selectFieldTypeString = '---Select Field Type---';
    addTemplate.fieldType = "---Select Field Type---";
    addTemplate.fieldTypesList = [{ 'fieldName': '---Select Field Type---' }, { 'fieldName': 'TEXTBOX' }, { 'fieldName': 'CHECKBOX' }, { 'fieldName': 'DROPDOWN' }, { 'fieldName': 'TEXTAREA' }, { 'fieldName': 'BUTTON' }]
    addTemplate.sectionName = '';
    addTemplate.fieldName = '';
    var sectionActive = {};
    var sectionActiveObjects = [];
    addTemplate.fieldHeaderName = '';
    addTemplate.labelNameToEdit = '';
    var editFieldFlag = false;
    addTemplate.selectedLabelHeaderField = false;
    addTemplate.selectedLabelName = false;
    addTemplate.labelsDropdownDiv = false;
    addTemplate.editSectionDetails = false;
    addTemplate.sectionNameDiv = false;
    addTemplate.showDropdownDiv = false;
    addTemplate.newFieldName = true;
    addTemplate.newFieldHeaderName = true;
    addTemplate.fieldTypeDiv = true;
    addTemplate.selectFieldType = selectFieldType;
    addTemplate.addField = addField;
    addTemplate.editFieldNames = editFieldNames;
    addTemplate.addNewDropdownField = addNewDropdownField;
    addTemplate.selectSectionName = selectSectionName;
    addTemplate.addHeaderFields = addHeaderFields;
    addTemplate.changeSectionDetails = changeSectionDetails;
    var selectedFieldTypeIs = '';
    addTemplate.addedFieldsForDropdown = '';
    addTemplate.addedTableHeaderFields = '';
    addTemplate.tableHeaderFields = '';
    addTemplate.sectionNamesList = [];
    addTemplate.sectionObjectsList = [];
    addTemplate.actveSectionLabels = [];
    var activeTemplatesOnLoad = [];
    var activeEditTemplateObject = {};
    var activeLabelObject = { 'name': '---Select Label Name---', 'templateId': '' };
    addTemplate.activeLabelName = '---Select Label Name---';
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
            var activeTemplates = [];
            activeTemplates = _.filter(getTemplatesResponse, function(getEntity) {
                return getEntity.state == 'ACTIVE' && getEntity.visibility == 'ACTIVE';
            });
            angular.copy(activeTemplates, activeTemplatesOnLoad);
            if (errorCode == null && getTemplatesSuccess.data.success) {
                angular.forEach(activeTemplates, function(templateEntity) {
                    templateEntity.templateFields[0].templateId = templateEntity.id;
                    addTemplate.sectionObjectsList.push(templateEntity.templateFields[0]);
                });
                $log.log('objects list is--------', addTemplate.sectionObjectsList);
                angular.forEach(addTemplate.sectionObjectsList, function(objectEntity) {
                    addTemplate.sectionNamesList.push(objectEntity);
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
        $log.log('field is----', addTemplate.sectionName);
        if (!editFieldFlag) {
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
        } else {
            $log.log('in edit section fields----');
            var editIndex = _.findLastIndex(activeTemplatesOnLoad, function(templateLoadEntity) {
                return templateLoadEntity.id == activeEditTemplateObject.templateId;
            });
            var templateToEdit = activeTemplatesOnLoad[editIndex];
            $log.log('edit req object is---------', templateToEdit);
            templateToEdit.templateFields[0].name = addTemplate.labelNameToEdit;
            templateToEdit.templateFields[0].headerFieldName = addTemplate.labelHeaderToEdit;
            if (templateToEdit.templateFields[0].fieldType == 'DROPDOWN') {
                var dropdownFields = [];
                templateToEdit.templateFields[0].restrictValues = [];
                dropdownFields = _.split(addTemplate.addedFieldsForDropdown, ',');
                templateToEdit.templateFields[0].description = dropdownFields[0];
                angular.forEach(dropdownFields, function(dropdownEntity) {
                    var localFieldObject = {};
                    localFieldObject.name = dropdownEntity;
                    localFieldObject.value = dropdownEntity;
                    templateToEdit.templateFields[0].restrictValues.push(localFieldObject);
                });
            }
            if (templateToEdit.templateFields[0].fieldType == 'CHECK_BOX') {
                var checkboxFields = [];
                templateToEdit.templateFields[0].restrictValues = [];
                templateToEdit.templateFields[0].description = '';
                checkBoxFields = _.split(addTemplate.addedFieldsForDropdown, ',');
                angular.forEach(checkBoxFields, function(checkBoxEntity) {
                    var localCheckObject = {};
                    localCheckObject.name = checkBoxEntity;
                    localCheckObject.checkBoxValue = false;
                    templateToEdit.templateFields[0].restrictValues.push(localCheckObject);
                });
            }
            $log.log('edit request entity is------', templateToEdit);
            var editFieldPromise = dboticaServices.addFieldRequest(templateToEdit);
            $log.log('edit promise is----', editFieldPromise);
            editFieldPromise.then(function(editFieldSuccess) {
                var errorCode = editFieldSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var editFieldResponse = angular.fromJson(editFieldSuccess.data.response);
                    $log.log('edit response is------', editFieldResponse);
                    if (errorCode == null && editFieldSuccess.data.success) {
                        dboticaServices.fieldDetailsUpdateSuccessSwal();
                        addTemplate.labelNameToEdit = '';
                        addTemplate.addedFieldsForDropdown = '';
                        addTemplate.labelHeaderToEdit = '';
                        addTemplate.showDropdownDiv = false;
                        addTemplate.activeLabelName = '---Select Label Name---';
                        angular.forEach(addTemplate.actveSectionLabels, function(sectionLabel) {
                            if (sectionLabel.templateId == editFieldResponse.id) {
                                sectionLabel.name = editFieldResponse.templateFields[0].name;
                                angular.copy(editFieldResponse.templateFields[0].restrictValues, sectionLabel.restrictValues);
                            }
                        });
                    }
                }
            }, function(editFieldError) {
                dboticaServices.noConnectivityError();
            });
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
        editFieldFlag = false;
        activeEditTemplateObject = {};
        addTemplate.sectionNameToDisplay = sectionEntity.sectionName;
        if (sectionEntity.sectionName == 'New Section') {
            addTemplate.editSectionDetails = false;
            addTemplate.sectionNameDiv = true;
            addTemplate.sectionNameToDisplay = 'New Section';
            addTemplate.sectionName = '';
            sectionActive = {};
            addTemplate.newFieldHeaderName = true;
            addTemplate.newFieldName = true;
            addTemplate.fieldTypeDiv = true;
            addTemplate.labelsDropdownDiv = false;
        } else {
            if (sectionEntity.sectionName == '---Select Section Name---') {
                addTemplate.editSectionDetails = false;
                addTemplate.sectionNameDiv = false;
                sectionActive = {};
                addTemplate.labelsDropdownDiv = false;
                addTemplate.selectedLabelName = false;
                addTemplate.selectedLabelHeaderField = false;
                addTemplate.newFieldHeaderName = true;
                addTemplate.newFieldName = true;
                addTemplate.fieldTypeDiv = true;
            } else {
                angular.copy(sectionEntity, sectionActive);
                var emptyObject = {};
                angular.copy(emptyObject, sectionActiveObjects);
                $log.log('section active is------', sectionActive);
                addTemplate.activeLabelName = '---Select Label Name---';
                addTemplate.editSectionDetails = true;
                addTemplate.newFieldName = true;
                addTemplate.newFieldHeaderName = true;
                addTemplate.fieldTypeDiv = true;
                addTemplate.labelsDropdownDiv = false;
                addTemplate.selectedLabelName = false;
                addTemplate.selectedLabelHeaderField = false;
                angular.forEach(addTemplate.sectionObjectsList, function(objectEntity, key, value) {
                    if (objectEntity.sectionName == sectionActive.sectionName) {
                        sectionActiveObjects.push(objectEntity);
                    }
                });
                sectionActiveObjects.unshift(activeLabelObject);
                $log.log('section active objects are---', sectionActiveObjects);
            }
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

    function changeSectionDetails() {
        addTemplate.sectionNameDiv = false;
        addTemplate.newFieldName = false;
        addTemplate.newFieldHeaderName = false;
        addTemplate.fieldTypeDiv = false;
        addTemplate.labelsDropdownDiv = true;
        addTemplate.selectedLabelName = false;
        addTemplate.selectedLabelHeaderField = false;
        editFieldFlag = true;
        addTemplate.showDropdownDiv = false;
        angular.copy(sectionActiveObjects, addTemplate.actveSectionLabels);
    }

    function editFieldNames(editFieldEntity) {
        $log.log('field to edit is------', editFieldEntity);
        addTemplate.activeLabelName = editFieldEntity.name;
        if (editFieldEntity.name !== '---Select Label Name---') {
            angular.copy(editFieldEntity, activeEditTemplateObject);
            addTemplate.selectedLabelName = true;
            addTemplate.selectedLabelHeaderField = true;
            addTemplate.labelHeaderToEdit = editFieldEntity.headerFieldName;
            addTemplate.labelNameToEdit = editFieldEntity.name;
            addTemplate.addedFieldsForDropdown = '';
            if (editFieldEntity.fieldType == 'DROPDOWN' || editFieldEntity.fieldType == 'CHECK_BOX') {
                addTemplate.showDropdownDiv = true;
                var localDropdownValuesArray = [];
                angular.forEach(editFieldEntity.restrictValues, function(restrict) {
                    if (editFieldEntity.fieldType == 'DROPDOWN') {
                        localDropdownValuesArray.push(restrict.value);
                    } else {
                        localDropdownValuesArray.push(restrict.name);
                    }
                });
                addTemplate.addedFieldsForDropdown = _.join(localDropdownValuesArray, ',');
            }
        } else {
            activeEditTemplateObject = {};
            addTemplate.showDropdownDiv = false;
            addTemplate.selectedLabelHeaderField = false;
            addTemplate.selectedLabelName = false;
        }

    }
}
