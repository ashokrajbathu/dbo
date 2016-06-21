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
            totalRoomCategories = $.parseJSON(getRoomCategoriesSuccess.data.response);
            for (var roomCategoryIndexOnLoad in totalRoomCategories) {
                if (totalRoomCategories[roomCategoryIndexOnLoad].state == 'ACTIVE') {
                    roomCategoryElement.activeRoomCategories.push(totalRoomCategories[roomCategoryIndexOnLoad]);
                } else {
                    continue;
                }
            }
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
                var addOrUpdateSuccessResponse = $.parseJSON(addOrUpdateSuccess.data.response);
                $log.log("room category response is---", addOrUpdateSuccessResponse);
                if (addOrUpdateSuccess.data.errorCode == null && addOrUpdateSuccess.data.success == true) {
                    dboticaServices.roomCategorySuccessSwal();
                    if (roomCategoryItemId == '' && roomCategoryItemIndex == '') {
                        roomCategoryElement.activeRoomCategories.unshift(addOrUpdateSuccessResponse);
                    } else {
                        roomCategoryElement.activeRoomCategories.splice(roomCategoryItemIndex, 1, addOrUpdateSuccessResponse);
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
        roomCategory.state = "INACTIVE";
        var deleteRoomCategoryPromise = dboticaServices.addOrUpdateRoomCategory(roomCategory);
        deleteRoomCategoryPromise.then(function(deleteRoomCategorySuccess) {
            var errorCode = deleteRoomCategorySuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var deleteRoomSuccess = $.parseJSON(deleteRoomCategorySuccess.data.response);
                $log.log("delete is----", deleteRoomSuccess);
                if (deleteRoomCategorySuccess.data.errorCode == null && deleteRoomCategorySuccess.data.success == true) {
                    dboticaServices.deleteRoomCategorySuccessSwal();
                    roomCategoryElement.activeRoomCategories.splice(index, 1);
                }
            }
        }, function(deleteRoomCategoryError) {
            dboticaServices.noConnectivityError();
        });
    }

    function roomCategorySearch() {
        if (roomCategoryElement.inputItemSearch !== '' && roomCategoryElement.inputItemSearch !== undefined) {
            $log.log("in search -------", roomCategoryElement.inputItemSearch);
            var sortedItemsArray = [];
            for (var roomCategoryIndexInSearch in roomCategoryElement.activeRoomCategories) {
                if (roomCategoryElement.activeRoomCategories[roomCategoryIndexInSearch].state == 'ACTIVE') {
                    var check = roomCategoryElement.activeRoomCategories[roomCategoryIndexInSearch].roomType.toLowerCase().indexOf(roomCategoryElement.inputItemSearch.toLowerCase()) > -1;
                    if (check) {
                        sortedItemsArray.push(roomCategoryElement.activeRoomCategories[roomCategoryIndexInSearch]);
                    }
                }
            }
            angular.copy(sortedItemsArray, roomCategoryElement.activeRoomCategories);
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
