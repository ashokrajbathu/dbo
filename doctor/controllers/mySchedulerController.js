angular.module('doctor').controller('mySchedulerController', mySchedulerController);
mySchedulerController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function mySchedulerController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    sessionStorage.setItem('currentDoctorState', 'myScheduler');

    var scheduler = this;
    $log.log('in my scheduler');

    scheduler.name = 'my scheduler';
    scheduler.view = true;
};
