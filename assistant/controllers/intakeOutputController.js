angular.module('personalAssistant').controller('intakeOutputController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    angular.element("#inputModalDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });
    angular.element("#inputModalOutputDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });

    /*angular.element("#inputIntakeTimepicker").wickedpicker();*/


}]);
