angular.module('personalAssistant').controller('progressNoteController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    angular.element("#inputNoteDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });
}]);
