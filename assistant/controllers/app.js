angular.module('oitozero.ngSweetAlert', [])
    .factory('SweetAlert', [function() {
        var swal = window.swal;
        var self = {

            swal: function(arg1, arg2, arg3) {
                swal(arg1, arg2, arg3);
            },
            success: function(title, message) {
                swal(title, message, 'success');
            },
            error: function(title, message) {
                swal(title, message, 'error');
            },
            warning: function(title, message) {
                swal(title, message, 'warning');
            },
            info: function(title, message) {
                swal(title, message, 'info');
            }
        };
        return self;
    }]);

angular.module('personalAssistant').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: 'views/login.html'
        })
        .state('home', {
            templateUrl: 'views/home.html'
        })
        .state('home.patientManagement', {
            url: '/patientManagement',
            templateUrl: 'views/patientManagement.html'
        })
        .state('home.inventory', {
            url: '/inventory',
            controller: 'inventoryCtrl',
            controllerAs: 'inventory',
            templateUrl: 'views/inventory.html'
        })
        .state('home.billManagement', {
            url: '/billManagement',
            controller: 'billManagementCtrl',
            controllerAs: 'billView',
            templateUrl: 'views/billManagement.html'
        })
        .state('home.itemInfo', {
            url: '/itemInfo',
            controller: 'itemInfoCtrl',
            controllerAs: 'itemInfo',
            templateUrl: 'views/itemInfo.html'
        })
        .state('home.admin', {
            url: '/admin',
            controller: 'adminCtrl',
            controllerAs: 'adminView',
            templateUrl: 'views/admin.html'
        })
        .state('home.operator', {
            url: '/operator',
            controller: 'operatorController',
            controllerAs: 'operator',
            templateUrl: 'views/operator.html'
        })
        .state('home.invoiceHistory', {
            url: '/invoiceHistory',
            controller: 'invoiceHistoryController',
            controllerAs: 'invoice',
            templateUrl: 'views/invoiceHistory.html'
        })
        .state('home.ipd', {
            url: '/ipd',
            controller: 'inpatientController',
            controllerAs: 'inpatient',
            templateUrl: 'views/inpatient.html'
        })
        .state('home.mainAdmin', {
            url: '/administration',
            controller: 'mainAdminController',
            controllerAs: 'mainAdmin',
            redirectTo: 'home.mainAdmin.addDocCategory',
            templateUrl: 'views/mainAdmin.html'
        })
        .state('home.mainAdmin.addDocCategory', {
            controller: 'doctorCategoryController',
            controllerAs: 'doctorCategory',
            templateUrl: 'views/doctorCategory.html'
        })
        .state('home.mainAdmin.addDoctor', {
            controller: 'doctorController',
            controllerAs: 'doctor',
            templateUrl: 'views/addDoctor.html'
        })
        .state('home.mainAdmin.addRoomCategory', {
            controller: 'roomCategoryController',
            controllerAs: 'roomCategory',
            templateUrl: 'views/roomCategory.html'
        })
        .state('home.mainAdmin.addRoom', {
            controller: 'roomController',
            controllerAs: 'room',
            templateUrl: 'views/addRoom.html'
        })
        .state('home.mainAdmin.addBed', {
            controller: 'bedController',
            controllerAs: 'bed',
            templateUrl: 'views/addBed.html'
        })
        .state('home.mainAdmin.addTemplate', {
            controller: 'addTemplateController',
            controllerAs: 'addTemplate',
            templateUrl: 'views/addTemplate.html'
        })
        .state('home.mainAdmin.registerPatient', {
            controller: 'registerPatientController',
            controllerAs: 'registerPatient',
            templateUrl: 'views/registerPatient.html'
        })
        .state('home.mainAdmin.permissions', {
            controller: 'permissionsController',
            controllerAs: 'permissions',
            templateUrl: 'views/permissions.html'
        })
        .state('home.mainAdmin.patientEvents', {
            controller: 'patientEventsController',
            controllerAs: 'patientEvents',
            templateUrl: 'views/patientEvents.html'
        })
        .state('home.nurse', {
            url: '/nurse',
            controller: 'nurseController',
            redirectTo: 'home.nurse.patientMedication',
            controllerAs: 'nurse',
            templateUrl: 'views/nurseHome.html'
        })
        .state('home.nurse.patientMedication', {
            controller: 'medicationController',
            controllerAs: 'medication',
            templateUrl: 'views/medication.html'
        })
        .state('home.nurse.intakeOutputRecord', {
            controller: 'intakeOutputController',
            controllerAs: 'intakeOutput',
            templateUrl: 'views/intakeOutput.html'
        })
        .state('home.nurse.nurseProgressNote', {
            controller: 'progressNoteController',
            controllerAs: 'progressNote',
            templateUrl: 'views/progressNote.html'
        })
        .state('home.nurse.vitalSign', {
            controller: 'vitalSignController',
            controllerAs: 'vitalSign',
            templateUrl: 'views/vitalSign.html'
        })
        .state('home.nurse.bedSideProcedure', {
            controller: 'bedSideProcedureController',
            controllerAs: 'bedSide',
            templateUrl: 'views/bedSide.html'
        })
        .state('home.nurse.ipRoomTransfer', {
            controller: 'ipRoomTransferController',
            controllerAs: 'ipRoomTransfer',
            templateUrl: 'views/ipRoomTransfer.html'
        })
        .state('home.nurse.patientHistory', {
            controller: 'patientHistoryController',
            controllerAs: 'patientHistory',
            templateUrl: 'views/patientHistory.html'
        })
        .state('home.nurse.dischargeSummary', {
            controller: 'dischargeSummaryController',
            controllerAs: 'dischargeSummary',
            templateUrl: 'views/dischargeSummary.html'
        })
        .state('home.nurse.patientDetails', {
            controller: 'patientDetailsController',
            controllerAs: 'detail',
            templateUrl: 'views/patientDetails.html'
        })
        .state('home.labs', {
            controller: 'labsController',
            controllerAs: 'labs',
            templateUrl: 'views/labs.html'
        });
});

angular.module('personalAssistant').controller('personalAssistantCtrl', personalAssistantCtrl);
personalAssistantCtrl.$inject = ['$scope', '$log', '$location', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function personalAssistantCtrl($scope, $log, $location, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    $scope.singleModel = 1;
    $scope.loading = false;
    $scope.blurScreen = false;
    $scope.radioModel = 'morning';
    if (localStorage.getItem("isLoggedInAssistant") == "true") {
        $state.go('home');
    }

    $scope.loginData = {};
    $scope.loginData.userId = "";
    $scope.loginData.password = "";

    $scope.loginIntoAssistant = function() {
        var userId = $scope.loginData.userId;
        var password = $scope.loginData.password;
        if ($scope.loginData.userId !== "" && $scope.loginData.password !== "") {
            $scope.loading = false;
            $scope.blurScreen = false;
            var promise = dboticaServices.login(userId, password);
            promise.then(function(response) {
                var success = response.data.success;
                var currentAssistantObject = response.data.response;
                if (success === false) {
                    var errorCode = response.data.errorCode;
                    console.log("error code in is----" + errorCode);
                    switch (errorCode) {
                        case "BAD_CREDENTIALS":
                            console.log("in bad credentials");
                            swal({
                                title: "Error",
                                text: "Invalid User Name or Password.",
                                type: "error",
                                confirmButtonText: "OK"
                            }, function() {});
                            break;
                        case "USER_ALREADY_LOGGED_IN":
                            var loggedInAss = localStorage.getItem('assistantCurrentlyLoggedIn');
                            var assistantObj = $.parseJSON(loggedInAss);
                            $log.log("assis obj is----", assistantObj);
                            if (assistantObj !== null && assistantObj !== undefined && assistantObj !== '') {
                                currentStateAllocation(assistantObj.assistantPermissions);
                                var organizationIdActive = assistantObj.organizationId;
                                localStorage.setItem('orgId', organizationIdActive);
                                localStorage.setItem('assistant', JSON.stringify(assistantObject));
                                $state.go('home');
                                break;
                            } else {
                                var logoutPromise = {};
                                logoutPromise = dboticaServices.logout();
                                logoutPromise.then(function(response) {
                                    localStorage.clear();
                                    localStorage.setItem("isLoggedInAssistant", "false");
                                }, function(errorResponse) {
                                    $log.log("in error response of logout in home page");
                                });
                            }
                    }
                } else {
                    localStorage.setItem('assistantCurrentlyLoggedIn', currentAssistantObject);
                    var assistantObject = $.parseJSON(response.data.response);
                    var organizationId = assistantObject.organizationId;
                    localStorage.setItem('assistant', JSON.stringify(assistantObject));
                    localStorage.setItem('orgId', organizationId);
                    $log.log("assistant info is----", $.parseJSON(response.data.response));
                    localStorage.setItem("isLoggedInAssistant", "true");
                    currentStateAllocation(assistantObject.assistantPermissions);
                    $state.go('home');
                }
                $scope.loading = false;
                $scope.blurScreen = false;
            }, function(errorResponse) {
                $scope.blurScreen = false;
                $scope.loading = false;
                dboticaServices.noConnectivityError();
                console.log("login error response", errorResponse);
            });
        } else {
            dboticaServices.loginErrorSwal();
        }
    }

    function currentStateAllocation(assistantPermissions) {
        var assistantPermission = assistantPermissions[0];
        switch (assistantPermission) {
            case 'PATIENT_MANAGEMENT':
                localStorage.setItem("currentState", "patientManagement");
                break;
            case 'BILLING_MANAGEMENT':
                localStorage.setItem("currentState", "billManagement");
                break;
            case 'INVENTORY_MANAGEMENT':
                localStorage.setItem("currentState", "inventory");
                break;
            case 'ORGANIZATION_MANAGEMENT':
                localStorage.setItem("currentState", "admin");
                break;
            case 'HOSPITAL_ADMIN':
                localStorage.setItem("currentState", "mainAdmin");
                break;
            case 'NURSE':
                localStorage.setItem("currentState", "nurseHome");
                break;
        }
    }
};
