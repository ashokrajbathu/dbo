var app = angular.module('printDischargeSummary', []);

app.controller('printDischargeSummaryController', ['$scope', '$window', '$timeout', 'dischargeServices', function($scope, $window, $timeout, dischargeServices) {
    $scope.activeTemplateInstances = [];

    var patientActive = localStorage.getItem('activeDischargePatient');
    patientActive = angular.fromJson(patientActive);
    var getTemplateInstances = dischargeServices.getPatientTemplateInstances(patientActive.organizationCaseId, patientActive.organizationId);
    getTemplateInstances.then(function(getInstancesSuccess) {
        $scope.name = 'ravi';
        var errorCode = getInstancesSuccess.data.errorCode;
        if (errorCode) {} else {
            var getInstancesResponse = angular.fromJson(getInstancesSuccess.data.response);
            if (errorCode == null && getInstancesSuccess.data.success) {
                getInstancesResponse = _.filter(getInstancesResponse, function(entity) {
                    return entity.state == 'ACTIVE';
                });
                var prescriptionEntities = [];
                if (getInstancesResponse.length > 0) {
                    angular.forEach(getInstancesResponse, function(instanceEntity) {
                        var localFieldValues = angular.fromJson(instanceEntity.templateValues);
                        var lastUpdatedValue = instanceEntity.lastUpdated;
                        angular.forEach(localFieldValues, function(field) {
                            angular.forEach(field, function(fieldEntity) {
                                var localObject = {};
                                if (fieldEntity.description !== '' && fieldEntity.fieldType !== 'CHECK_BOX') {
                                    localObject.sectionName = fieldEntity.sectionName;
                                    localObject.lastUpdated = lastUpdatedValue;
                                    localObject.fieldType = fieldEntity.fieldType;
                                    localObject.name = fieldEntity.name;
                                    localObject.value = fieldEntity.description;
                                    prescriptionEntities.push(localObject);
                                }
                                if (fieldEntity.fieldType == 'CHECK_BOX') {
                                    localObject.sectionName = fieldEntity.sectionName;
                                    localObject.lastUpdated = lastUpdatedValue;
                                    localObject.fieldType = fieldEntity.fieldType;
                                    localObject.name = fieldEntity.name;
                                    var arr = [];
                                    angular.forEach(fieldEntity.restrictValues, function(restrictEntity) {
                                        if (restrictEntity.checkBoxValue) {
                                            arr.push(restrictEntity.name);
                                        }
                                    });
                                    localObject.value = arr.join(',');
                                    prescriptionEntities.push(localObject);
                                }
                            });
                        });
                    });
                    prescriptionEntities = _.groupBy(prescriptionEntities, 'sectionName');
                    angular.forEach(prescriptionEntities, function(prescEntry) {
                        var localSortedArray = [];
                        localSortedArray = _.groupBy(prescEntry, 'lastUpdated');
                        $scope.activeTemplateInstances.push(localSortedArray);
                        $timeout($window.print, 0);
                    });
                }
            }
        }
    }, function(getTemplateError) {});
}]);

app.service('dischargeServices', ['$http', '$q', function($http, $q) {
    this.getPatientTemplateInstances = function(patientId, organizationId) {
        var deferred = $q.defer();
        var instanceRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/template/getPatientTemplateInstances?patientId=' + patientId + '&organizationId=' + organizationId,
            withCredentials: true
        }
        $http(instanceRequest).then(function(instanceSuccess) {
            deferred.resolve(instanceSuccess);
        }, function(instanceError) {
            deferred.reject(instanceError);
        });
        return deferred.promise;
    }
}]);
