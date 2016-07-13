angular.module('personalAssistant').controller('bedController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var bedElement = this;

    bedElement.addNewBed = addNewBed;
    bedElement.selectRoomNumber = selectRoomNumber;
    bedElement.validateBedNumber = validateBedNumber;
    bedElement.clearAllVars = clearAllVars;
    bedElement.deleteBed = deleteBed;
    bedElement.searchTheBed = searchTheBed;
    bedElement.editBedDetails = editBedDetails;
    bedElement.pageChanged = pageChanged;

    bedElement.addNew = {};
    bedElement.roomsInBedToDisplay = [];
    bedElement.bedsToBeDisplayedInTable = [];
    bedElement.addNew.bedNo = '';
    bedElement.enterBedErrorMessage = false;
    bedElement.selectRoomNumberErrorMessage = false;
    bedElement.addNew.bedStatus = 'VACANT';
    var roomNumberString = '---Room Number----';
    bedElement.roomNumber = '---Room Number----';
    bedElement.bedSearchInTxtBox = '';
    var addBedItemId = '';
    var addBedItemIndex = '';
    bedElement.currentPage = 1;
    bedElement.itemsPerPage = 5;
    var displayArray = [];
    var entitiesArray = [];
    var sortedItemsArrayOnPageChange = [];
    var entitiesArrayFlag = parseInt(0);

    var organizationId = localStorage.getItem('orgId');

    var roomsInBedPromise = dboticaServices.getRooms(organizationId);
    roomsInBedPromise.then(function(roomsInBedSuccess) {
        var errorCode = roomsInBedSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var roomsInBedListSuccess = angular.fromJson(roomsInBedSuccess.data.response);
            bedElement.roomsInBedToDisplay = _.filter(roomsInBedListSuccess, function(entity) {
                return entity.state == 'ACTIVE';
            });
            bedElement.roomsInBedToDisplay.unshift({ 'roomNo': '---Room Number----' });
        }
    }, function(roomsInBedError) {
        dboticaServices.noConnectivityError();
    });

    var bedsInRoomPromise = dboticaServices.getBeds(organizationId);
    bedsInRoomPromise.then(function(bedsInRoomSuccess) {
        var errorCode = bedsInRoomSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var bedsListInResponse = angular.fromJson(bedsInRoomSuccess.data.response);
            bedElement.bedsToBeDisplayedInTable = _.filter(bedsListInResponse, function(entity) {
                return entity.bedState == 'ACTIVE';
            });
            bedElement.totalItems = bedElement.bedsToBeDisplayedInTable.length;
            angular.copy(bedElement.bedsToBeDisplayedInTable, entitiesArray);
            displayArray = _.chunk(entitiesArray, bedElement.itemsPerPage);
            angular.copy(displayArray[0], bedElement.bedsToBeDisplayedInTable);
        }
    }, function(bedsInRoomError) {
        dboticaServices.noConnectivityError();
    });

    function addNewBed() {
        bedElement.validateBedNumber();
        dropdownErrorCheck();
        if (!bedElement.enterBedErrorMessage && !bedElement.selectRoomNumberErrorMessage) {
            bedElement.addNew.organizationId = organizationId;
            var addNewBedPromise = dboticaServices.addNewBed(bedElement.addNew);
            addNewBedPromise.then(function(addNewBedSuccess) {
                var errorCode = addNewBedSuccess.data.errorCode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var addNewBedSuccessResponse = angular.fromJson(addNewBedSuccess.data.response);
                    if (addNewBedSuccess.data.errorCode == null && addNewBedSuccess.data.success == true) {
                        dboticaServices.addOrUpdateBedSuccessSwal();
                        angular.element('#addBedModal').modal('hide');
                        if (addBedItemId == '' && addBedItemIndex == '') {
                            if (bedElement.bedsToBeDisplayedInTable.length < bedElement.itemsPerPage) {
                                bedElement.bedsToBeDisplayedInTable.unshift(addNewBedSuccessResponse);
                                entitiesArray.push(addNewBedSuccessResponse);
                            } else {
                                if (displayArray.length == bedElement.currentPage || displayArray.length == parseInt(1)) {
                                    bedElement.bedsToBeDisplayedInTable = [];
                                    bedElement.currentPage = bedElement.currentPage + 1;
                                    bedElement.bedsToBeDisplayedInTable.unshift(addNewBedSuccessResponse);
                                }
                                entitiesArray.unshift(addNewBedSuccessResponse);
                                if (bedElement.bedsToBeDisplayedInTable.length == bedElement.itemsPerPage && displayArray.length !== parseInt(1)) {
                                    bedElement.currentPage = 1;
                                    displayArray = _.chunk(entitiesArray, bedElement.itemsPerPage);
                                    angular.copy(displayArray[0], bedElement.bedsToBeDisplayedInTable);
                                }
                            }
                            displayArray = _.chunk(entitiesArray, bedElement.itemsPerPage);
                            bedElement.totalItems = entitiesArray.length;
                        } else {
                            bedElement.bedsToBeDisplayedInTable.splice(addBedItemIndex, 1, addNewBedSuccessResponse);
                            var indexLocal = _.findLastIndex(entitiesArray, function(entity) {
                                return entity.id == addNewBedSuccessResponse.id;
                            });
                            entitiesArray.splice(indexLocal, 1, addNewBedSuccessResponse);
                            displayArray = _.chunk(entitiesArray, bedElement.itemsPerPage);
                            bedElement.totalItems = entitiesArray.length;
                            addBedItemId = '';
                            addBedItemIndex = '';
                        }
                    }
                }
            }, function(addNewBedError) {
                dboticaServices.noConnectivityError();
            });
        }
    }

    function selectRoomNumber(roomEntity) {
        bedElement.roomNumber = roomEntity.roomNo;
        dropdownErrorCheck();
        bedElement.addNew.organizationRoomId = roomEntity.id;
    }

    function validateBedNumber() {
        if (bedElement.addNew.bedNo == '') {
            bedElement.enterBedErrorMessage = true;
        } else {
            bedElement.enterBedErrorMessage = false;
        }
    }

    var dropdownErrorCheck = function() {
        if (bedElement.roomNumber == '---Room Number----') {
            bedElement.selectRoomNumberErrorMessage = true;
        } else {
            bedElement.selectRoomNumberErrorMessage = false;
        }
    }

    function clearAllVars() {
        bedElement.addNew.bedNo = '';
        bedElement.enterBedErrorMessage = false;
        bedElement.selectRoomNumberErrorMessage = false;
        bedElement.roomNumber = roomNumberString;
    }

    function deleteBed(bedUnit, index) {
        swal({
                title: "Are you sure?",
                text: "You will not be able to recover Bed Details!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function() {
                bedUnit.state = 'INACTIVE';
                var deleteBedPromise = dboticaServices.addNewBed(bedUnit);
                deleteBedPromise.then(function(deleteBedSuccess) {
                    var errorCode = deleteBedSuccess.data.errorCode;
                    if (!!errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        var deleteBedSuccessResponse = angular.fromJson(deleteBedSuccess.data.response);
                        if (deleteBedSuccess.data.errorCode == null && deleteBedSuccess.data.success == true) {
                            dboticaServices.deleteBedSuccessSwal();
                            bedElement.bedsToBeDisplayedInTable.splice(index, 1);
                            var deleteIndex = _.findLastIndex(entitiesArray, function(entity) {
                                return entity.id == bedUnit.id;
                            });
                            entitiesArray.splice(deleteIndex, 1);
                            bedElement.totalItems = entitiesArray.length;
                            displayArray = _.chunk(entitiesArray, bedElement.itemsPerPage);
                        }
                    }
                }, function(deleteBedError) {
                    dboticaServices.noConnectivityError();
                });
                swal("Deleted!", "Bed details has been deleted.", "success");
            });
    }

    function searchTheBed() {
        var searchStringLength = bedElement.bedSearchInTxtBox.length;
        if (searchStringLength >= parseInt(3)) {
            var searchDisplayArrayInTable = [];
            if (bedElement.bedSearchInTxtBox !== '' && bedElement.bedSearchInTxtBox !== undefined) {
                if (searchStringLength > entitiesArrayFlag) {
                    /*angular.copy(bedElement.bedsToBeDisplayedInTable, searchDisplayArrayInTable);*/
                    angular.copy(entitiesArray, searchDisplayArrayInTable);
                } else {
                    angular.copy(entitiesArray, searchDisplayArrayInTable);
                }
                var sortedItemsArray = [];
                angular.forEach(searchDisplayArrayInTable, function(activeBed) {
                    if (activeBed.bedState == 'ACTIVE') {
                        var checkBedNo = activeBed.bedNo.toLowerCase().indexOf(bedElement.bedSearchInTxtBox.toLowerCase()) > -1;
                        var checkRoomNo = activeBed.organizationRoom.roomNo.toLowerCase().indexOf(bedElement.bedSearchInTxtBox.toLowerCase()) > -1;
                        var checkRoomType = activeBed.organizationRoomCategory.roomType.toLowerCase().indexOf(bedElement.bedSearchInTxtBox.toLowerCase()) > -1;
                        var bedStatusCheck = activeBed.bedStatus.toLowerCase().indexOf(bedElement.bedSearchInTxtBox.toLowerCase()) > -1;
                        var check = checkBedNo || checkRoomNo || checkRoomType || bedStatusCheck;
                        if (check) {
                            sortedItemsArray.push(activeBed);
                        }
                    }
                });
                bedElement.totalItems = sortedItemsArray.length;
                bedElement.currentPage = 1;
                angular.copy(sortedItemsArray, sortedItemsArrayOnPageChange);
                displayArray = _.chunk(sortedItemsArray, bedElement.itemsPerPage);
                angular.copy(displayArray[0], bedElement.bedsToBeDisplayedInTable);
                entitiesArrayFlag = bedElement.bedSearchInTxtBox.length;
            }
        }
        if (searchStringLength <= parseInt(2)) {
            entitiesArrayFlag = parseInt(0);
            bedElement.totalItems = entitiesArray.length;
            bedElement.currentPage = 1;
            displayArray = _.chunk(entitiesArray, bedElement.itemsPerPage);
            angular.copy(displayArray[0], bedElement.bedsToBeDisplayedInTable);
        }
    }

    function editBedDetails(editBedEntity, index) {
        $log.log('edit bed entity is---', editBedEntity);
        addBedItemId = '';
        addBedItemIndex = '';
        addBedItemId = editBedEntity.id;
        addBedItemIndex = index;
        bedElement.addNew.bedNo = editBedEntity.bedNo;
        bedElement.addNew.bedStatus = editBedEntity.bedStatus.toUpperCase();
        bedElement.roomNumber = editBedEntity.organizationRoom.roomNo;
        bedElement.addNew.organizationRoomId = editBedEntity.organizationRoom.id;
        bedElement.addNew.id = addBedItemId;
    }

    function pageChanged() {
        var requiredIndex = bedElement.currentPage - 1;
        var localArray = [];
        displayArray = [];
        if (bedElement.bedSearchInTxtBox.length >= parseInt(3)) {
            displayArray = _.chunk(sortedItemsArrayOnPageChange, bedElement.itemsPerPage);
        } else {
            sortedItemsArrayOnPageChange = [];
            displayArray = _.chunk(entitiesArray, bedElement.itemsPerPage);
        }
        localArray = displayArray[requiredIndex];
        angular.copy(localArray, bedElement.bedsToBeDisplayedInTable);
    }
}]);
