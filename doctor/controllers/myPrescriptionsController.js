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
    $scope.itemsPerPage = 8;
    $scope.currentPage = 1;
    $scope.maxSize = 8;
    var entitiesArray = [];
    var displayArray = [];
    var allPrescriptions = true;
    $scope.paginationOfPrescriptions = false;
    myPrescription.viewAllPrescriptions = false;
    var allPrescriptionsArray = [];
    myPrescription.prescriptionSearch = {};
    $scope.prescriptionsToBeDisplayed = [];
    myPrescription.prescriptionToBeDisplayed = {};
    myPrescription.hyphen = ' -';
    myPrescription.prescriptionSearch.fromDate = '';
    myPrescription.prescriptionSearch.toDate = '';
    myPrescription.prescriptionSearch.phoneNumber = '';

    myPrescription.selectPrescription = selectPrescription;
    myPrescription.searchPrescription = searchPrescription;
    myPrescription.viewAllPrescs = viewAllPrescs;

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

    function totalItemsWatcher() {
        $scope.$watch('entitiesArray', function() {
            $log.log('in watcher---');
            $scope.totalItems = entitiesArray.length;
        });
    }

    function addPrescriptionToArray(prescriptionEntity) {
        $scope.$apply();
        $scope.prescriptionsToBeDisplayed.push(prescriptionEntity);
    }

    function transferArrayToTable() {
        $scope.$apply();
        if (allPrescriptions) {
            angular.copy($scope.prescriptionsToBeDisplayed, allPrescriptionsArray);
        }
        $log.log('prescriptions displayed is----', $scope.prescriptionsToBeDisplayed);
        angular.copy($scope.prescriptionsToBeDisplayed, entitiesArray);
        $log.log('entites array is---', entitiesArray);
        $scope.totalItems = entitiesArray.length;
        totalItemsWatcher();
        $log.log('items length is-----', $scope.totalItems);
        displayArray = _.chunk(entitiesArray, $scope.itemsPerPage);
        angular.copy(displayArray[0], $scope.prescriptionsToBeDisplayed);
    }

    $scope.pageChanged = function() {
        var requiredIndex = $scope.currentPage - 1;
        displayArray = [];
        $scope.prescriptionsToBeDisplayed = [];
        displayArray = _.chunk(entitiesArray, $scope.itemsPerPage);
        angular.copy(displayArray[requiredIndex], $scope.prescriptionsToBeDisplayed);
    }

    function selectPrescription(activePrescription) {
        angular.element('#selectedPrescriptionModal').modal('show');
        angular.copy(activePrescription, myPrescription.prescriptionToBeDisplayed);
    }

    function searchPrescription() {
        myPrescription.viewAllPrescriptions = true;
        var fromDate = myPrescription.prescriptionSearch.fromDate;
        var toDate = myPrescription.prescriptionSearch.toDate;
        var phoneNumber = myPrescription.prescriptionSearch.phoneNumber;
        if (fromDate !== undefined && fromDate !== '') {
            fromDate = doctorServices.getLongValueOfDate(fromDate);
        }
        if (toDate !== undefined && toDate !== '') {
            toDate = doctorServices.getLongValueOfDate(toDate);
        }
        $scope.prescriptionsToBeDisplayed = [];
        entitiesArray = [];
        displayArray = [];
        allPrescriptions = false;
        prescriptionSearchFromIndexedDB(fromDate, toDate, phoneNumber, addPrescriptionToArray, transferArrayToTable);
        $scope.currentPage = 1;
    }

    angular.element("#exampleFromDate").datepicker({
        dateFormat: "dd-mm-yy",
        autoclose: true
    });
    angular.element("#exampleToDate").datepicker({
        dateFormat: "dd-mm-yy",
        autoclose: true
    });

    function viewAllPrescs() {
        angular.copy(allPrescriptionsArray, $scope.prescriptionsToBeDisplayed);
        $scope.totalItems = $scope.prescriptionsToBeDisplayed.length;
        myPrescription.viewAllPrescriptions = false;
        $scope.currentPage = 1;
        allPrescriptions = true;
        myPrescription.prescriptionSearch = {};
    }
};
