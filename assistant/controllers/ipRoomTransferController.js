angular.module('personalAssistant').controller('ipRoomTransferController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var ipRoom = this;

    angular.element("#inputRoomIpDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });

    ipRoom.mytime = new Date();
    ipRoom.hstep = 1;
    ipRoom.mstep = 1;
    ipRoom.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };
    ipRoom.ismeridian = true;
}]);
