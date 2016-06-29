angular.module('personalAssistant').controller('intakeOutputController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    angular.element("#inputModalDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });
    angular.element("#inputModalOutputDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });

    var intakeOutput = this;
    intakeOutput.mytime = new Date();
    intakeOutput.myOutputTime = new Date();

    intakeOutput.hstep = 1;
    intakeOutput.mstep = 1;
    intakeOutput.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };
    intakeOutput.ismeridian = true;
}]);
