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
        });
});

angular.module('personalAssistant').controller('personalAssistantCtrl', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    $scope.singleModel = 1;
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

    localStorage.setItem("currentState", "patientManagement");
    $scope.loginIntoAssistant = function() {
        var userId = $scope.loginData.userId;
        var password = $scope.loginData.password;
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
                        localStorage.setItem('assistantCurrentlyLoggedIn', currentAssistantObject);
                        $state.go('home');
                        break;
                }
            } else {
                localStorage.setItem('assistantCurrentlyLoggedIn', currentAssistantObject);
                $log.log("assistant info is----", $.parseJSON(response.data.response));
                localStorage.setItem("isLoggedInAssistant", true);
                $state.go('home');
            }
        }, function(errorResponse) {
            console.log("login error response", errorResponse);
        });
    }
}]);


/************** directive  *********************/

/*angular.module('personalAssistant').directive('isNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope) {
            scope.$watch('patientDataSearch.phoneNumberSearch', function(newValue, oldValue) {
                var arr = String(newValue).split("");
                if (arr.length === 0) return;
                if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.')) return;
                if (arr.length === 2 && newValue === '-.') return;
                if (isNaN(newValue)) {
                    scope.patientDataSearch.phoneNumberSearch = oldValue;
                }
            });
        }
    };
});*/
