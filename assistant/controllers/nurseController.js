angular.module('personalAssistant').controller('nurseController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    $log.log('in nurse controller----');
    localStorage.setItem('currentState', 'nurseHome');
}]);
