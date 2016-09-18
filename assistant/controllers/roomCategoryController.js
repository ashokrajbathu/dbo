angular.module('personalAssistant').controller('roomCategoryController', roomCategoryController);
roomCategoryController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', 'NgTableParams'];

function roomCategoryController($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert, NgTableParams) {
    var roomCategoryElement = this;

    roomCategoryElement.addNewRoomCategory = addNewRoomCategory;
    roomCategoryElement.deleteRoomCategory = deleteRoomCategory;
    roomCategoryElement.roomCategorySearch = roomCategorySearch;
    roomCategoryElement.editRoomCategory = editRoomCategory;
    roomCategoryElement.pageChanged = pageChanged;


    roomCategoryElement.newRoomCategory = {};
    roomCategoryElement.activeRoomCategories = [];
    roomCategoryElement.inputItemSearch = '';
    var roomCategoryItemId = '';
    var roomCategoryItemIndex = '';

    roomCategoryElement.sortTypeOne = 'roomType';
    roomCategoryElement.sortTypeTwo = 'description';

    var entitiesArray = [];
    var entitiesArrayFlag = parseInt(0);
    var organizationId = localStorage.getItem('orgId');
    roomCategoryElement.currentPage = 1;
    roomCategoryElement.itemsPerPage = 3;
    var displayArray = [];
    var sortedItemsArrayOnPageChange = [];

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);


    var getRoomCategoryPromise = dboticaServices.getRoomCategories(organizationId);
    getRoomCategoryPromise.then(function(getRoomCategoriesSuccess) {
        var errorCode = getRoomCategoriesSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var totalRoomCategories = [];
            totalRoomCategories = angular.fromJson(getRoomCategoriesSuccess.data.response);
            roomCategoryElement.activeRoomCategories = _.filter(totalRoomCategories, function(entity) {
                return entity.state == 'ACTIVE';
            });
            roomCategoryElement.totalItems = roomCategoryElement.activeRoomCategories.length;
            angular.copy(roomCategoryElement.activeRoomCategories, entitiesArray);
            displayArray = _.chunk(entitiesArray, roomCategoryElement.itemsPerPage);
            angular.copy(displayArray[0], roomCategoryElement.activeRoomCategories);
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
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var addOrUpdateSuccessResponse = angular.fromJson(addOrUpdateSuccess.data.response);
                if (addOrUpdateSuccess.data.errorCode == null && addOrUpdateSuccess.data.success == true) {
                    dboticaServices.roomCategorySuccessSwal();
                    if (roomCategoryItemId == '' && roomCategoryItemIndex == '') {
                        if (roomCategoryElement.activeRoomCategories.length < roomCategoryElement.itemsPerPage) {
                            roomCategoryElement.activeRoomCategories.unshift(addOrUpdateSuccessResponse);
                            entitiesArray.push(addOrUpdateSuccessResponse);
                        } else {
                            if (displayArray.length == roomCategoryElement.currentPage || displayArray.length == parseInt(1)) {
                                roomCategoryElement.activeRoomCategories = [];
                                roomCategoryElement.currentPage = roomCategoryElement.currentPage + 1;
                                roomCategoryElement.activeRoomCategories.unshift(addOrUpdateSuccessResponse);
                            }
                            entitiesArray.unshift(addOrUpdateSuccessResponse);
                            if (roomCategoryElement.activeRoomCategories.length == roomCategoryElement.itemsPerPage && displayArray.length !== parseInt(1)) {
                                roomCategoryElement.currentPage = 1;
                                displayArray = _.chunk(entitiesArray, roomCategoryElement.itemsPerPage);
                                angular.copy(displayArray[0], roomCategoryElement.activeRoomCategories);
                            }
                        }
                        displayArray = _.chunk(entitiesArray, roomCategoryElement.itemsPerPage);
                        roomCategoryElement.totalItems = entitiesArray.length;
                    } else {
                        roomCategoryElement.activeRoomCategories.splice(roomCategoryItemIndex, 1, addOrUpdateSuccessResponse);
                        var indexLocal = _.findLastIndex(entitiesArray, function(entity) {
                            return entity.id == addOrUpdateSuccessResponse.id;
                        });
                        entitiesArray.splice(indexLocal, 1, addOrUpdateSuccessResponse);
                        displayArray = _.chunk(entitiesArray, roomCategoryElement.itemsPerPage);
                        roomCategoryElement.totalItems = entitiesArray.length;
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
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var deleteRoomSuccess = angular.fromJson(deleteRoomCategorySuccess.data.response);
                    if (deleteRoomCategorySuccess.data.errorCode == null && deleteRoomCategorySuccess.data.success == true) {
                        dboticaServices.deleteRoomCategorySuccessSwal();
                        roomCategoryElement.activeRoomCategories.splice(index, 1);
                        var deleteIndex = _.findLastIndex(entitiesArray, function(entity) {
                            return entity.id == roomCategory.id;
                        });
                        entitiesArray.splice(deleteIndex, 1);
                        roomCategoryElement.totalItems = entitiesArray.length;
                        displayArray = _.chunk(entitiesArray, roomCategoryElement.itemsPerPage);
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
                    angular.copy(entitiesArray, searchDisplayArrayInTable);
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
                roomCategoryElement.totalItems = sortedItemsArray.length;
                roomCategoryElement.currentPage = 1;
                angular.copy(sortedItemsArray, sortedItemsArrayOnPageChange);
                displayArray = _.chunk(sortedItemsArray, roomCategoryElement.itemsPerPage);
                angular.copy(displayArray[0], roomCategoryElement.activeRoomCategories);
                entitiesArrayFlag = roomCategoryElement.inputItemSearch.length;
            }
        }
        if (searchStringLength <= parseInt(2)) {
            entitiesArrayFlag = parseInt(0);
            roomCategoryElement.totalItems = entitiesArray.length;
            roomCategoryElement.currentPage = 1;
            displayArray = _.chunk(entitiesArray, roomCategoryElement.itemsPerPage);
            angular.copy(displayArray[0], roomCategoryElement.activeRoomCategories);
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

    function pageChanged() {
        var requiredIndex = roomCategoryElement.currentPage - 1;
        var localArray = [];
        displayArray = [];
        if (roomCategoryElement.inputItemSearch.length >= parseInt(3)) {
            displayArray = _.chunk(sortedItemsArrayOnPageChange, roomCategoryElement.itemsPerPage);
        } else {
            sortedItemsArrayOnPageChange = [];
            displayArray = _.chunk(entitiesArray, roomCategoryElement.itemsPerPage);
        }
        localArray = displayArray[requiredIndex];
        angular.copy(localArray, roomCategoryElement.activeRoomCategories);
    }

};
