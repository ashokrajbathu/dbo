angular.module('personalAssistant').controller('roomController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var roomElement = this;

    roomElement.roomCategories = [];
    roomElement.addNewRoom = {};
    roomElement.roomType = '';
    roomElement.roomsList = [];

    roomElement.addNewRoomFunction = addNewRoomFunction;
    roomElement.categorySelect = categorySelect;
    roomElement.deleteRoom = deleteRoom;
    roomElement.editRoom = editRoom;
    roomElement.roomSearch = roomSearch;

    var roomItemId = '';
    var roomItemIndex = '';
    roomElement.inputItemSearch = '';

    var organizationId = localStorage.getItem('orgId');
    var roomCategoriesPromise = dboticaServices.getRoomCategories(organizationId);
    roomCategoriesPromise.then(function(roomCategoriesSuccess) {
        var errorCode = roomCategoriesSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var roomCategoriesList = angular.fromJson(roomCategoriesSuccess.data.response);
            angular.forEach(roomCategoriesList, function(roomCategoryEntity) {
                if (roomCategoryEntity.state == 'ACTIVE') {
                    roomElement.roomCategories.push(roomCategoryEntity);
                }
            });
            roomElement.roomType = roomElement.roomCategories[0].roomType;
            roomElement.addNewRoom.organizationRoomCategoryId = roomElement.roomCategories[0].id;
        }
    }, function(roomCategoriesError) {
        dboticaServices.noConnectivityError();
    });

    var getRoomsPromise = dboticaServices.getRooms(organizationId);
    getRoomsPromise.then(function(getRoomsSuccessResponse) {
        var errorCode = getRoomsSuccessResponse.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var roomsListFromAPI = angular.fromJson(getRoomsSuccessResponse.data.response);
            $log.log("room list----", roomsListFromAPI);
            angular.forEach(roomsListFromAPI, function(roomEntity) {
                if (roomEntity.state == 'ACTIVE') {
                    roomEntity.roomTypeName = getRoomTypeFromItsId(roomEntity.organizationRoomCategoryId);
                    roomElement.roomsList.push(roomEntity);
                }
            });
        }
    }, function(getRoomsErrorResponse) {
        dboticaServices.noConnectivityError();
    });

    function addNewRoomFunction() {
        if (roomElement.addNewRoom.hasOwnProperty('roomTypeName')) {
            delete roomElement.addNewRoom.roomTypeName;
        }
        if (roomItemId == '' && roomItemIndex == '') {
            roomElement.addNewRoom.organizationId = organizationId;
        }
        roomElement.addNewRoom.roomRate = parseInt(roomElement.addNewRoom.roomRate) * 100;
        $log.log("add new room is------", roomElement.addNewRoom);
        var addNewRoomPromise = dboticaServices.addOrUpdateRoom(roomElement.addNewRoom);
        addNewRoomPromise.then(function(addNewRoomSuccess) {
            var errorCode = addNewRoomSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var addroomSuccess = angular.fromJson(addNewRoomSuccess.data.response);
                if (errorCode == null && addNewRoomSuccess.data.success == true) {
                    dboticaServices.addNewRoomSuccessSwal();
                    addroomSuccess.roomTypeName = getRoomTypeFromItsId(addroomSuccess.organizationRoomCategoryId);
                    if (roomItemId == '' && roomItemIndex == '') {
                        roomElement.roomsList.unshift(addroomSuccess);
                    } else {
                        roomElement.roomsList.splice(roomItemIndex, 1, addroomSuccess);
                        roomItemId = '';
                        roomItemIndex = '';
                    }
                }
                $log.log("add room success is---", addroomSuccess);
            }
        }, function(addNewRoomError) {
            dboticaServices.noConnectivityError();
        });
        roomElement.addNewRoom = {};
    }

    function categorySelect(roomCategory) {
        roomElement.roomType = roomCategory.roomType;
        roomElement.addNewRoom.organizationRoomCategoryId = roomCategory.id;
    }

    function deleteRoom(room, index) {
        room.state = 'INACTIVE';
        delete room.roomTypeName;
        var deleteRoomPromise = dboticaServices.addOrUpdateRoom(room);
        deleteRoomPromise.then(function(deleteRoomSuccess) {
            var errorCode = deleteRoomSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var deleteRoomSuccessEntity = angular.fromJson(deleteRoomSuccess.data.response);
                $log.log("delete is----", deleteRoomSuccessEntity);
                if (deleteRoomSuccess.data.errorCode == null && deleteRoomSuccess.data.success == true) {
                    dboticaServices.deleteRoomSuccessSwal();
                    roomElement.roomsList.splice(index, 1);
                }
            }
        }, function(deleteRoomCategoryError) {
            dboticaServices.noConnectivityError();
        });

    }

    function editRoom(room, index) {
        roomItemId = '';
        roomItemIndex = '';
        roomItemId = room.id;
        roomItemIndex = index;
        var newRoomObject = {};
        angular.copy(room, newRoomObject);
        newRoomObject.roomRate = parseInt(newRoomObject.roomRate) / 100;
        angular.forEach(roomElement.roomCategories, function(roomCategoryEntityItem) {
            if (roomCategoryEntityItem.id == newRoomObject.organizationRoomCategoryId) {
                roomElement.roomType = roomCategoryEntityItem.roomType;
            }
        });
        angular.copy(newRoomObject, roomElement.addNewRoom);
    }

    function roomSearch() {
        if (roomElement.inputItemSearch !== '' && roomElement.inputItemSearch !== undefined) {
            var sortedItemsArray = [];
            angular.forEach(roomElement.roomsList, function(roomInList) {
                if (roomInList.state == 'ACTIVE') {
                    var check = roomInList.roomNo.toLowerCase().indexOf(roomElement.inputItemSearch.toLowerCase()) > -1;
                    if (check) {
                        sortedItemsArray.push(roomInList);
                    }
                }
            });
            angular.copy(sortedItemsArray, roomElement.roomsList);
        }
    }

    var getRoomTypeFromItsId = function(roomTypeId) {
        var roomTypeInFunction = '';
        angular.forEach(roomElement.roomCategories, function(roomTypeEntity) {
            if (roomTypeEntity.id == roomTypeId) {
                roomTypeInFunction = roomTypeEntity.roomType;
            }
        });
        return roomTypeInFunction;
    }
}]);

