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

    roomElement.sortTypeOne = 'roomNo';
    roomElement.sortTypeTwo = 'bedCount';
    roomElement.sortTypeThree = 'floorNo';

    var entitiesArray = [];
    entitiesArrayFlag = parseInt(0);

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
                    roomElement.roomsList.push(roomEntity);
                }
            });
            angular.copy(roomElement.roomsList, entitiesArray);
        }
    }, function(getRoomsErrorResponse) {
        dboticaServices.noConnectivityError();
    });

    function addNewRoomFunction() {
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
                    if (roomItemId == '' && roomItemIndex == '') {
                        roomElement.roomsList.unshift(addroomSuccess);
                        entitiesArray.unshift(addroomSuccess);
                    } else {
                        roomElement.roomsList.splice(roomItemIndex, 1, addroomSuccess);
                        var localEntityIndex;
                        for (entityIndex in entitiesArray) {
                            if (entitiesArray[entityIndex].id == addroomSuccess.id) {
                                localEntityIndex = entityIndex;
                                break;
                            } else {
                                continue;
                            }
                        }
                        entitiesArray.splice(localEntityIndex, 1, addroomSuccess);
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
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover the Room Details!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, function() {
            room.state = 'INACTIVE';
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
                        var localEntityIndex;
                        for (entityIndex in entitiesArray) {
                            if (entitiesArray[entityIndex].id == room.id) {
                                localEntityIndex = entityIndex;
                                break;
                            } else {
                                continue;
                            }
                        }
                        entitiesArray.splice(localEntityIndex, 1);
                    }
                }
            }, function(deleteRoomCategoryError) {
                dboticaServices.noConnectivityError();
            });
            swal("Deleted!", "Room Details has been deleted.", "success");
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
        var searchStringLength = roomElement.inputItemSearch.length;
        if (searchStringLength >= parseInt(3)) {
            var searchDisplayArrayInTable = [];
            if (roomElement.inputItemSearch !== '' && roomElement.inputItemSearch !== undefined) {
                if (searchStringLength > entitiesArrayFlag) {
                    angular.copy(roomElement.roomsList, searchDisplayArrayInTable);
                } else {
                    angular.copy(entitiesArray, searchDisplayArrayInTable);
                }
                var sortedItemsArray = [];
                angular.forEach(roomElement.roomsList, function(roomInList) {
                    if (roomInList.state == 'ACTIVE') {
                        var checkRoomNo = roomInList.roomNo.toLowerCase().indexOf(roomElement.inputItemSearch.toLowerCase()) > -1;
                        var checkTotalBeds = roomInList.bedCount.toLowerCase().indexOf(roomElement.inputItemSearch.toLowerCase()) > -1;
                        var checkFloor = roomInList.floorNo.toLowerCase().indexOf(roomElement.inputItemSearch.toLowerCase()) > -1;
                        var checkroomTypeName = roomInList.organizationRoomCategory.roomType.toLowerCase().indexOf(roomElement.inputItemSearch.toLowerCase()) > -1;
                        var check = checkRoomNo || checkTotalBeds || checkFloor || checkroomTypeName;
                        if (check) {
                            sortedItemsArray.push(roomInList);
                        }
                    }
                });
                angular.copy(sortedItemsArray, roomElement.roomsList);
                entitiesArrayFlag = roomElement.inputItemSearch.length;
            }
        }
        if (searchStringLength <= parseInt(2)) {
            entitiesArrayFlag = parseInt(0);
            angular.copy(entitiesArray, roomElement.roomsList);
        }
    }
}]);
