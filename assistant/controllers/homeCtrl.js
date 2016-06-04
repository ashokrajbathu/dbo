angular.module('personalAssistant').controller('homeCtrl', ['$scope', '$log', '$location', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, $location, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {

    var currentStateActive = localStorage.getItem("currentState");
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
    }
}]);
