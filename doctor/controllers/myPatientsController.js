angular.module('doctor').controller('myPatientsController', myPatientsController);
myPatientsController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function myPatientsController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'myPatients');

    var activeDoctor = {};
    var patient = this;

    patient.hyphen = '-';
    patient.patientsToBeDisplayed = [];
    var entitiesArray = [];
    var entitiesArrayInModal = [];
    var displayArray = [];
    var displayArrayInModal = [];
    var watcherIndex = 0;
    patient.itemsPerPage = 10;
    patient.currentPage = 1;
    var entitiesArrayFlag = false;
    patient.maxSize = 8;
    var activePhoneNumber;
    patient.prescriptionsOfThePhoneNumber = [];
    var entitiesArray = [];
    patient.prescriptionsToBeDisplayed = [];
    $scope.patientPrescriptionToBeDisplayed = {};
    patient.hyphen = '-';
    patient.itemsPerPageInModal = 1;
    patient.maxSizeInModal = 5;
    patient.currentPageInModal = 1;
    patient.pageChangedInModal = pageChangedInModal;

    try {
        openDb();
    } catch (e) {}

    patient.pageChanged = pageChanged;
    patient.viewPatientPrescriptions = viewPatientPrescriptions;

    activeDoctor = localStorage.getItem('currentDoctor');
    activeDoctor = angular.fromJson(activeDoctor);

    if (_.isEmpty(activeDoctor)) {
        localStorage.clear();
        localStorage.setItem("isLoggedInDoctor", "false");
        $state.go('login');
    }

    var getMyPatientsPromise = doctorServices.getAllMyPatients();
    getMyPatientsPromise.then(function(getMyPatientsSuccess) {
        var errorCode = getMyPatientsSuccess.data.errorCode;
        if (errorCode) {
            doctorServices.logoutFromThePage(errorCode);
        } else {
            var allPatientsResponse = angular.fromJson(getMyPatientsSuccess.data.response);
            angular.copy(allPatientsResponse, entitiesArray);
            patient.totalItems = entitiesArray.length;
            displayArray = _.chunk(entitiesArray, patient.itemsPerPage);
            angular.copy(displayArray[0], patient.patientsToBeDisplayed);
        }
    }, function(getMyPatientsError) {
        doctorServices.noConnectivityError();
    });

    function pageChanged() {
        var requiredIndex = patient.currentPage - 1;
        displayArray = [];
        patient.patientsToBeDisplayed = [];
        displayArray = _.chunk(entitiesArray, patient.itemsPerPage);
        angular.copy(displayArray[requiredIndex], patient.patientsToBeDisplayed);
    }

    function addPrescriptionToArray(prescriptionEntity) {
        $scope.$apply();
        patient.prescriptionsOfThePhoneNumber.push(prescriptionEntity);
    }

    function prescriptionsWatcher() {
        $scope.$apply();
        entitiesArrayFlag = true;
        $scope.$watch('entitiesArrayFlag', function(newVal, oldVal) {
            angular.copy(displayArrayInModal[watcherIndex][0], $scope.patientPrescriptionToBeDisplayed);
        }, true);
    }

    function transferArrayToTable() {
        $scope.$apply();
        angular.copy(patient.prescriptionsOfThePhoneNumber, entitiesArrayInModal);
        angular.copy(entitiesArrayInModal, patient.prescriptionsToBeDisplayed);
        displayArrayInModal = _.chunk(entitiesArrayInModal, patient.itemsPerPageInModal);
        patient.totalItemsInModal = entitiesArrayInModal.length;
        angular.copy(displayArrayInModal[0][0], $scope.patientPrescriptionToBeDisplayed);
        prescriptionsWatcher();

    }

    function viewPatientPrescriptions(patientEntity, index) {
        angular.element('#patientPrescriptionModal').modal('show');
        entitiesArrayFlag = false;
        entitiesArrayInModal = [];
        displayArrayInModal = [];
        patient.prescriptionsOfThePhoneNumber = [];
        activePhoneNumber = patientEntity.phoneNumber;
        if (!_.isEmpty(activePhoneNumber)) {
            prescriptionSearchFromIndexedDB('', '', activePhoneNumber, addPrescriptionToArray, transferArrayToTable);
        }
    }

    function pageChangedInModal() {
        watcherIndex = patient.currentPageInModal - 1;
        $scope.patientPrescriptionToBeDisplayed = {};
        angular.copy(displayArrayInModal[watcherIndex][0], $scope.patientPrescriptionToBeDisplayed);
        $log.log('after page change is----', $scope.patientPrescriptionToBeDisplayed);
    }

};
