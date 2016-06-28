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
            /*url: '/home',*/
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
        .state('home.analyticReports', {
            url: '/analyticReports',
            controller: 'analyticReportsCtrl',
            controllerAs: 'analyticReport',
            templateUrl: 'views/analyticReports.html'
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
        .state('home.mainAdmin.registerPatient', {
            controller: 'registerPatientController',
            controllerAs: 'registerPatient',
            templateUrl: 'views/registerPatient.html'
        })
        .state('home.mainAdmin.patientEvents', {
            controller: 'patientEventsController',
            controllerAs: 'patientEvents',
            templateUrl: 'views/patientEvents.html'
        })
        .state('home.nurse', {
            controller: 'nurseController',
            controllerAs: 'nurse',
            templateUrl: 'views/nurseHome.html'
        });
});

angular.module('personalAssistant').controller('personalAssistantCtrl', ['$scope', '$log', '$location', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, $location, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    $scope.singleModel = 1;
    $scope.loading = false;
    $scope.blurScreen = false;
    $scope.radioModel = 'morning';
    $scope.checkModel = {
        left: false,
        middle: true,
        right: false
    };
    $scope.checkResults = [];
    $scope.$watchCollection('checkModel', function() {
        $scope.checkResults = [];
        angular.forEach($scope.checkModel, function(value, key) {
            if (value) {
                $scope.checkResults.push(key);
            }
        });
    });
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
}]);
