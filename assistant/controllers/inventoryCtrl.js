angular.module('personalAssistant').controller('inventoryCtrl', ['$scope', '$log', '$filter', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, $filter, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
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
    $scope.isAllTypeActive = true;
    $scope.isDrugTypeActive = false;
    $scope.isSuppliesTypeActive = false;
    $scope.isEquipmentsTypeActive = false;
    $scope.isOthersTypeActive = false;
    $scope.isAllTypeBlueActive = false;
    $scope.isDrugTypeBlueActive = true;
    $scope.isSuppliesTypeBlueActive = true;
    $scope.isEquipmentsTypeBlueActive = true;
    $scope.isOthersTypeBlueActive = true;

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

    var promise = dboticaServices.getItemsOfTheTable($scope.start, $scope.limit, "All", "All", organizationId);
    promise.then(function(response) {
        itemsDisplayFunction(response);
    }, function(errorResponse) {
        $log.log("in inventory error response");
    });

    $scope.nextBtnEnabledFunction = function() {
        var limit = 0;
        var itemType = "";
        var stockType = "";
        if ($scope.endDisplay < $scope.totalDrugsCount) {
            $scope.prevBtnEnabled = true;
            $scope.prevBtnDisabled = false;
            $scope.startDisplay = $scope.startDisplay + $scope.limit - 1;
            if (($scope.totalDrugsCount - $scope.endDisplay) <= displayListLength) {
                $log.log("check-----");
                $scope.endCorrection = $scope.totalDrugsCount - $scope.endDisplay;
                $scope.endDisplay = $scope.totalDrugsCount;
                $scope.nextBtnEnabled = false;
                $scope.nextBtnDisabled = true;
                limit = $scope.endCorrection + 1;
                $log.log("limit value is----" + limit);
            } else {
                $scope.endDisplay = $scope.endDisplay + $scope.limit - 1;
                limit = $scope.limit;
            }
        } else {
            $scope.nextBtnEnabled = false;
            $scope.nextBtnDisabled = true;
        }
        itemType = returnItemTypeActive();
        stockType = returnStockType();
        $log.log("item type is---", itemType);
        $log.log("stock type is----", stockType);
        var promise = dboticaServices.getItemsOfTheTable($scope.startDisplay - 1, limit, stockType, itemType, organizationId);
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
            $log.log("in next btn response----", response.data.response);
            var nextBtnFetchedItemsObject = $.parseJSON(response.data.response);
            var nextBtnFetchedItems = nextBtnFetchedItemsObject.inventoryItems;
            if (nextBtnFetchedItems.length > displayListLength) {
                $scope.itemsDisplayArray = nextBtnFetchedItems.slice(0, nextBtnFetchedItems.length - 1);
            } else {
                $scope.itemsDisplayArray = nextBtnFetchedItems;
            }

        }, function(errorResponse) {
            $log.log("in error response of nex tbutton enabled");
        });
    }

    $scope.prevBtnEnabledFunction = function() {
        var itemType = "";
        var stockType = "";
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
        itemType = returnItemTypeActive();
        stockType = returnStockType();
        var promise = dboticaServices.getItemsOfTheTable($scope.startDisplay - 1, $scope.limit, stockType, itemType, organizationId);
        promise.then(function(response) {
            $log.log("in prev btn response----", response.data.response);
            var previousBtnFetchedItemsObject = $.parseJSON(response.data.response);
            var previousBtnFetchedItems = previousBtnFetchedItemsObject.inventoryItems;
            $scope.itemsDisplayArray = previousBtnFetchedItems.slice(0, previousBtnFetchedItems.length - 1);
        }, function(errorResponse) {
            $log.log("in previous button error response");
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
            $log.log("response after adding item is----", response);
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
            $log.log("drug object is----", drugObject);
            $scope.itemsDisplayArray.push(drugObject);
            $scope.totalDrugsCount = $scope.totalDrugsCount + 1;
            $log.log("items array-----", $scope.itemsDisplayArray);
        }, function(errorResponse) {
            $log.log("Error in add item into stock");
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
            $log.log("added batch is----", requestEntity);
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
                $log.log("item after adding batch is-----", itemObject);
                for (itemIndex = 0; itemIndex < $scope.itemsDisplayArray.length; itemIndex++) {
                    if ($scope.itemsDisplayArray[itemIndex].id === itemObject.itemId) {
                        $scope.itemsDisplayArray[itemIndex].availableStock += itemObject.units;
                    }
                }
                $log.log("array after adding batch is-----", $scope.itemsDisplayArray);
            }, function(errorResponse) {

            });
        }
    }

    $scope.viewLowItemsSelect = function() {
        if ($scope.isLowBlueActive) {
            var itemType = "";
            $scope.isLowBlueActive = false;
            $scope.isLowRedActive = true;
            $scope.isAllRedActive = false;
            $scope.isExpiredRedActive = false;
            $scope.isAllBlueActive = true;
            $scope.isExpiredBlueActive = true;
            $scope.startDisplay = $scope.start + 1;
            $scope.endDisplay = displayListLength;
            itemType = returnItemTypeActive();
            var promise = dboticaServices.lowStockExpiredStockItems("lowItems", $scope.start, $scope.limit, itemType, organizationId);
            promise.then(function(response) {
                itemsDisplayFunction(response);
            }, function(errorResponse) {
                $log.log("in error response of low items view----");
            });
        }
    }

    $scope.viewAllItemsSelect = function() {
        if ($scope.isAllBlueActive) {
            var itemType = "";
            var stockType = "";
            $scope.isAllBlueActive = false;
            $scope.isAllRedActive = true;
            $scope.isLowBlueActive = true;
            $scope.isLowRedActive = false;
            $scope.isExpiredBlueActive = true;
            $scope.isExpiredRedActive = false;
            $scope.startDisplay = $scope.start + 1;
            $scope.endDisplay = displayListLength;
            itemType = returnItemTypeActive();
            stockType = returnStockType();
            var promise = dboticaServices.getItemsOfTheTable($scope.start, $scope.limit, stockType, itemType, organizationId);
            promise.then(function(response) {
                itemsDisplayFunction(response);
            }, function(errorResponse) {
                $log.log("in error response of view all items---");
            });
        }
    }

    $scope.viewExpiredItemsSelect = function() {
        if ($scope.isExpiredBlueActive) {
            var itemType = "";
            $scope.isExpiredBlueActive = false;
            $scope.isExpiredRedActive = true;
            $scope.isAllRedActive = false;
            $scope.isAllBlueActive = true;
            $scope.isLowRedActive = false;
            $scope.isLowBlueActive = true;
            $scope.startDisplay = $scope.start + 1;
            $scope.endDisplay = displayListLength;
            itemType = returnItemTypeActive();
            var promise = dboticaServices.lowStockExpiredStockItems("expiredStockItems", $scope.start, $scope.limit, itemType, organizationId);
            promise.then(function(response) {
                itemsDisplayFunction(response);
            }, function(errorResponse) {
                $log.log("in error response of view expired items---");
            });
        }
    }

    $scope.itemSearchFromDB = function() {
        if ($scope.itemSearch.itemName !== "") {
            $scope.prevNextBtnsRow = false;
            $scope.viewAllItemsBtn = true;
            $log.log("item to be searched is------", $scope.itemSearch.itemName);
            var promise = dboticaServices.getItemFromDB($scope.itemSearch.itemName, organizationId);
            promise.then(function(response) {
                $log.log("response after search is---------", response);
                var itemSearchResponse = $.parseJSON(response.data.response);
                $scope.itemsDisplayArray = itemSearchResponse.inventoryItems;
                if (itemSearchResponse.totalCount === 0) {
                    $scope.warning = true;
                } else {
                    $scope.warning = false;
                }
                $log.log("response for search is----", itemSearchResponse);
            }, function(errorResponse) {
                $log.log("in error Response of item search from db");
            });
        }
    }

    $scope.viewAllItems = function() {
        $scope.warning = false;
        $scope.startDisplay = $scope.start + 1;
        $scope.endDisplay = displayListLength;
        var promise = dboticaServices.getItemsOfTheTable($scope.start, $scope.limit, 'All', 'All', organizationId);
        promise.then(function(response) {
            itemsDisplayFunction(response);
            $scope.itemSearch.itemName = "";
            $scope.viewAllItemsBtn = false;
            $scope.prevNextBtnsRow = true;
        }, function(errorResponse) {
            $log.log("in error response of view all items");
        });
    }

    $scope.viewAllInventoryItems = function() {
        if ($scope.isAllTypeBlueActive) {
            var stockType = "";
            $scope.startDisplay = $scope.start + 1;
            $scope.endDisplay = displayListLength;
            $scope.isAllTypeBlueActive = false;
            $scope.isAllTypeActive = true;
            $scope.isDrugTypeBlueActive = true;
            $scope.isDrugTypeActive = false;
            $scope.isEquipmentsTypeBlueActive = true;
            $scope.isEquipmentsTypeActive = false;
            $scope.isSuppliesTypeBlueActive = true;
            $scope.isSuppliesTypeActive = false;
            $scope.isOthersTypeBlueActive = true;
            $scope.isOthersTypeActive = false;
            stockType = returnStockType();
            var promise = dboticaServices.getStockItemsForTheTable("All", $scope.start, $scope.limit, stockType, organizationId);
            promise.then(function(response) {
                itemsDisplayFunction(response);
            }, function(errorResponse) {
                $log.log("in error response of view all inventory items---");
            });
        }
    }

    $scope.viewDrugInventoryItems = function() {
        if ($scope.isDrugTypeBlueActive) {
            var stockType = "";
            $scope.startDisplay = $scope.start + 1;
            $scope.endDisplay = displayListLength;
            $scope.isAllTypeBlueActive = true;
            $scope.isAllTypeActive = false;
            $scope.isDrugTypeBlueActive = false;
            $scope.isDrugTypeActive = true;
            $scope.isEquipmentsTypeBlueActive = true;
            $scope.isEquipmentsTypeActive = false;
            $scope.isSuppliesTypeBlueActive = true;
            $scope.isSuppliesTypeActive = false;
            $scope.isOthersTypeBlueActive = true;
            $scope.isOthersTypeActive = false;
            stockType = returnStockType();
            var promise = dboticaServices.getStockItemsForTheTable("DrugItems", $scope.start, $scope.limit, stockType, organizationId);
            promise.then(function(response) {
                itemsDisplayFunction(response);
            }, function(errorResponse) {
                $log.log("in error response of view drug inventory items---");
            });
        }

    }

    $scope.viewSuppliesInventoryItems = function() {
        if ($scope.isSuppliesTypeBlueActive) {
            var stockType = "";
            $scope.startDisplay = $scope.start + 1;
            $scope.endDisplay = displayListLength;
            $scope.isAllTypeBlueActive = true;
            $scope.isAllTypeActive = false;
            $scope.isDrugTypeBlueActive = true;
            $scope.isDrugTypeActive = false;
            $scope.isEquipmentsTypeBlueActive = true;
            $scope.isEquipmentsTypeActive = false;
            $scope.isSuppliesTypeBlueActive = false;
            $scope.isSuppliesTypeActive = true;
            $scope.isOthersTypeBlueActive = true;
            $scope.isOthersTypeActive = false;
            stockType = returnStockType();
            var promise = dboticaServices.getStockItemsForTheTable("SuppliesItems", $scope.start, $scope.limit, stockType, organizationId);
            promise.then(function(response) {
                itemsDisplayFunction(response);
            }, function(errorResponse) {
                $log.log("in error response of view supplies inventory  items---");
            });
        }
    }

    $scope.viewEquipmentsInventoryItems = function() {
        if ($scope.isEquipmentsTypeBlueActive) {
            var stockType = "";
            $log.log("in equipment---");
            $scope.isAllTypeBlueActive = true;
            $scope.isAllTypeActive = false;
            $scope.isDrugTypeBlueActive = true;
            $scope.isDrugTypeActive = false;
            $scope.isEquipmentsTypeBlueActive = false;
            $scope.isEquipmentsTypeActive = true;
            $scope.isSuppliesTypeBlueActive = true;
            $scope.isSuppliesTypeActive = false;
            $scope.isOthersTypeBlueActive = true;
            $scope.isOthersTypeActive = false;
            stockType = returnStockType();
            $scope.startDisplay = $scope.start + 1;
            $scope.endDisplay = displayListLength;
            var promise = dboticaServices.getStockItemsForTheTable("EquipmentItems", $scope.start, $scope.limit, stockType, organizationId);
            promise.then(function(response) {
                itemsDisplayFunction(response);
            }, function(errorResponse) {
                $log.log("in error response of view equipments inventory items---");
            });
        }
    }

    $scope.viewOthersInventoryItems = function() {
        if ($scope.isOthersTypeBlueActive) {
            var stockType = "";
            $scope.isAllTypeBlueActive = true;
            $scope.isAllTypeActive = false;
            $scope.isDrugTypeBlueActive = true;
            $scope.isDrugTypeActive = false;
            $scope.isEquipmentsTypeBlueActive = true;
            $scope.isEquipmentsTypeActive = false;
            $scope.isSuppliesTypeBlueActive = true;
            $scope.isSuppliesTypeActive = false;
            $scope.isOthersTypeBlueActive = false;
            $scope.isOthersTypeActive = true;
            stockType = returnStockType();
            $log.log("stock type is----", stockType);
            var promise = dboticaServices.getStockItemsForTheTable("OtherItems", $scope.start, $scope.limit, stockType, organizationId);
            promise.then(function(response) {
                itemsDisplayFunction(response);
            }, function(errorResponse) {
                $log.log("in error response of view others inventory  items---");
            });
        }
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
        $log.log(response.data.response);
        var itemsFetchedFromApi = $.parseJSON(response.data.response);
        $log.log("items fetched from Api----", itemsFetchedFromApi.inventoryItems);
        $scope.totalDrugsCount = itemsFetchedFromApi.totalCount;
        var itemsFetchedFromApiFromStart = itemsFetchedFromApi.inventoryItems;
        if (itemsFetchedFromApiFromStart.length >= displayListLength) {
            $log.log("in greater than length-----");
            if (itemsFetchedFromApiFromStart.length == displayListLength) {
                $scope.prevBtnDisabled = true;
                $scope.nextBtnDisabled = true;
                $scope.prevBtnEnabled = false;
                $scope.nextBtnEnabled = false;
                $scope.itemsDisplayArray = itemsFetchedFromApiFromStart;
            } else {
                $scope.prevBtnDisabled = true;
                $scope.nextBtnDisabled = false;
                $scope.prevBtnEnabled = false;
                $scope.nextBtnEnabled = true;
                $scope.itemsDisplayArray = itemsFetchedFromApiFromStart.slice(0, itemsFetchedFromApiFromStart.length - 1);
            }
        } else {
            $log.log("in not display");
            $scope.prevBtnEnabled = false;
            $scope.nextBtnEnabled = false;
            $scope.prevBtnDisabled = true;
            $scope.nextBtnDisabled = true;
            $scope.endDisplay = itemsFetchedFromApiFromStart.length;
            $scope.itemsDisplayArray = itemsFetchedFromApiFromStart;
        }

    }

    var returnItemTypeActive = function() {
        var itemType = "";
        if ($scope.isDrugTypeActive) {
            itemType = "Drug";
        }
        if ($scope.isEquipmentsTypeActive) {
            itemType = "Equipments";
        }
        if ($scope.isSuppliesTypeActive) {
            itemType = "Supplies";
        }
        if ($scope.isAllTypeActive) {
            $log.log("in alll---");
            itemType = "All";
        }
        if ($scope.isOthersTypeActive) {
            itemType = "Others";
        }
        return itemType;
    }

    var returnStockType = function() {
        var stockType = "";
        if ($scope.isAllRedActive) {
            stockType = "All";
        }
        if ($scope.isLowRedActive) {
            stockType = "Low";
        }
        if ($scope.isExpiredRedActive) {
            stockType = "Expired";
        }
        return stockType;
    }

    angular.module('personalAssistant').filter("billingAndBatchConsumed", function() {
        $log.log("in filter---");
        return function(input) {
            $log.log("in filter---", input);
            var result;
            if (input == "") {
                $log.log("in filter");
                result = 0;
            } else {
                result = input;
            }
            return result;
        };
    });
}]);
