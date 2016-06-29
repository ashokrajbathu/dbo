angular.module('personalAssistant').controller('vitalSignController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    angular.element("#inputVitalDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });
}]);
