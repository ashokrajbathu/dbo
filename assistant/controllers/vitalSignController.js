angular.module('personalAssistant').controller('vitalSignController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    angular.element("#inputVitalDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });

    var vitalSign = this;
    vitalSign.mytime = new Date();
    vitalSign.myOutputTime = new Date();

    vitalSign.hstep = 1;
    vitalSign.mstep = 1;
    vitalSign.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };
    vitalSign.ismeridian = true;
}]);
