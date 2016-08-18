angular.module('personalAssistant').controller('labsController', labsController);
labsController.$inject = ['$scope', '$log', '$location', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function labsController($scope, $log, $location, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem('currentState', '');
    localStorage.setItem('currentState', 'labs');
    angular.element('#nurseHeader').removeClass('activeAdminLi');
    var labs = this;
    var entitiesArray = [];
    var displayArray = [];
    labs.sampleCollection = sampleCollection;
    labs.pageChanged = pageChanged;
    labs.clearTest = clearTest;
    var billInvoice = {};
    labs.labTestsList = [];
    dboticaServices.setInvoice(billInvoice);
    labs.itemsPerPage = 1;
    labs.currentPage = 1;
    var getLabsPromise = dboticaServices.getLabEntities();
    getLabsPromise.then(function(getLabsSuccess) {
        var errorCode = getLabsSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var getLabsResponse = angular.fromJson(getLabsSuccess.data.response);
            var labsArray = _.filter(getLabsResponse, function(labTestEntity) {
                return labTestEntity.state == 'ACTIVE' && labTestEntity.eventState !== 'INIT_DIAGNOSIS';
            });
            angular.forEach(labsArray, function(labEntry, key, value) {
                labEntry.referenceDetails = angular.fromJson(labEntry.referenceDetails);
            });
            labs.totalItems = labsArray.length;
            angular.copy(labsArray, entitiesArray);
            displayArray = _.chunk(entitiesArray, labs.itemsPerPage);
            angular.copy(displayArray[0], labs.labTestsList);
        }
    }, function(getLabsError) {
        dboticaServices.noConnectivityError();
    });

    function sampleCollection(labTest, index) {
        $log.log('ab test is-----', labTest);
        var labTestActive = {};
        angular.copy(labTest, labTestActive);
        labTestActive.referenceDetails = JSON.stringify(labTestActive.referenceDetails);
        if (labTest.eventState == 'LAB_ALLOTED') {
            labTestActive.eventState = 'SAMPLE_COLLECTED';
        }
        if (labTest.eventState == 'SAMPLE_COLLECTED') {
            labTestActive.eventState = 'LAB_ALLOTED';
        }
        var sampleCollectedPromise = dboticaServices.updateLabEvent(labTestActive);
        sampleCollectedPromise.then(function(sampleCollectedSuccess) {
            var errorCode = sampleCollectedSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var sampleCollectedResponse = angular.fromJson(sampleCollectedSuccess.data.response);
                if (errorCode == null && sampleCollectedSuccess.data.success) {
                    var selectedLabTestIndex = _.findLastIndex(entitiesArray, function(labTestEntity) {
                        return labTestEntity.id == labTest.id;
                    });
                    entitiesArray[selectedLabTestIndex].eventState = labTestActive.eventState;
                    pageChanged();
                }
            }
        }, function(sampleCollectedError) {
            dboticaServices.noConnectivityError();
        });
    }

    function pageChanged() {
        var requiredIndex = labs.currentPage - 1;
        labs.labTestsList = [];
        displayArray = [];
        displayArray = _.chunk(entitiesArray, labs.itemsPerPage);
        angular.copy(displayArray[requiredIndex], labs.labTestsList);
    }

    function clearTest(labActive, index) {
        $log.log('active lab is------', labActive, index);
        var labRequestObject = {};
        angular.copy(labActive, labRequestObject);
        labRequestObject.eventState = 'INIT_DIAGNOSIS';
        labRequestObject.referenceDetails = JSON.stringify(labRequestObject.referenceDetails);
        var clearLabTestPromise = dboticaServices.updateLabEvent(labRequestObject);
        $log.log('clear lab test promise is-----', clearLabTestPromise);
        clearLabTestPromise.then(function(clearLabTestSuccess) {
            var errorCode = clearLabTestSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var clearLabTestResponse = angular.fromJson(clearLabTestSuccess.data.response);
                $log.log('la test respo------', clearLabTestResponse);
                if (errorCode == null && clearLabTestSuccess.data.success) {
                    labs.labTestsList.splice(index, 1);
                    var selectedLabTestIndex = _.findLastIndex(entitiesArray, function(labTestEntity) {
                        return labTestEntity.id == labRequestObject.id;
                    });
                    entitiesArray.splice(selectedLabTestIndex, 1);
                    labs.totalItems = entitiesArray.length;
                    pageChanged();
                }
            }
        }, function(clearLabTestError) {
            dboticaServices.noConnectivityError();
        });
    }
}
