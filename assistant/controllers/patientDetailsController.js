angular.module('personalAssistant').controller('patientDetailsController', patientDetailsController);
patientDetailsController.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function patientDetailsController($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var detail = this;

    detail.submitDetails = submitDetails;
    detail.selectCheckBox = selectCheckBox;
    detail.getData = getData;
    var organizationId = localStorage.getItem('orgId');

    detail.formsList = [];
    var activeTemplatesList = [];
    var localActiveTemplatesList = [];
    var localSortedTemplatesList = [];
    var localSortedObjects = [];
    var templatePatientDetailsListSetter = [];
    detail.templateEventsList = [];
    detail.patient = {};

    var getTemplatesPromise = dboticaServices.getAllTemplates(organizationId, 'template', true);
    $log.log('get templates promise-----', getTemplatesPromise);
    getTemplatesPromise.then(function(getTemplatesSuccess) {
        var errorCode = getTemplatesSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var getTemplatesResponse = angular.fromJson(getTemplatesSuccess.data.response);
            $log.log('get templates response is---------', getTemplatesResponse);
            activeTemplatesList = _.filter(getTemplatesResponse, function(templateEntity) {
                return templateEntity.state == 'ACTIVE' && templateEntity.visibility == 'ACTIVE';
            });
            angular.copy(activeTemplatesList, localActiveTemplatesList);
            angular.forEach(localActiveTemplatesList, function(activeTemplateEntity, key, value) {
                var localSortedArray = [];
                var localTemplatesArray = [];
                angular.forEach(activeTemplatesList, function(localActiveTemplateEntity) {
                    if (activeTemplateEntity.templateFields[0].sectionName == localActiveTemplateEntity.templateFields[0].sectionName) {
                        localActiveTemplateEntity.templateFields[0].createdTime = localActiveTemplateEntity.creationTime;
                        localSortedArray.push(localActiveTemplateEntity.templateFields[0]);
                        localSortedObjects.push(localActiveTemplateEntity);
                    }
                });
                angular.forEach(localSortedObjects, function(sortedEntity) {
                    angular.forEach(localActiveTemplatesList, function(templateEntity, localKey) {
                        if (sortedEntity.id == templateEntity.id) {
                            localActiveTemplatesList.splice(localKey, 1);
                        }
                    });
                });
                localSortedTemplatesList.push(localSortedArray);
            });
            angular.forEach(localSortedTemplatesList, function(sortTempEntity) {
                var buttonIndex = _.findLastIndex(sortTempEntity, function(buttonCheckEntity) {
                    return buttonCheckEntity.fieldType == 'BUTTON';
                });
                sortTempEntity[0].tableHeaders = [];
                angular.forEach(sortTempEntity, function(headerEntity) {
                    var localHeader = {};
                    if (headerEntity.headerFieldName !== 'Button') {
                        localHeader.headerField = headerEntity.headerFieldName;
                        sortTempEntity[0].tableHeaders.push(localHeader);
                    }
                });
                var maxTimeObject = _.maxBy(sortTempEntity, function(sortTimeEntity) {
                    return sortTimeEntity.createdTime;
                });
                var maxTimeIndex = _.findLastIndex(sortTempEntity, function(sortIndexEntity) {
                    return sortIndexEntity.createdTime == maxTimeObject.createdTime;
                });
                if (maxTimeIndex !== undefined && maxTimeIndex !== -1) {
                    sortTempEntity[maxTimeIndex].maxTimeFlag = true;
                }
                if (buttonIndex !== undefined && buttonIndex !== -1) {
                    var templateButtonObject = {};
                    angular.copy(sortTempEntity[buttonIndex], templateButtonObject);
                    sortTempEntity.splice(buttonIndex, 1);
                    sortTempEntity.push(templateButtonObject);
                }
            });
            angular.copy(localSortedTemplatesList, detail.formsList);
            $log.log('after sorting array is-----', localSortedTemplatesList);
        }
    }, function(getTemplatesError) {
        dboticaServices.noConnectivityError();
    });

    function getData() {
        detail.patient = dboticaServices.getPatientDetailsFromService();
        detail.templateEventsList = [];
        detail.templateEventsList = dboticaServices.getTemplatePatientDetails();
        $log.log('templates are---', detail.templateEventsList);
        if (detail.templateEventsList !== templatePatientDetailsListSetter) {
            angular.copy(detail.templateEventsList, templatePatientDetailsListSetter);
        }
        return true;
    }

    function submitDetails(submitEntity, index) {
        $log.log('in submit details');
        $log.log('first name is---', submitEntity);
        $log.log('inpatient is----', detail.patient);
        $log.log('patient is-----', detail.patient);
        var patientDetailsRequestEntity = {};
        if (!jQuery.isEmptyObject(detail.patient)) {
            patientDetailsRequestEntity.organizationId = organizationId;
            patientDetailsRequestEntity.patientId = detail.patient.id;
            patientDetailsRequestEntity.patientName = detail.patient.details.patientName;
            patientDetailsRequestEntity.patientPhoneNumber = detail.patient.phoneNumber;
            patientDetailsRequestEntity.patientEventType = 'PATIENT_DETAILS';
            var currentDate = new Date();
            patientDetailsRequestEntity.startTime = currentDate.getTime();
            patientDetailsRequestEntity.alertTime = '';
            patientDetailsRequestEntity.referenceId = '';
            var patientDetails = {};
            patientDetails.type = 'TEMPLATE_PATIENTDETAILS';
            patientDetails.sectionName = submitEntity[0].sectionName;
            patientDetails.detailsArray = [];
            angular.forEach(submitEntity, function(entity) {
                var localEntity = {};
                angular.copy(entity, localEntity);
                localEntity.name = dboticaServices.getDescription(localEntity.name);
                switch (localEntity.fieldType) {
                    case 'TEXT_BOX':
                    case 'DROPDOWN':
                    case 'TEXT_AREA':
                        var entity = {};
                        entity.nameOfSection = submitEntity[0].sectionName;
                        entity.headerNameToTag = localEntity.headerFieldName;
                        entity.displayField = localEntity.description;
                        patientDetails.detailsArray.push(entity);
                        break;
                    case 'CHECK_BOX':
                        var checkArray = [];
                        var checkEntity = {};
                        angular.forEach(entity.restrictValues, function(restrictIs) {
                            if (restrictIs.checkBoxValue) {
                                checkArray.push(restrictIs.name);
                            }
                        });
                        checkEntity.nameOfSection = submitEntity[0].sectionName;
                        checkEntity.headerNameToTag = localEntity.headerFieldName;
                        checkEntity.displayField = _.join(checkArray, ',');
                        patientDetails.detailsArray.push(checkEntity);
                        break;
                    case 'BUTTON':
                        var buttonEntity = {};
                        buttonEntity.nameOfSection = submitEntity[0].sectionName;
                        buttonEntity.displayField = '';
                        buttonEntity.headerNameToTag = localEntity.headerFieldName;
                        patientDetails.detailsArray.push(buttonEntity);
                        break;
                }
            });
            $log.log('patient details are-----', patientDetails);
            patientDetails = JSON.stringify(patientDetails);
            patientDetailsRequestEntity.referenceDetails = patientDetails;
            $log.log('request entity is---------', patientDetailsRequestEntity);
            var patientDetailsPromise = dboticaServices.patientEvent(patientDetailsRequestEntity);
            $log.log('patient details promise----', patientDetailsPromise);
            patientDetailsPromise.then(function(patientDetailsSuccess) {
                var errorCode = patientDetailsSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var patientDetailsResponse = angular.fromJson(patientDetailsSuccess.data.response);
                    $log.log('patient response is-----', patientDetailsResponse);
                    if (errorCode == null && patientDetailsSuccess.data.success) {
                        patientDetailsResponse.referenceDetails = angular.fromJson(patientDetailsResponse.referenceDetails);
                        detail.templateEventsList.unshift(patientDetailsResponse);
                        dboticaServices.setTemplatePatientDetails(detail.templateEventsList);
                        dboticaServices.templateDetailsSuccessSwal();
                        angular.element('#addPatientDetails' + index).modal('hide');
                    }
                }
            }, function(patientDetailsError) {
                dboticaServices.noConnectivityError();
            });
        } else {
            angular.element('#addPatientDetails' + index).modal('hide');
            dboticaServices.pleaseSelectPatientSwal();
        }
    }

    function selectCheckBox(checkBoxEntity) {
        checkBoxEntity.checkBoxValue = !checkBoxEntity.checkBoxValue;
        $log.log('in check box check----', checkBoxEntity.checkBoxValue);
    }



    /*detail.formsList = [{
        formName: [{
            display: true,
            name: 'First Name',
            modelName: 'first name'
        }, {
            displaySelectBox: true,
            name: 'select Name',
            selectBoxOptions: [
                { 'name': 'ravi', 'value': 'ravi' },
                { 'name': 'teja', 'value': 'teja' },
                { 'name': 'bhisetti', 'value': 'bhisetti' }
            ]
        }, {
            display: true,
            name: 'Address',
            modelName: 'last name'
        }, {
            displaySelectBox: true,
            name: 'Select Friend Name',
            selectBoxOptions: [
                { 'name': 'ramu', 'value': 'ramu' },
                { 'name': 'raju', 'value': 'raju' },
                { 'name': 'teju', 'value': 'teju' }
            ]
        }, {
            display: true,
            name: 'District',
            modelName: 'district'
        }, {
            displayButton: true,
            name: 'Save'
        }, {
            displayRadioButton: true,
            radioButtonName: 'ravi'
        }]
    }, {
        formName: [{
            display: true,
            name: 'Doctor Speciality',
            modelName: ''
        }, {
            displaySelectBox: true,
            name: 'Select Speciality',
            selectBoxOptions: [
                { 'name': 'Nephrology', 'value': 'Nephrology' },
                { 'name': 'Cardiology', 'value': 'Cardiology' },
                { 'name': 'Neurology', 'value': 'Neurology' }
            ]
        }, {
            display: true,
            name: 'Doctor Name',
            modelName: ''
        }, {
            displaySelectBox: true,
            name: 'Select Hospital',
            selectBoxOptions: [
                { 'name': 'Care', 'value': 'Care' },
                { 'name': 'Apollo', 'value': 'Apollo' },
                { 'name': 'KGH', 'value': 'KGH' }
            ]
        }, {
            display: true,
            name: 'Place',
            modelName: ''
        }, {
            displayButton: true,
            name: 'Save'
        }, {
            displayRadioButton: true,
            radioButtonName: 'ravi'
        }]

    }];*/

    /*detail.radiosList = [{
        displayRadioButton: true,
        radioButtonName: 'teja'
    }, {
        displayRadioButton: true,
        radioButtonName: 'bhisetti'
    }];*/


    /*angular.forEach(detail.formsList, function(formEntity) {
        angular.forEach(formEntity.formName, function(entity) {
            if (_.has(entity, 'displaySelectBox')) {
                if (entity.selectBoxOptions.length > 0) {
                    entity.config = entity.selectBoxOptions[0].value;
                }
            }
        });
    });*/

};
