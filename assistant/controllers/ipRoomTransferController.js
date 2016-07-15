angular.module('personalAssistant').controller('ipRoomTransferController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var ipRoom = this;

    ipRoom.transferPatient = transferPatient;

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
    ipRoom.bedsToBeDisplayed = [];
    ipRoom.roomsToBeDisplayedList = [];
    ipRoom.roomCategoriesToBeDisplayed = [];

    var organizationId = localStorage.getItem('orgId');

    var roomsPromise = dboticaServices.getRooms(organizationId);
    roomsPromise.then(function(roomsSuccess) {
        var errorCode = roomsSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var roomsSuccessResponse = angular.fromJson(roomsSuccess.data.response);
            ipRoom.roomsToBeDisplayedList = _.filter(roomsSuccessResponse, function(entity) {
                return entity.state == 'ACTIVE';
            });
        }
        $log.log('rooms to be displayed are----', ipRoom.roomsToBeDisplayedList);
    }, function(roomsError) {
        dboticaServices.noConnectivityError();
    });

    var getRoomCategoryPromise = dboticaServices.getRoomCategories(organizationId);
    getRoomCategoryPromise.then(function(roomCategoriesSuccess) {
        var errorCode = roomCategoriesSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            roomCategoriesSuccessResponse = angular.fromJson(roomCategoriesSuccess.data.response);
            ipRoom.roomCategoriesToBeDisplayed = _.filter(roomCategoriesSuccessResponse, function(entity) {
                return entity.state == 'ACTIVE';
            });
        }
        $log.log('room categories to be displayed are---', ipRoom.roomCategoriesToBeDisplayed);
    }, function(roomCategoriesError) {
        dboticaServices.noConnectivityError();
    });

    var bedsInRoomPromise = dboticaServices.getBeds(organizationId);
    bedsInRoomPromise.then(function(bedInRoomSuccess) {
        var errorCode = bedInRoomSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            bedInRoomSuccessResponse = angular.fromJson(bedInRoomSuccess.data.response);
            ipRoom.bedsToBeDisplayed = _.filter(bedInRoomSuccessResponse, function(entity) {
                return entity.state == 'ACTIVE';
            });
        }
        $log.log('beds list to be displayed are---', ipRoom.bedsToBeDisplayed);
    }, function(bedInRoomError) {
        dboticaServices.noConnectivityError();
    });
}]);
