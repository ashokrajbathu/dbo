angular.module('doctor').controller('doctorHomeController', doctorHomeController);
doctorHomeController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function doctorHomeController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    var doctorHome = this;
    doctorHome.logoutFromDoctor = logoutFromDoctor;
    var doctorActive = localStorage.getItem('currentDoctor');
    doctorActive = angular.fromJson(doctorActive);
    doctorHome.doctorName = '';

    getDoctorName();

    function getDoctorName() {
        if (_.isEmpty(doctorActive)) {
            localStorage.clear();
            localStorage.setItem('isLoggedInDoctor', 'false');
        } else {
            if (_.has(doctorActive, 'firstName')) {
                doctorHome.doctorName = 'Dr.' + doctorActive.firstName;
            }
            if (_.has(doctorActive, 'speciality')) {
                doctorHome.doctorName += ',' + doctorActive.speciality;
            }
        }
    }

    var currentActiveState = localStorage.getItem('currentDoctorState');
    switch (currentActiveState) {
        case 'drugPrescriptions':
            $state.go('doctorHome.drugPrescription');
            break;
        case 'myPrescriptions':
            $state.go('doctorHome.myPrescriptions');
            break;
        case 'myPatients':
            $state.go('doctorHome.myPatients');
            break;
        case 'myScheduler':
            $state.go('doctorHome.myScheduler');
            break;
        case 'referDbotica':
            $state.go('doctorHome.referDbotica');
            break;
        case 'settings':
            angular.element('#settingsDropdownContents').addClass('menu-open');
            $state.go('doctorHome.settings');
            break;
        case 'doctorProfile':
            $state.go('doctorHome.doctorProfile');
            break;
        case 'prescriptionReport':
            $state.go('doctorHome.prescriptionReport');
            break;
    }

    function logoutFromDoctor() {
        var logoutPromise = doctorServices.logout();
        logoutPromise.then(function(logoutSuccess) {
            localStorage.clear();
            localStorage.setItem("isLoggedInDoctor", "false");
            $state.go('login');
        }, function(errorResponse) {
            localStorage.clear();
            localStorage.setItem("isLoggedInDoctor", "false");
            $state.go('login');
        });
    }
};
