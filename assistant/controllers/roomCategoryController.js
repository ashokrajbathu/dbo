angular.module('personalAssistant').controller('roomCategoryController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', 'NgTableParams', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert, NgTableParams) {
    var roomCategoryElement = this;

    roomCategoryElement.addNewRoomCategory = addNewRoomCategory;
    roomCategoryElement.deleteRoomCategory = deleteRoomCategory;
    roomCategoryElement.roomCategorySearch = roomCategorySearch;
    roomCategoryElement.editRoomCategory = editRoomCategory;


    roomCategoryElement.newRoomCategory = {};
    roomCategoryElement.activeRoomCategories = [];
    roomCategoryElement.inputItemSearch = '';
    var roomCategoryItemId = '';
    var roomCategoryItemIndex = '';

    roomCategoryElement.sortTypeOne = 'roomType';
    roomCategoryElement.sortTypeTwo = 'description';

    var entitiesArray = [];
    var entitiesArrayFlag = parseInt(0);
    /*roomCategoryElement.tableParams = new NgTableParams({
        page: 1,
        count: 2,
    }, {
        total: roomCategoryElement.activeRoomCategories.length,
        getData: function($defer, params) {
            $scope.data = $scope.users.slice((params.page() - 1) * params.count(), params.page() * params.count());
            $defer.resolve($scope.data);
        }
    });*/
    var organizationId = localStorage.getItem('orgId');
    var getRoomCategoryPromise = dboticaServices.getRoomCategories(organizationId);
    getRoomCategoryPromise.then(function(getRoomCategoriesSuccess) {
        var errorCode = getRoomCategoriesSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var totalRoomCategories = [];
            totalRoomCategories = angular.fromJson(getRoomCategoriesSuccess.data.response);
            for (var roomCategoryIndexOnLoad in totalRoomCategories) {
                if (totalRoomCategories[roomCategoryIndexOnLoad].state == 'ACTIVE') {
                    roomCategoryElement.activeRoomCategories.push(totalRoomCategories[roomCategoryIndexOnLoad]);
                } else {
                    continue;
                }
            }
            angular.copy(roomCategoryElement.activeRoomCategories, entitiesArray);
            $log.log("categories are-----", roomCategoryElement.activeRoomCategories);
        }
    }, function(getRoomCategoriesError) {
        dboticaServices.noConnectivityError();
    });

    function addNewRoomCategory() {
        if (roomCategoryItemId == '' && roomCategoryItemIndex == '') {
            roomCategoryElement.newRoomCategory.organizationId = organizationId;
        }
        roomCategoryElement.newRoomCategory.price = parseInt(roomCategoryElement.newRoomCategory.price) * 100;
        var addOrUpdateRoomCategoryPromise = dboticaServices.addOrUpdateRoomCategory(roomCategoryElement.newRoomCategory);
        addOrUpdateRoomCategoryPromise.then(function(addOrUpdateSuccess) {
            var errorCode = addOrUpdateSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var addOrUpdateSuccessResponse = angular.fromJson(addOrUpdateSuccess.data.response);
                $log.log("room category response is---", addOrUpdateSuccessResponse);
                if (addOrUpdateSuccess.data.errorCode == null && addOrUpdateSuccess.data.success == true) {
                    dboticaServices.roomCategorySuccessSwal();
                    if (roomCategoryItemId == '' && roomCategoryItemIndex == '') {
                        roomCategoryElement.activeRoomCategories.unshift(addOrUpdateSuccessResponse);
                        entitiesArray.unshift(addOrUpdateSuccessResponse);
                    } else {
                        roomCategoryElement.activeRoomCategories.splice(roomCategoryItemIndex, 1, addOrUpdateSuccessResponse);
                        var indexLocal;
                        for (var entityArrayIndex in entitiesArray) {
                            if (entitiesArray[entityArrayIndex].id == addOrUpdateSuccessResponse.id) {
                                indexLocal = entityArrayIndex;
                                break;
                            } else {
                                continue;
                            }
                        }
                        entitiesArray.splice(indexLocal, 1, addOrUpdateSuccessResponse);
                        roomCategoryItemId = '';
                        roomCategoryItemIndex = '';
                    }
                }
            }
        }, function(addOrUpdateError) {
            dboticaServices.noConnectivityError();
        });
        roomCategoryElement.newRoomCategory = {};
    }

    function deleteRoomCategory(roomCategory, index) {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover the room category details!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, function() {
            roomCategory.state = "INACTIVE";
            var deleteRoomCategoryPromise = dboticaServices.addOrUpdateRoomCategory(roomCategory);
            deleteRoomCategoryPromise.then(function(deleteRoomCategorySuccess) {
                var errorCode = deleteRoomCategorySuccess.data.errorCode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var deleteRoomSuccess = angular.fromJson(deleteRoomCategorySuccess.data.response);
                    $log.log("delete is----", deleteRoomSuccess);
                    if (deleteRoomCategorySuccess.data.errorCode == null && deleteRoomCategorySuccess.data.success == true) {
                        dboticaServices.deleteRoomCategorySuccessSwal();
                        roomCategoryElement.activeRoomCategories.splice(index, 1);
                        var deleteIndex;
                        for (var deleteEntityIndex in entitiesArray) {
                            if (entitiesArray[deleteEntityIndex].id == roomCategory.id) {
                                deleteIndex = deleteEntityIndex;
                                break;
                            } else {
                                continue;
                            }
                        }
                        entitiesArray.splice(deleteIndex, 1);
                    }
                }
            }, function(deleteRoomCategoryError) {
                dboticaServices.noConnectivityError();
            });
            swal("Deleted!", "Room Category Details has been deleted.", "success");
        });
    }

    function roomCategorySearch() {
        var searchStringLength = roomCategoryElement.inputItemSearch.length;
        if (searchStringLength >= parseInt(3)) {
            var searchDisplayArrayInTable = [];
            if (roomCategoryElement.inputItemSearch !== '' && roomCategoryElement.inputItemSearch !== undefined) {
                if (searchStringLength > entitiesArrayFlag) {
                    angular.copy(roomCategoryElement.activeRoomCategories, searchDisplayArrayInTable);
                } else {
                    angular.copy(entitiesArray, searchDisplayArrayInTable);
                }
                var sortedItemsArray = [];
                angular.forEach(searchDisplayArrayInTable, function(activeRoom) {
                    if (activeRoom.state == 'ACTIVE') {
                        var checkRoomType = activeRoom.roomType.toLowerCase().indexOf(roomCategoryElement.inputItemSearch.toLowerCase()) > -1;
                        var descriptionCheck = activeRoom.description.toLowerCase().indexOf(roomCategoryElement.inputItemSearch.toLowerCase()) > -1;
                        var check = checkRoomType || descriptionCheck;
                        if (check) {
                            sortedItemsArray.push(activeRoom);
                        }
                    }
                });
                angular.copy(sortedItemsArray, roomCategoryElement.activeRoomCategories);
                entitiesArrayFlag = roomCategoryElement.inputItemSearch.length;
            }
        }
        if (searchStringLength <= parseInt(2)) {
            entitiesArrayFlag = parseInt(0);
            angular.copy(entitiesArray, roomCategoryElement.activeRoomCategories);
        }
    }

    function editRoomCategory(roomCategoryItem, index) {
        roomCategoryItemId = '';
        roomCategoryItemIndex = '';
        roomCategoryItemId = roomCategoryItem.id;
        roomCategoryItemIndex = index;
        roomCategoryItem.price = parseInt(roomCategoryItem.price) / 100;
        angular.copy(roomCategoryItem, roomCategoryElement.newRoomCategory);
    }

}]);
