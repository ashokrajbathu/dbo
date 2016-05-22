angular.module('personalAssistant').controller('inventoryCtrl', ['$scope', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "inventory");

    $scope.prevBtnDisabled = true;
    $scope.prevBtnEnabled = false;
    $scope.nextBtnDisabled = false;
    $scope.nextBtnEnabled = true;
    $scope.prevNextBtnsRow = true;
    $scope.viewAllItemsBtn = false;
    $scope.warning = false;
    $scope.isAllRedActive = true;
    $scope.isAllBlueActive = false;
    $scope.isLowBlueActive = true;
    $scope.isExpiredBlueActive = true;
    $scope.isLowRedActive = false;
    $scope.isExpiredRedActive = false;

    $scope.itemsDisplayArray = [];
    $scope.start = 0;
    $scope.limit = 11;
    var displayListLength = 10;
    $scope.startDisplay = $scope.start + 1;
    $scope.endDisplay = displayListLength;
    var organizationId = "2345673212";
    var itemSelectedForAddingBatch = {};
    $scope.warningMessage = false;
    $scope.itemSearch = {};
    $scope.itemSearch.itemName = "";

    angular.element("#addBatchExpiryTime").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0,
        changeMonth: true,
        changeYear: true
    });

    var promise = dboticaServices.getItemsOfTheTable($scope.start, $scope.limit, organizationId);
    promise.then(function(response) {
        itemsDisplayFunction(response);
    }, function(errorResponse) {
        console.log("in inventory error response");
    });

    $scope.nextBtnEnabledFunction = function() {
        var limit = 0;
        if ($scope.endDisplay < $scope.totalDrugsCount) {
            $scope.prevBtnEnabled = true;
            $scope.prevBtnDisabled = false;
            $scope.startDisplay = $scope.startDisplay + $scope.limit - 1;
            if (($scope.totalDrugsCount - $scope.endDisplay) <= displayListLength) {
                console.log("check-----");
                $scope.endCorrection = $scope.totalDrugsCount - $scope.endDisplay;
                $scope.endDisplay = $scope.totalDrugsCount;
                $scope.nextBtnEnabled = false;
                $scope.nextBtnDisabled = true;
                limit = $scope.endCorrection + 1;
                console.log("limit value is----" + limit);
            } else {
                $scope.endDisplay = $scope.endDisplay + $scope.limit - 1;
                limit = $scope.limit;
            }
        } else {
            $scope.nextBtnEnabled = false;
            $scope.nextBtnDisabled = true;
        }
        var promise = dboticaServices.getItemsOfTheTable($scope.startDisplay - 1, limit, organizationId);
        promise.then(function(response) {
            var errorCode = response.data.errorCode;
            if (!!errorCode) {
                switch (errorCode) {
                    case "NO_USER_LOGGED_IN":
                        localStorage.setItem("isLoggedIn", false);
                        swal({
                            title: "Error",
                            text: "You are not logged into your account. Kindly login again to view this page",
                            type: "error",
                            confirmButtonText: "OK",
                            allowOutsideClick: true
                        });
                        $state.go('login');
                        break;
                }
            }
            console.log("in next btn response----", response.data.response);
            var nextBtnFetchedItemsObject = $.parseJSON(response.data.response);
            var nextBtnFetchedItems = nextBtnFetchedItemsObject.inventoryItems;
            if (nextBtnFetchedItems.length > displayListLength) {
                $scope.itemsDisplayArray = nextBtnFetchedItems.slice(0, nextBtnFetchedItems.length - 1);
            } else {
                $scope.itemsDisplayArray = nextBtnFetchedItems;
            }

        }, function(errorResponse) {
            console.log("in error response of nex tbutton enabled");
        });
    }

    $scope.prevBtnEnabledFunction = function() {
        $scope.startDisplay = $scope.startDisplay - $scope.limit + 1;
        if ($scope.startDisplay == 1) {
            $scope.prevBtnDisabled = true;
            $scope.prevBtnEnabled = false;
        }
        if ($scope.totalDrugsCount == $scope.endDisplay) {
            $scope.endDisplay = $scope.endDisplay - $scope.endCorrection;
            $scope.nextBtnEnabled = true;
            $scope.nextBtnDisabled = false;
        } else {
            $scope.endDisplay = $scope.endDisplay - $scope.limit + 1;
        }
        var promise = dboticaServices.getItemsOfTheTable($scope.startDisplay - 1, $scope.limit, organizationId);
        promise.then(function(response) {
            console.log("in prev btn response----", response.data.response);
            var previousBtnFetchedItemsObject = $.parseJSON(response.data.response);
            var previousBtnFetchedItems = previousBtnFetchedItemsObject.inventoryItems;
            $scope.itemsDisplayArray = previousBtnFetchedItems.slice(0, previousBtnFetchedItems.length - 1);
        }, function(errorResponse) {
            console.log("in previous button error response");
        });
    }


    $scope.addItem = function() {
        $scope.addItemObject = {};
        $scope.addItemObject.itemType = "DRUG";
        $scope.addItemObject.organizationId = "2345673212";

    }

    $scope.addItemIntoStock = function() {
        var promise = dboticaServices.addItemIntoStock($scope.addItemObject);
        promise.then(function(response) {
            var success = response.data.success;
            if (success) {
                swal({
                    title: "Info",
                    text: "Item Added Successfully",
                    type: "info",
                    confirmButtonText: "OK",
                    allowOutsideClick: true
                });
            }
            var drugObject = $.parseJSON(response.data.response);
            console.log("drug object is----", drugObject);
            $scope.itemsDisplayArray.push(drugObject);
            $scope.totalDrugsCount = $scope.totalDrugsCount + 1;
            console.log("items array-----", $scope.itemsDisplayArray);
        }, function(errorResponse) {
            console.log("Error in add item into stock");
        });
    }

    $scope.additionOfBatch = function(item) {
        $scope.addBatch = {};
        $scope.warningMessage = false;
        $scope.addBatch.organizationId = item.organizationId;
        $scope.addBatch.itemName = item.itemName;
        itemSelectedForAddingBatch = item;
    }

    $scope.viewInfo = function(item) {
        dboticaServices.setItemSelected(item);
        $state.go('home.itemInfo');
    }

    $scope.addBatchForSelectedItem = function() {
        var requestEntity = {};
        if ($scope.addBatch.units == undefined || $scope.addBatch.expiryDate == undefined) {
            $scope.warningMessage = true;
        } else {
            requestEntity.organizationId = itemSelectedForAddingBatch.organizationId;
            requestEntity.batchNo = $scope.addBatch.batchNumber;
            requestEntity.itemId = itemSelectedForAddingBatch.id;
            requestEntity.costPrice = $scope.addBatch.costPrice * 100;
            requestEntity.units = $scope.addBatch.units;
            requestEntity.consumedUnits = 0;
            var dateSelectedForBatch = $scope.addBatch.expiryDate;
            var dateSelectedArray = dateSelectedForBatch.split('/');
            dateSelectedForBatch = dateSelectedArray[1] + '/' + dateSelectedArray[0] + '/' + dateSelectedArray[2];
            dateSelectedForBatch = new Date(dateSelectedForBatch);
            dateSelectedForBatch = dateSelectedForBatch.getTime();
            requestEntity.expiryTime = dateSelectedForBatch;
            requestEntity.batchState = "ACTIVE";
            requestEntity.entityState = "ACTIVE";
            requestEntity = JSON.stringify(requestEntity);
            console.log("added batch is----", requestEntity);
            var promise = dboticaServices.addBatchToTheDrug(requestEntity);
            promise.then(function(response) {
                var success = response.data.success;
                if (success) {
                    swal({
                        title: "Info",
                        text: "Batch Successfully Added.",
                        type: "info",
                        confirmButtonText: "OK",
                        allowOutsideClick: true
                    });
                }
                var itemObject = $.parseJSON(response.data.response);
                console.log("item after adding batch is-----", itemObject);
                for (itemIndex = 0; itemIndex < $scope.itemsDisplayArray.length; itemIndex++) {
                    if ($scope.itemsDisplayArray[itemIndex].id === itemObject.itemId) {
                        $scope.itemsDisplayArray[itemIndex].availableStock += itemObject.units;
                    }
                }
                console.log("array after adding batch is-----", $scope.itemsDisplayArray);
            }, function(errorResponse) {

            });
        }
    }

    $scope.viewLowItemsSelect = function() {
        if ($scope.isLowBlueActive) {
            $scope.isLowBlueActive = false;
            $scope.isLowRedActive = true;
            $scope.isAllRedActive = false;
            $scope.isExpiredRedActive = false;
            $scope.isAllBlueActive = true;
            $scope.isExpiredBlueActive = true;
        }
    }

    $scope.viewAllItemsSelect = function() {
        if ($scope.isAllBlueActive) {
            $scope.isAllBlueActive = false;
            $scope.isAllRedActive = true;
            $scope.isLowBlueActive = true;
            $scope.isLowRedActive = false;
            $scope.isExpiredBlueActive = true;
            $scope.isExpiredRedActive = false;
        }
    }

    $scope.viewExpiredItemsSelect = function() {
        if ($scope.isExpiredBlueActive) {
            $scope.isExpiredBlueActive = false;
            $scope.isExpiredRedActive = true;
            $scope.isAllRedActive = false;
            $scope.isAllBlueActive = true;
            $scope.isLowRedActive = false;
            $scope.isLowBlueActive = true;
        }
    }

    $scope.itemSearchFromDB = function() {
        if ($scope.itemSearch.itemName !== "") {
            $scope.prevNextBtnsRow = false;
            $scope.viewAllItemsBtn = true;
            console.log("item to be searched is------", $scope.itemSearch.itemName);
            var promise = dboticaServices.getItemFromDB($scope.itemSearch.itemName, organizationId);
            promise.then(function(response) {
                console.log("response after search is---------", response);
                var itemSearchResponse = $.parseJSON(response.data.response);
                $scope.itemsDisplayArray = itemSearchResponse.inventoryItems;
                if (itemSearchResponse.totalCount === 0) {
                    $scope.warning = true;
                } else {
                    $scope.warning = false;
                }
                console.log("response for search is----", itemSearchResponse);
            }, function(errorResponse) {
                console.log("in error Response of item search from db");
            });
        }
    }

    $scope.viewAllItems = function() {
        $scope.warning = false;
        var promise = dboticaServices.getItemsOfTheTable($scope.start, $scope.limit, organizationId);
        promise.then(function(response) {
            itemsDisplayFunction(response);
            $scope.itemSearch.itemName = "";
            $scope.viewAllItemsBtn = false;
            $scope.prevNextBtnsRow = true;
        }, function(errorResponse) {
            console.log("in error response of view all items");
        });
    }

    var itemsDisplayFunction = function(response) {
        var errorCode = response.data.errorCode;
        if (!!errorCode) {
            switch (errorCode) {
                case "NO_USER_LOGGED_IN":
                    localStorage.setItem("isLoggedIn", false);
                    swal({
                        title: "Error",
                        text: "You are not logged into your account. Kindly login again to view this page",
                        type: "error",
                        confirmButtonText: "OK",
                        allowOutsideClick: true
                    });
                    $state.go('login');
                    break;
            }
        }
        console.log(response.data.response);
        var itemsFetchedFromApi = $.parseJSON(response.data.response);
        console.log("items fetched from Api----", itemsFetchedFromApi.inventoryItems);
        $scope.totalDrugsCount = itemsFetchedFromApi.totalCount;
        var itemsFetchedFromApiFromStart = itemsFetchedFromApi.inventoryItems;
        if (itemsFetchedFromApiFromStart.length >= displayListLength) {
            if (itemsFetchedFromApiFromStart.length == displayListLength) {
                $scope.itemsDisplayArray = itemsFetchedFromApiFromStart;
            } else {
                $scope.itemsDisplayArray = itemsFetchedFromApiFromStart.slice(0, itemsFetchedFromApiFromStart.length - 1);
            }
        } else {
            console.log("in not display");
            $scope.prevBtnEnabled = false;
            $scope.nextBtnEnabled = false;
            $scope.prevBtnDisabled = true;
            $scope.nextBtnDisabled = true;
            $scope.endDisplay = itemsFetchedFromApiFromStart.length;
            $scope.itemsDisplayArray = itemsFetchedFromApiFromStart;
        }

    }
}]);
