angular.module('personalAssistant').controller('bedController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var bedElement = this;

    bedElement.addNewBed = addNewBed;
    bedElement.selectRoomNumber = selectRoomNumber;
    bedElement.validateBedNumber = validateBedNumber;
    bedElement.clearAllVars = clearAllVars;
    bedElement.deleteBed = deleteBed;
    bedElement.searchTheBed = searchTheBed;
    bedElement.editBedDetails = editBedDetails;

    bedElement.addNew = {};
    bedElement.roomsInBedToDisplay = [];
    bedElement.bedsToBeDisplayedInTable = [];
    bedElement.roomsInBedToDisplay.push({ 'roomNo': '---Room Number----' });
    bedElement.addNew.bedNo = '';
    bedElement.enterBedErrorMessage = false;
    bedElement.selectRoomNumberErrorMessage = false;
    bedElement.addNew.bedStatus = 'VACANT';
    var roomNumberString = '---Room Number----';
    bedElement.roomNumber = '---Room Number----';
    bedElement.bedSearchInTxtBox = '';
    bedElement.addBedItemId = '';
    bedElement.addBedItemIndex = '';

    var entitiesArray = [];
    var entitiesArrayFlag = parseInt(0);

    var organizationId = localStorage.getItem('orgId');

    var roomsInBedPromise = dboticaServices.getRooms(organizationId);
    roomsInBedPromise.then(function(roomsInBedSuccess) {
        var errorCode = roomsInBedSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var roomsInBedListSuccess = angular.fromJson(roomsInBedSuccess.data.response);
            $log.log('rooms in bed list success----', roomsInBedListSuccess);
            angular.forEach(roomsInBedListSuccess, function(roomNumberEntity) {
                if (roomNumberEntity.state == 'ACTIVE') {
                    bedElement.roomsInBedToDisplay.push(roomNumberEntity);
                }
            });
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
            $log.log('beds in list response---', bedsListInResponse);
            angular.forEach(bedsListInResponse, function(bedEntity) {
                if (bedEntity.bedState == 'ACTIVE') {
                    bedElement.bedsToBeDisplayedInTable.push(bedEntity);
                }
            });
            angular.copy(bedElement.bedsToBeDisplayedInTable, entitiesArray);
        }
    }, function(bedsInRoomError) {
        dboticaServices.noConnectivityError();
    });

    function addNewBed() {
        bedElement.validateBedNumber();
        dropdownErrorCheck();
        if (!bedElement.enterBedErrorMessage && !bedElement.selectRoomNumberErrorMessage) {
            bedElement.addNew.organizationId = organizationId;
            $log.log('req element is--', bedElement.addNew);
            var addNewBedPromise = dboticaServices.addNewBed(bedElement.addNew);
            $log.log('add new bed promise----', addNewBedPromise);
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
                            bedElement.bedsToBeDisplayedInTable.unshift(addNewBedSuccessResponse);
                            entitiesArray.unshift(addNewBedSuccessResponse);
                        } else {
                            bedElement.bedsToBeDisplayedInTable.splice(addBedItemIndex, 1, addNewBedSuccessResponse);
                            var indexLocal;
                            for (var entityArrayIndex in entitiesArray) {
                                if (entitiesArray[entityArrayIndex].id == addNewBedSuccessResponse.id) {
                                    indexLocal = entityArrayIndex;
                                    break;
                                } else {
                                    continue;
                                }
                            }
                            entitiesArray.splice(indexLocal, 1, addNewBedSuccessResponse);
                            addBedItemId = '';
                            addBedItemIndex = '';
                        }
                    }
                }
            }, function(addNewBedError) {
                dboticaServices.noConnectivityError();
            });
        }
        $log.log('bed status is----', bedElement.addNew.bedStatus);
    }

    function selectRoomNumber(roomEntity) {
        $log.log('room entity id is----', roomEntity);
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
                bedUnit.bedState = 'INACTIVE';
                var deleteBedPromise = dboticaServices.addNewBed(bedUnit);
                deleteBedPromise.then(function(deleteBedSuccess) {
                    var errorCode = deleteBedSuccess.data.errorCode;
                    if (!!errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        var deleteBedSuccessResponse = angular.fromJson(deleteBedSuccess.data.response);
                        $log.log('delete bed is---', deleteBedSuccessResponse);
                        if (deleteBedSuccess.data.errorCode == null && deleteBedSuccess.data.success == true) {
                            dboticaServices.deleteBedSuccessSwal();
                            bedElement.bedsToBeDisplayedInTable.splice(index, 1);
                            var deleteIndex;
                            for (var deleteEntityIndex in entitiesArray) {
                                if (entitiesArray[deleteEntityIndex].id == bedUnit.id) {
                                    deleteIndex = deleteEntityIndex;
                                    break;
                                } else {
                                    continue;
                                }
                            }
                            entitiesArray.splice(deleteIndex, 1);
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
                    angular.copy(bedElement.bedsToBeDisplayedInTable, searchDisplayArrayInTable);
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
                angular.copy(sortedItemsArray, bedElement.bedsToBeDisplayedInTable);
                entitiesArrayFlag = bedElement.bedSearchInTxtBox.length;
            }
        }
        if (searchStringLength <= parseInt(2)) {
            entitiesArrayFlag = parseInt(0);
            angular.copy(entitiesArray, bedElement.bedsToBeDisplayedInTable);
        }
    }

    function editBedDetails(editBedEntity, index) {
        addBedItemId = '';
        addBedItemIndex = '';
        addBedItemId = editBedEntity.id;
        addBedItemIndex = index;
        bedElement.addNew.bedNo = editBedEntity.bedNo;
        bedElement.addNew.bedStatus = editBedEntity.bedStatus.toUpperCase();
        bedElement.roomNumber = editBedEntity.organizationRoom.roomNo;
        bedElement.addNew.organizationRoomId = editBedEntity.organizationRoom.id;
    }
}]);
