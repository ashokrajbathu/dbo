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
        return true;
    }

    function submitDetails(submitEntity) {
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
            angular.forEach(submitEntity, function(entity) {
                var localEntity = {};
                angular.copy(entity, localEntity);
                localEntity.name = dboticaServices.getDescription(localEntity.name);
                switch (localEntity.fieldType) {
                    case 'TEXT_BOX':
                    case 'DROPDOWN':
                    case 'TEXT_AREA':
                        patientDetails[localEntity.name] = localEntity.description;
                        break;
                    case 'CHECK_BOX':
                        var checkArray = [];
                        angular.forEach(entity.restrictValues, function(restrictIs) {
                            if (restrictIs.checkBoxValue) {
                                checkArray.push(restrictIs.name);
                            }
                        });
                        patientDetails[localEntity.name] = _.join(checkArray, ',');
                        break;
                    case 'BUTTON':
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
                }
            }, function(patientDetailsError) {
                dboticaServices.noConnectivityError();
            });
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
