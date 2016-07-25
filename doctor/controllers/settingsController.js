angular.module('doctor').controller('settingsController', settingsController);
settingsController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function settingsController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'settings');
};
