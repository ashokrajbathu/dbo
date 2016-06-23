angular.module('personalAssistant').controller('homeCtrl', ['$scope', '$log', '$location', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, $location, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {

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
    $scope.isVisibleNavs.analyticReports = false;
    $scope.isVisibleNavs.admin = false;
    $scope.isVisibleNavs.ipd = false;
    $scope.isVisibleNavs.mainAdmin = false;
    $scope.isPatientBlack = true;
    $scope.isPatientBlue = false;
    $scope.isBillBlue = true;
    $scope.isBillBlack = false;
    $scope.isAdminBlack = false;
    $scope.isAdminBlue = true;
    $scope.isAnalyticBlue = true;
    $scope.isAnalyticBlack = false;
    $scope.isInventoryBlue = true;
    $scope.isInventoryBlack = false;
    $scope.isIpdBlack = false;
    $scope.isIpdBlue = true;
    $scope.isMainAdminBlack = false;
    $scope.isMainAdminBlue = true;

    /* for (var assistantPermission in currentActiveAssistantPermissions) {*/
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
                $scope.isVisibleNavs.analyticReports = true;
                $scope.isVisibleNavs.admin = true;
                $scope.isVisibleNavs.ipd = true;
                $scope.isVisibleNavs.mainAdmin = true;
                break;
        }

    });

    switch (currentStateActive) {
        case 'patientManagement':
            patientSection();
            $state.go('home.patientManagement');
            break;

        case 'billManagement':
            billSection();
            $state.go('home.billManagement');
            break;

        case 'itemInfo':
            inventorySection();
            $state.go('home.itemInfo');
            break;

        case 'inventory':
            inventorySection();
            $state.go('home.inventory');
            break;

        case 'admin':
            adminSection();
            $state.go('home.admin');
            break;

        case 'analyticReport':
            analyticSection();
            $state.go('home.analyticReports');
            break;

        case 'invoiceHistory':
            billSection();
            $state.go('home.invoiceHistory');
            break;

        case 'ipd':
            ipdSection();
            $state.go('home.ipd');
            break;

        case 'mainAdmin':
            mainAdminSection();
            $state.go('home.mainAdmin');
            break;
    }

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);

    $scope.activeSectionBackGroundToggle = function(sectionName) {
        switch (sectionName) {
            case 'bill':
                billSection();
                break;
            case 'patient':
                patientSection();
                break;
            case 'inventory':
                inventorySection();
                break;
            case 'admin':
                adminSection();
                break;
            case 'analytic':
                analyticSection();
                break;
            case 'ipd':
                ipdSection();
                break;
            case 'mainAdmin':
                mainAdminSection();
                break;
        }
    }
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

    function patientSection() {
        $scope.isPatientBlack = true;
        $scope.isPatientBlue = false;
        $scope.isBillBlue = true;
        $scope.isBillBlack = false;
        $scope.isAdminBlack = false;
        $scope.isAdminBlue = true;
        $scope.isAnalyticBlue = true;
        $scope.isAnalyticBlack = false;
        $scope.isInventoryBlack = false;
        $scope.isInventoryBlue = true;
        $scope.isIpdBlack = false;
        $scope.isIpdBlue = true;
        $scope.isMainAdminBlue = true;
        $scope.isMainAdminBlack = false;
    }

    function billSection() {
        $scope.isPatientBlack = false;
        $scope.isPatientBlue = true;
        $scope.isBillBlue = false;
        $scope.isBillBlack = true;
        $scope.isAdminBlack = false;
        $scope.isAdminBlue = true;
        $scope.isAnalyticBlue = true;
        $scope.isAnalyticBlack = false;
        $scope.isInventoryBlack = false;
        $scope.isInventoryBlue = true;
        $scope.isIpdBlack = false;
        $scope.isIpdBlue = true;
        $scope.isMainAdminBlue = true;
        $scope.isMainAdminBlack = false;
    }

    function inventorySection() {
        $scope.isPatientBlack = false;
        $scope.isPatientBlue = true;
        $scope.isBillBlue = true;
        $scope.isBillBlack = false;
        $scope.isAdminBlack = false;
        $scope.isAdminBlue = true;
        $scope.isAnalyticBlue = true;
        $scope.isAnalyticBlack = false;
        $scope.isInventoryBlack = true;
        $scope.isInventoryBlue = false;
        $scope.isIpdBlack = false;
        $scope.isIpdBlue = true;
        $scope.isMainAdminBlue = true;
        $scope.isMainAdminBlack = false;
    }

    function adminSection() {
        $scope.isPatientBlack = false;
        $scope.isPatientBlue = true;
        $scope.isBillBlue = true;
        $scope.isBillBlack = false;
        $scope.isAdminBlack = true;
        $scope.isAdminBlue = false;
        $scope.isAnalyticBlue = true;
        $scope.isAnalyticBlack = false;
        $scope.isInventoryBlack = false;
        $scope.isInventoryBlue = true;
        $scope.isIpdBlack = false;
        $scope.isIpdBlue = true;
        $scope.isMainAdminBlue = true;
        $scope.isMainAdminBlack = false;
    }

    function analyticSection() {
        $scope.isPatientBlack = false;
        $scope.isPatientBlue = true;
        $scope.isBillBlue = true;
        $scope.isBillBlack = false;
        $scope.isAdminBlack = false;
        $scope.isAdminBlue = true;
        $scope.isAnalyticBlue = false;
        $scope.isAnalyticBlack = true;
        $scope.isInventoryBlack = false;
        $scope.isInventoryBlue = true;
        $scope.isIpdBlack = false;
        $scope.isIpdBlue = true;
        $scope.isMainAdminBlue = true;
        $scope.isMainAdminBlack = false;
    }

    function ipdSection() {
        $scope.isPatientBlack = false;
        $scope.isPatientBlue = true;
        $scope.isBillBlue = true;
        $scope.isBillBlack = false;
        $scope.isAdminBlack = false;
        $scope.isAdminBlue = true;
        $scope.isAnalyticBlue = true;
        $scope.isAnalyticBlack = false;
        $scope.isInventoryBlack = false;
        $scope.isInventoryBlue = true;
        $scope.isIpdBlack = true;
        $scope.isIpdBlue = false;
        $scope.isMainAdminBlue = true;
        $scope.isMainAdminBlack = false;
    }

    function mainAdminSection() {
        $scope.isPatientBlack = false;
        $scope.isPatientBlue = true;
        $scope.isBillBlue = true;
        $scope.isBillBlack = false;
        $scope.isAdminBlack = false;
        $scope.isAdminBlue = true;
        $scope.isAnalyticBlue = true;
        $scope.isAnalyticBlack = false;
        $scope.isInventoryBlack = false;
        $scope.isInventoryBlue = true;
        $scope.isIpdBlack = false;
        $scope.isIpdBlue = true;
        $scope.isMainAdminBlue = false;
        $scope.isMainAdminBlack = true;
    }
}]);
