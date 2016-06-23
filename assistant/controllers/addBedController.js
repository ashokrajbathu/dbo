angular.module('personalAssistant').controller('bedController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var bedElement = this;

    bedElement.addNewBed = addNewBed;

    bedElement.addNew = {};
    bedElement.addNew.bedStatus = 'VACANT';

    var organizationId = localStorage.getItem('orgId');

    var roomsInBedPromise = dboticaServices.getRooms(organizationId);
    roomsInBedPromise.then(function(roomsInBedSuccess) {
        var errorCode = roomsInBedSuccess.data.errorCode;
    }, function(roomsInBedError) {

    });

    function addNewBed() {
        $log.log('bed status is----', bedElement.addNew.bedStatus);
    }
}]);
