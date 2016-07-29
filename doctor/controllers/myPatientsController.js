angular.module('doctor').controller('myPatientsController', myPatientsController);
myPatientsController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function myPatientsController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'myPatients');

    var activeDoctor = {};
    var patient = this;

    patient.hyphen = '-';
    patient.patientsToBeDisplayed = [];
    var entitiesArray = [];
    var displayArray = [];
    patient.itemsPerPage = 10;
    patient.currentPage = 1;
    patient.maxSize = 8;

    patient.pageChanged = pageChanged;

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
            $log.log('all patients response is----', allPatientsResponse);
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

};
