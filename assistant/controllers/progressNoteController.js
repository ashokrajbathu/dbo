angular.module('personalAssistant').controller('progressNoteController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    angular.element("#inputNoteDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });

    var note = this;
    note.mytime = new Date();
    note.hstep = 1;
    note.mstep = 1;
    note.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };
    note.ismeridian = true;

    note.newNote = {};
}]);
