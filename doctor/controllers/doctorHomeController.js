angular.module('doctor').controller('doctorHomeController', doctorHomeController);
doctorHomeController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function doctorHomeController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    var doctorHome = this;

    doctorHome.toggleSideBar = toggleSideBar;
    doctorHome.logoutFromDoctor = logoutFromDoctor;

    doctorHome.sideBar = true;


    var doctorActive = localStorage.getItem('currentDoctor');
    doctorActive = angular.fromJson(doctorActive);
    doctorHome.doctorName = '';
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


    function toggleSideBar() {
        doctorHome.sideBar = !doctorHome.sideBar;
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
