angular.module('doctor').controller('myPrescriptionsController', myPrescriptionsController);
myPrescriptionsController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function myPrescriptionsController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'myPrescriptions');
    var myPrescription = this;
    try {
        openDb(getAllPrescriptions);
    } catch (e) {}
    var phoneNumber;
    $scope.prescriptionsList = [];
    var activeDoctor = {};
    $scope.itemsPerPage = 10;
    $scope.currentPage = 1;
    var entitiesArray = [];
    var displayArray = [];
    $scope.prescriptionsToBeDisplayed = [];

    activeDoctor = localStorage.getItem('currentDoctor');
    activeDoctor = angular.fromJson(activeDoctor);

    if (_.isEmpty(activeDoctor)) {
        localStorage.clear();
        localStorage.setItem("isLoggedInDoctor", "false");
        $state.go('login');
    }

    function getAllPrescriptions() {
        if (phoneNumber) {} else {
            $scope.$apply();
            getAllPrescriptionsFromIndexedDBOnLoad(addPrescriptionToArray, transferArrayToTable);
        }
    }

    function addPrescriptionToArray(prescriptionEntity) {
        $scope.$apply();
        $scope.prescriptionsToBeDisplayed.push(prescriptionEntity);
    }

    function transferArrayToTable() {
        $scope.$apply();
        angular.copy($scope.prescriptionsToBeDisplayed, entitiesArray);
        $scope.totalItems = entitiesArray.length;
        displayArray = _.chunk(entitiesArray, $scope.itemsPerPage);
        angular.copy(displayArray[0], $scope.prescriptionsToBeDisplayed);
    }

    $scope.pageChanged = function() {
        var requiredIndex = $scope.currentPage - 1;
        displayArray = [];
        $scope.prescriptionsToBeDisplayed = [];
        displayArray = _.chunk(entitiesArray, $scope.itemsPerPage);
        $log.log('dispali array is---', displayArray);
        angular.copy(displayArray[requiredIndex], $scope.prescriptionsToBeDisplayed);
    }
};
