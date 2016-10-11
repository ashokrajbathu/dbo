angular.module('personalAssistant').controller('homeCtrl', homeCtrl);
homeCtrl.$inject = ['$scope', '$log', '$location', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function homeCtrl($scope, $log, $location, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var currentStateActive = localStorage.getItem("currentState");
    var currentActiveAssistant = {};
    var currentActiveAssistantPermissions = [];
    currentActiveAssistant = localStorage.getItem("assistantCurrentlyLoggedIn");
    currentActiveAssistant = $.parseJSON(currentActiveAssistant);
    if (currentActiveAssistant == null || currentActiveAssistant == undefined || currentActiveAssistant == '') {
        var errorCode = 'NO_USER_LOGGED_IN';
        dboticaServices.logoutFromThePage(errorCode);
    } else {
        currentActiveAssistantPermissions = currentActiveAssistant.assistantPermissions;
    }

    $scope.isVisibleNavs = {};
    $scope.isVisibleNavs.patientManagement = false;
    $scope.isVisibleNavs.billManagement = false;
    $scope.isVisibleNavs.inventory = false;
    $scope.isVisibleNavs.operator = false;
    $scope.isVisibleNavs.admin = false;
    $scope.isVisibleNavs.ipd = false;
    $scope.isVisibleNavs.mainAdmin = false;
    $scope.isVisibleNavs.nurse = false;
    $scope.isVisibleNavs.labs = false;
    $scope.isVisibleNavs.insurance = false;

    angular.forEach(currentActiveAssistantPermissions, function(assistantPermission) {
        var assistantSection = assistantPermission;
        switch (assistantSection) {
            case 'PATIENT_MANAGEMENT':
                $scope.isVisibleNavs.patientManagement = true;
                break;
            case 'BILLING_MANAGEMENT':
                $scope.isVisibleNavs.billManagement = true;
                break;
            case 'INVENTORY_MANAGEMENT':
                $scope.isVisibleNavs.inventory = true;
                break;
            case 'ORGANIZATION_MANAGEMENT':
                $scope.isVisibleNavs.admin = true;
                break;
            case 'HOSPITAL_ADMIN':
                $scope.isVisibleNavs.ipd = true;
                $scope.isVisibleNavs.mainAdmin = true;
                $scope.isVisibleNavs.insurance = true;
                break;
            case 'NURSE':
                $scope.isVisibleNavs.nurse = true;
                $scope.isVisibleNavs.labs = true;
                break;
            case 'OPERATOR':
                $scope.isVisibleNavs.operator = true;
                break;
        }
    });


    switch (currentStateActive) {
        case 'patientManagement':
            $state.go('home.patientManagement');
            break;

        case 'billManagement':
            $state.go('home.billManagement');
            break;

        case 'itemInfo':
            $state.go('home.itemInfo');
            break;

        case 'inventory':
            $state.go('home.inventory');
            break;

        case 'admin':
            $state.go('home.admin');
            break;

        case 'operator':
            $state.go('home.operator');
            break;

        case 'invoiceHistory':
            $state.go('home.invoiceHistory');
            break;

        case 'ipd':
            $state.go('home.ipd');
            break;

        case 'mainAdmin':
            $state.go('home.mainAdmin');
            break;

        case 'nurseHome':
            $state.go('home.nurse');
            break;

        case 'labs':
            $state.go('home.labs');
            break;

        case 'insurance':
            $state.go('home.insurance');
            break;
    }

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);

    $scope.logoutFromAssistant = function() {
        var promise = {};
        promise = dboticaServices.logout();
        promise.then(function(response) {
            localStorage.clear();
            localStorage.setItem("isLoggedInAssistant", "false");
            $state.go('login');
        }, function(errorResponse) {
            localStorage.clear();
            localStorage.setItem("isLoggedInAssistant", "false");
            $state.go('login');
            $log.log("in logout error response");
        });
    };
};
