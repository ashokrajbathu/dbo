angular.module('personalAssistant').controller('patientDetailsController', patientDetailsController);
patientDetailsController.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function patientDetailsController($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var detail = this;

    detail.submitDetails = submitDetails;
    var organizationId = localStorage.getItem('orgId');

    detail.formsList = [];
    var activeTemplatesList = [];
    var localActiveTemplatesList = [];
    var localSortedTemplatesList = [];

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
            $log.log('active templates list is----', activeTemplatesList);
            angular.copy(activeTemplatesList, localActiveTemplatesList);
            angular.forEach(localActiveTemplatesList, function(activeTemplateEntity, key, value) {
                var localSortedArray = [];
                var localTemplatesArray = [];
                angular.forEach(activeTemplatesList, function(localActiveTemplateEntity) {
                    if (activeTemplateEntity.templateFields[0].sectionName == localActiveTemplateEntity.templateFields[0].sectionName) {
                        localSortedArray.push(localActiveTemplateEntity.templateFields[0]);
                    }
                });
                localActiveTemplatesList.splice(key, 1);
                localSortedTemplatesList.push(localSortedArray);
            });
            angular.copy(localSortedTemplatesList, detail.formsList);
            $log.log('after sorting array is-----', localSortedTemplatesList);

        }
    }, function(getTemplatesError) {
        dboticaServices.noConnectivityError();
    });

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

    function submitDetails() {
        $log.log('in submit details');
        $log.log('first name is---', detail.formsList);
    }

};
