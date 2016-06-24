angular.module('personalAssistant').controller('bedController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var bedElement = this;

    bedElement.addNewBed = addNewBed;
    bedElement.selectRoomNumber = selectRoomNumber;
    bedElement.validateBedNumber = validateBedNumber;
    bedElement.clearAllVars = clearAllVars;
    bedElement.deleteBed = deleteBed;

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
                    $log.log('in bed state active check----');
                    bedElement.bedsToBeDisplayedInTable.push(bedEntity);
                }
            });
        }
    }, function(bedsInRoomError) {

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
                    $log.log('success response---', addNewBedSuccessResponse);
                }
            }, function(addNewBedError) {

            });
            angular.element('#addBedModal').modal('hide');
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
        bedElement.enterBedErrorMessage = false;
        bedElement.selectRoomNumberErrorMessage = false;
        bedElement.roomNumber = roomNumberString;
    }

    function deleteBed(bedUnit) {
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
                    }
                }, function(deleteBedError) {
                    dboticaServices.noConnectivityError();
                });
                swal("Deleted!", "Bed details has been deleted.", "success");
            });
    }
}]);
