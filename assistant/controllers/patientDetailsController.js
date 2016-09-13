angular.module('personalAssistant').controller('patientDetailsController', patientDetailsController);
patientDetailsController.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function patientDetailsController($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var detail = this;
    var organizationId = localStorage.getItem('orgId');
    var templatesList = [];
    detail.activeTemplate = {};
    detail.patient = {};
    var onLoadTemplateFields = {};

    detail.submitPatientFullForm = submitPatientFullForm;
    detail.getData = getData;

    /* isPalindrome('madam');
     isPalindrome('ravi teja');*/
    charCount('hello world');
    swapNumber(43, 12);

    var assistantObject = localStorage.getItem('assistant');
    var organizationId = localStorage.getItem('orgId');
    assistantObject = angular.fromJson(assistantObject);
    angular.copy($scope.activeTemplateFields, onLoadTemplateFields);

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

    function submitPatientFullForm() {
        var templateInstance = {};
        templateInstance.templateId = detail.activeTemplate.id;
        var localTemplateValues = {};
        angular.copy($scope.activeTemplateFields, localTemplateValues);
        templateInstance.templateValues = JSON.stringify(localTemplateValues);
        templateInstance.patientId = detail.patient.id;
        templateInstance.userId = assistantObject.id;
        templateInstance.userRole = 'ASSISTANT';
        templateInstance.organizationId = organizationId;
        templateInstance.overridePermissions = assistantObject.assistantPermissions;
        var addTemplateInstancePromise = dboticaServices.addTemplateInstance(templateInstance);
        addTemplateInstancePromise.then(function(addInstanceSuccess) {
            var errorCode = addInstanceSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var addTemplateResponse = angular.fromJson(addInstanceSuccess.data.response);
                if (errorCode == null && addInstanceSuccess.data.success) {
                    dboticaServices.templateInstanceSuccessSwal();
                    angular.copy(onLoadTemplateFields, $scope.activeTemplateFields);
                }
            }
        }, function(addTemplateError) {
            dboticaServices.noConnectivityError();
        });
    }

    function getData() {
        detail.patient = dboticaServices.getPatientDetailsFromService();
        return true;
    }

    function charCount(string) {
        string = string.replace(/\s/g, '');
        string = string.toLowerCase();
        var stringArray = string.split('');
        var output = [];
        var exists = {};
        for (var index = 0; index < stringArray.length; index++) {
            if (exists[stringArray[index]]) {
                exists[stringArray[index]]++;
            } else {
                exists[stringArray[index]] = 1;
            }
        }
        for (var j in exists) {
            $log.log(j, exists[j]);
        }
    }

    /* function charCount(string) {
         string = string.replace(/\s/g, '');
         string = string.toLowerCase();
         var arr = new Array(26).fill(0);
         for (var index = 0; index < string.length; index++) {
             var charCode = string.charCodeAt(index);
             arr[charCode - 97]++;
         }
         for (var lindex = 0; lindex < arr.length; lindex++) {
             if (arr[lindex] !== 0) {
                 console.log(String.fromCharCode(lindex + 97), arr[lindex]);
             }
         }
     }

     function removeDuplicates(string) {
         var stringArray = string.split('');
         var exists = {};
         var output = [];
         for (var index = 0; index < stringArray.length; index++) {
             if (!exists[stringArray[index]]) {
                 output.push(stringArray[index]);
                 exists[stringArray[index]] = true;
             }
         }
         var outputStr = output.join('');
         $log.log('str is---', outputStr);
     }

     function reverseString(string) {
         var stringArray = string.split('');
         var output = [];
         for (var index = stringArray.length - 1; index >= 0; index--) {
             output.push(stringArray[index]);
         }
         var outputStr = output.join('');
         $log.log('result is----', outputStr);
     }

     function removeDuplicateChar(string) {
         var stringArray = string.split('');
         var exists = {};
         var output = [];
         for (var index = 0; index < stringArray.length; index++) {
             if (exists[stringArray[index]]) {
                 exists[stringArray[index]]++;
             } else {
                 exists[stringArray[index]] = 1;
             }
         }
         for (var j in exists) {
             if (exists[j] == 1) {
                 output.push(j);
             }
         }
         var outputStr = output.join('');
         $log.log('str result is----', outputStr);
     }

     function isPalindrome(string) {
         var stringArray = string.split('');
         var output = [];
         for (var index = stringArray.length - 1; index >= 0; index--) {
             output.push(stringArray[index]);
         }
         var outputStr = output.join('');
         if (string == outputStr) {
             return true;
         } else {
             return false;
         }
     }*/

    /*function swapNumber(a, b) {
        $log.log('a:' + a + "and b:" + b);
        a = a ^ b;
        b = a ^ b;
        a = a ^ b;
        $log.log('after a:' + a + "and after b:" + b);
    }*/


};
