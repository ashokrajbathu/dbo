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
    roomElement.pageChanged = pageChanged;

    var roomItemId = '';
    var roomItemIndex = '';
    roomElement.inputItemSearch = '';

    roomElement.sortTypeOne = 'roomNo';
    roomElement.sortTypeTwo = 'bedCount';
    roomElement.sortTypeThree = 'floorNo';

    var entitiesArray = [];
    entitiesArrayFlag = parseInt(0);

    roomElement.currentPage = 1;
    roomElement.itemsPerPage = 3;
    var displayArray = [];
    var sortedItemsArrayOnPageChange = [];

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
            roomElement.roomsList = _.filter(roomsListFromAPI, function(entity) {
                return entity.state == 'ACTIVE';
            });
            roomElement.totalItems = roomElement.roomsList.length;
            angular.copy(roomElement.roomsList, entitiesArray);
            displayArray = _.chunk(entitiesArray, roomElement.itemsPerPage);
            angular.copy(displayArray[0], roomElement.roomsList);
        }
    }, function(getRoomsErrorResponse) {
        dboticaServices.noConnectivityError();
    });

    function addNewRoomFunction() {
        if (roomItemId == '' && roomItemIndex == '') {
            roomElement.addNewRoom.organizationId = organizationId;
        }
        roomElement.addNewRoom.roomRate = parseInt(roomElement.addNewRoom.roomRate) * 100;
        roomElement.addNewRoom.bedCount = 0;
        roomElement.addNewRoom.maxBedCount = 0;
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
                        if (roomElement.roomsList.length < roomElement.itemsPerPage) {
                            roomElement.roomsList.unshift(addroomSuccess);
                            entitiesArray.push(addroomSuccess);
                        } else {
                            if (displayArray.length == roomElement.currentPage || displayArray.length == parseInt(1)) {
                                roomElement.roomsList = [];
                                roomElement.currentPage = roomElement.currentPage + 1;
                                roomElement.roomsList.unshift(addroomSuccess);
                            }
                            entitiesArray.unshift(addroomSuccess);
                            if (roomElement.roomsList.length == roomElement.itemsPerPage && displayArray.length !== parseInt(1)) {
                                roomElement.currentPage = 1;
                                displayArray = _.chunk(entitiesArray, roomElement.itemsPerPage);
                                angular.copy(displayArray[0], roomElement.roomsList);
                            }
                        }
                        displayArray = _.chunk(entitiesArray, roomElement.itemsPerPage);
                        roomElement.totalItems = entitiesArray.length;
                    } else {
                        roomElement.roomsList.splice(roomItemIndex, 1, addroomSuccess);
                        var localEntityIndex = _.findLastIndex(entitiesArray, function(entity) {
                            return entity.id == addroomSuccess.id;
                        });
                        entitiesArray.splice(localEntityIndex, 1, addroomSuccess);
                        displayArray = _.chunk(entitiesArray, roomElement.itemsPerPage);
                        roomElement.totalItems = entitiesArray.length;
                        roomItemId = '';
                        roomItemIndex = '';
                    }
                }
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
                    if (deleteRoomSuccess.data.errorCode == null && deleteRoomSuccess.data.success == true) {
                        dboticaServices.deleteRoomSuccessSwal();
                        roomElement.roomsList.splice(index, 1);
                        var localEntityIndex = _.findLastIndex(entitiesArray, function(entity) {
                            return entity.id == room.id;
                        });
                        entitiesArray.splice(localEntityIndex, 1);
                        roomElement.totalItems = entitiesArray.length;
                        displayArray = _.chunk(entitiesArray, roomElement.itemsPerPage);
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
        newRoomObject.organizationId = organizationId;
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
                        /*var checkTotalBeds = roomInList.bedCount.toLowerCase().indexOf(roomElement.inputItemSearch.toLowerCase()) > -1;*/
                        var checkFloor = roomInList.floorNo.toLowerCase().indexOf(roomElement.inputItemSearch.toLowerCase()) > -1;
                        var checkroomTypeName = roomInList.organizationRoomCategory.roomType.toLowerCase().indexOf(roomElement.inputItemSearch.toLowerCase()) > -1;
                        /*var check = checkRoomNo || checkTotalBeds || checkFloor || checkroomTypeName;*/
                        var check = checkRoomNo || checkFloor || checkroomTypeName;
                        if (check) {
                            sortedItemsArray.push(roomInList);
                        }
                    }
                });
                roomElement.totalItems = sortedItemsArray.length;
                roomElement.currentPage = 1;
                angular.copy(sortedItemsArray, sortedItemsArrayOnPageChange);
                displayArray = _.chunk(sortedItemsArray, roomElement.itemsPerPage);
                angular.copy(displayArray[0], roomElement.roomsList);
                entitiesArrayFlag = roomElement.inputItemSearch.length;
            }
        }
        if (searchStringLength <= parseInt(2)) {
            entitiesArrayFlag = parseInt(0);
            roomElement.totalItems = entitiesArray.length;
            roomElement.currentPage = 1;
            displayArray = _.chunk(entitiesArray, roomElement.itemsPerPage);
            angular.copy(displayArray[0], roomElement.roomsList);
        }
    }

    function pageChanged() {
        var requiredIndex = roomElement.currentPage - 1;
        var localArray = [];
        displayArray = [];
        if (roomElement.inputItemSearch.length >= parseInt(3)) {
            displayArray = _.chunk(sortedItemsArrayOnPageChange, roomElement.itemsPerPage);
        } else {
            sortedItemsArrayOnPageChange = [];
            displayArray = _.chunk(entitiesArray, roomElement.itemsPerPage);
        }
        localArray = displayArray[requiredIndex];
        angular.copy(localArray, roomElement.roomsList);
    }
}]);
