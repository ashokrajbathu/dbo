angular.module('personalAssistant').controller('inventoryCtrl', ['$scope', '$log', '$filter', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, $filter, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "inventory");

    var inventoryElement = this;

    inventoryElement.nextBtnEnabledFunction = nextBtnEnabledFunction;
    inventoryElement.prevBtnEnabledFunction = prevBtnEnabledFunction;
    inventoryElement.addItem = addItem;
    inventoryElement.addItemIntoStock = addItemIntoStock;
    inventoryElement.additionOfBatch = additionOfBatch;
    inventoryElement.viewInfo = viewInfo;
    inventoryElement.addBatchForSelectedItem = addBatchForSelectedItem;
    inventoryElement.viewLowItemsSelect = viewLowItemsSelect;
    inventoryElement.viewAllItemsSelect = viewAllItemsSelect;
    inventoryElement.viewExpiredItemsSelect = viewExpiredItemsSelect;
    inventoryElement.itemSearchFromDB = itemSearchFromDB;
    inventoryElement.viewAllItems = viewAllItems;
    inventoryElement.viewAllInventoryItems = viewAllInventoryItems;
    inventoryElement.viewDrugInventoryItems = viewDrugInventoryItems;
    inventoryElement.viewSuppliesInventoryItems = viewSuppliesInventoryItems;
    inventoryElement.viewEquipmentsInventoryItems = viewEquipmentsInventoryItems;
    inventoryElement.viewOthersInventoryItems = viewOthersInventoryItems;

    inventoryElement.loading = false;
    inventoryElement.prevBtnDisabled = true;
    inventoryElement.prevBtnEnabled = false;
    inventoryElement.nextBtnDisabled = false;
    inventoryElement.nextBtnEnabled = true;
    inventoryElement.prevNextBtnsRow = true;
    inventoryElement.viewAllItemsBtn = false;
    inventoryElement.warning = false;
    inventoryElement.isAllRedActive = true;
    inventoryElement.isAllBlueActive = false;
    inventoryElement.isLowBlueActive = true;
    inventoryElement.isExpiredBlueActive = true;
    inventoryElement.isLowRedActive = false;
    inventoryElement.isExpiredRedActive = false;
    inventoryElement.isAllTypeActive = true;
    inventoryElement.isDrugTypeActive = false;
    inventoryElement.isSuppliesTypeActive = false;
    inventoryElement.isEquipmentsTypeActive = false;
    inventoryElement.isOthersTypeActive = false;
    inventoryElement.isAllTypeBlueActive = false;
    inventoryElement.isDrugTypeBlueActive = true;
    inventoryElement.isSuppliesTypeBlueActive = true;
    inventoryElement.isEquipmentsTypeBlueActive = true;
    inventoryElement.isOthersTypeBlueActive = true;

    inventoryElement.itemsDisplayArray = [];
    inventoryElement.start = 0;
    inventoryElement.limit = 11;
    var displayListLength = 10;
    inventoryElement.startDisplay = inventoryElement.start + 1;
    inventoryElement.endDisplay = displayListLength;
    var organizationId = localStorage.getItem('orgId');
    var itemSelectedForAddingBatch = {};
    inventoryElement.warningMessage = false;
    inventoryElement.itemSearch = {};
    inventoryElement.itemSearch.itemName = "";
    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);

    angular.element("#addBatchExpiryTime").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0,
        changeMonth: true,
        changeYear: true
    });

    var promise = dboticaServices.getItemsOfTheTable(inventoryElement.start, inventoryElement.limit, "All", "All", organizationId);
    promise.then(function(response) {
        inventoryElement.loading = true;
        itemsDisplayFunction(response);
        inventoryElement.loading = false;
    }, function(errorResponse) {
        inventoryElement.loading = true;
        $log.log("in inventory error response");
    });

    function nextBtnEnabledFunction() {
        var limit = 0;
        var itemType = "";
        var stockType = "";
        if (inventoryElement.endDisplay < inventoryElement.totalDrugsCount) {
            inventoryElement.prevBtnEnabled = true;
            inventoryElement.prevBtnDisabled = false;
            inventoryElement.startDisplay = inventoryElement.startDisplay + inventoryElement.limit - 1;
            if ((inventoryElement.totalDrugsCount - inventoryElement.endDisplay) <= displayListLength) {
                $log.log("check-----");
                inventoryElement.endCorrection = inventoryElement.totalDrugsCount - inventoryElement.endDisplay;
                inventoryElement.endDisplay = inventoryElement.totalDrugsCount;
                inventoryElement.nextBtnEnabled = false;
                inventoryElement.nextBtnDisabled = true;
                limit = inventoryElement.endCorrection + 1;
                $log.log("limit value is----" + limit);
            } else {
                inventoryElement.endDisplay = inventoryElement.endDisplay + inventoryElement.limit - 1;
                limit = inventoryElement.limit;
            }
        } else {
            inventoryElement.nextBtnEnabled = false;
            inventoryElement.nextBtnDisabled = true;
        }
        itemType = returnItemTypeActive();
        stockType = returnStockType();
        $log.log("item type is---", itemType);
        $log.log("stock type is----", stockType);
        var promise = dboticaServices.getItemsOfTheTable(inventoryElement.startDisplay - 1, limit, stockType, itemType, organizationId);
        promise.then(function(response) {
            inventoryElement.loading = true;
            var errorCode = response.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                $log.log("in next btn response----", response.data.response);
                var nextBtnFetchedItemsObject = $.parseJSON(response.data.response);
                var nextBtnFetchedItems = nextBtnFetchedItemsObject.inventoryItems;
                if (nextBtnFetchedItems.length > displayListLength) {
                    inventoryElement.itemsDisplayArray = nextBtnFetchedItems.slice(0, nextBtnFetchedItems.length - 1);
                } else {
                    inventoryElement.itemsDisplayArray = nextBtnFetchedItems;
                }

            }
            inventoryElement.loading = false;
        }, function(errorResponse) {
            inventoryElement.loading = true;
            $log.log("in error response of nex tbutton enabled");
        });
    }

    function prevBtnEnabledFunction() {
        var itemType = "";
        var stockType = "";
        inventoryElement.startDisplay = inventoryElement.startDisplay - inventoryElement.limit + 1;
        if (inventoryElement.startDisplay == 1) {
            inventoryElement.prevBtnDisabled = true;
            inventoryElement.prevBtnEnabled = false;
        }
        if (inventoryElement.totalDrugsCount == inventoryElement.endDisplay) {
            inventoryElement.endDisplay = inventoryElement.endDisplay - inventoryElement.endCorrection;
            inventoryElement.nextBtnEnabled = true;
            inventoryElement.nextBtnDisabled = false;
        } else {
            inventoryElement.endDisplay = inventoryElement.endDisplay - inventoryElement.limit + 1;
        }
        itemType = returnItemTypeActive();
        stockType = returnStockType();
        var promise = dboticaServices.getItemsOfTheTable(inventoryElement.startDisplay - 1, inventoryElement.limit, stockType, itemType, organizationId);
        promise.then(function(response) {
            inventoryElement.loading = true;
            $log.log("in prev btn response----", response.data.response);
            var previousBtnFetchedItemsObject = $.parseJSON(response.data.response);
            var previousBtnFetchedItems = previousBtnFetchedItemsObject.inventoryItems;
            inventoryElement.itemsDisplayArray = previousBtnFetchedItems.slice(0, previousBtnFetchedItems.length - 1);
            inventoryElement.loading = false;
        }, function(errorResponse) {
            inventoryElement.loading = true;
            $log.log("in previous button error response");
        });
    }


    function addItem() {
        inventoryElement.addItemObject = {};
        inventoryElement.addItemObject.itemType = "DRUG";
        inventoryElement.addItemObject.organizationId = organizationId;

    }

    function addItemIntoStock() {
        var promise = dboticaServices.addItemIntoStock(inventoryElement.addItemObject);
        promise.then(function(response) {
            inventoryElement.loading = true;
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
            inventoryElement.itemsDisplayArray.push(drugObject);
            inventoryElement.totalDrugsCount = inventoryElement.totalDrugsCount + 1;
            $log.log("items array-----", inventoryElement.itemsDisplayArray);
            inventoryElement.loading = false;
        }, function(errorResponse) {
            inventoryElement.loading = true;
            $log.log("Error in add item into stock");
        });
    }

    function additionOfBatch(item) {
        inventoryElement.addBatch = {};
        inventoryElement.warningMessage = false;
        inventoryElement.addBatch.organizationId = item.organizationId;
        inventoryElement.addBatch.itemName = item.itemName;
        itemSelectedForAddingBatch = item;
    }

    function viewInfo(item) {
        dboticaServices.setItemSelected(item);
        $state.go('home.itemInfo');
    }

    function addBatchForSelectedItem() {
        var requestEntity = {};
        if (inventoryElement.addBatch.units == undefined || inventoryElement.addBatch.expiryDate == undefined) {
            inventoryElement.warningMessage = true;
        } else {
            requestEntity.organizationId = itemSelectedForAddingBatch.organizationId;
            requestEntity.batchNo = inventoryElement.addBatch.batchNumber;
            requestEntity.itemId = itemSelectedForAddingBatch.id;
            requestEntity.costPrice = inventoryElement.addBatch.costPrice * 100;
            requestEntity.units = inventoryElement.addBatch.units;
            requestEntity.consumedUnits = 0;
            var dateSelectedForBatch = inventoryElement.addBatch.expiryDate;
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
                inventoryElement.loading = true;
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
                for (itemIndex = 0; itemIndex < inventoryElement.itemsDisplayArray.length; itemIndex++) {
                    if (inventoryElement.itemsDisplayArray[itemIndex].id === itemObject.itemId) {
                        inventoryElement.itemsDisplayArray[itemIndex].availableStock += itemObject.units;
                    }
                }
                $log.log("array after adding batch is-----", inventoryElement.itemsDisplayArray);
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = true;
            });
        }
    }

    function viewLowItemsSelect() {
        if (inventoryElement.isLowBlueActive) {
            var itemType = "";
            inventoryElement.isLowBlueActive = false;
            inventoryElement.isLowRedActive = true;
            inventoryElement.isAllRedActive = false;
            inventoryElement.isExpiredRedActive = false;
            inventoryElement.isAllBlueActive = true;
            inventoryElement.isExpiredBlueActive = true;
            inventoryElement.startDisplay = inventoryElement.start + 1;
            inventoryElement.endDisplay = displayListLength;
            itemType = returnItemTypeActive();
            var promise = dboticaServices.lowStockExpiredStockItems("lowItems", inventoryElement.start, inventoryElement.limit, itemType, organizationId);
            promise.then(function(response) {
                inventoryElement.loading = true;
                itemsDisplayFunction(response);
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = true;
                $log.log("in error response of low items view----");
            });
        }
    }

    function viewAllItemsSelect() {
        if (inventoryElement.isAllBlueActive) {
            var itemType = "";
            var stockType = "";
            inventoryElement.isAllBlueActive = false;
            inventoryElement.isAllRedActive = true;
            inventoryElement.isLowBlueActive = true;
            inventoryElement.isLowRedActive = false;
            inventoryElement.isExpiredBlueActive = true;
            inventoryElement.isExpiredRedActive = false;
            inventoryElement.startDisplay = inventoryElement.start + 1;
            inventoryElement.endDisplay = displayListLength;
            itemType = returnItemTypeActive();
            stockType = returnStockType();
            var promise = dboticaServices.getItemsOfTheTable(inventoryElement.start, inventoryElement.limit, stockType, itemType, organizationId);
            promise.then(function(response) {
                inventoryElement.loading = true;
                itemsDisplayFunction(response);
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = true;
                $log.log("in error response of view all items---");
            });
        }
    }

    function viewExpiredItemsSelect() {
        if (inventoryElement.isExpiredBlueActive) {
            var itemType = "";
            inventoryElement.isExpiredBlueActive = false;
            inventoryElement.isExpiredRedActive = true;
            inventoryElement.isAllRedActive = false;
            inventoryElement.isAllBlueActive = true;
            inventoryElement.isLowRedActive = false;
            inventoryElement.isLowBlueActive = true;
            inventoryElement.startDisplay = inventoryElement.start + 1;
            inventoryElement.endDisplay = displayListLength;
            itemType = returnItemTypeActive();
            var promise = dboticaServices.lowStockExpiredStockItems("expiredStockItems", inventoryElement.start, inventoryElement.limit, itemType, organizationId);
            promise.then(function(response) {
                inventoryElement.loading = true;
                itemsDisplayFunction(response);
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = true;
                $log.log("in error response of view expired items---");
            });
        }
    }

    function itemSearchFromDB() {
        if (inventoryElement.itemSearch.itemName !== "") {
            inventoryElement.prevNextBtnsRow = false;
            inventoryElement.viewAllItemsBtn = true;
            $log.log("item to be searched is------", inventoryElement.itemSearch.itemName);
            var promise = dboticaServices.getItemFromDB(inventoryElement.itemSearch.itemName, organizationId);
            promise.then(function(response) {
                inventoryElement.loading = true;
                $log.log("response after search is---------", response);
                var itemSearchResponse = $.parseJSON(response.data.response);
                inventoryElement.itemsDisplayArray = itemSearchResponse.inventoryItems;
                if (itemSearchResponse.totalCount === 0) {
                    inventoryElement.warning = true;
                } else {
                    inventoryElement.warning = false;
                }
                $log.log("response for search is----", itemSearchResponse);
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = true;
                $log.log("in error Response of item search from db");
            });
        }
    }

    function viewAllItems() {
        inventoryElement.warning = false;
        inventoryElement.startDisplay = inventoryElement.start + 1;
        inventoryElement.endDisplay = displayListLength;
        var promise = dboticaServices.getItemsOfTheTable(inventoryElement.start, inventoryElement.limit, 'All', 'All', organizationId);
        promise.then(function(response) {
            inventoryElement.loading = true;
            itemsDisplayFunction(response);
            inventoryElement.itemSearch.itemName = "";
            inventoryElement.viewAllItemsBtn = false;
            inventoryElement.prevNextBtnsRow = true;
            inventoryElement.loading = false;
        }, function(errorResponse) {
            inventoryElement.loading = true;
            $log.log("in error response of view all items");
        });
    }

    function viewAllInventoryItems() {
        if (inventoryElement.isAllTypeBlueActive) {
            var stockType = "";
            inventoryElement.startDisplay = inventoryElement.start + 1;
            inventoryElement.endDisplay = displayListLength;
            inventoryElement.isAllTypeBlueActive = false;
            inventoryElement.isAllTypeActive = true;
            inventoryElement.isDrugTypeBlueActive = true;
            inventoryElement.isDrugTypeActive = false;
            inventoryElement.isEquipmentsTypeBlueActive = true;
            inventoryElement.isEquipmentsTypeActive = false;
            inventoryElement.isSuppliesTypeBlueActive = true;
            inventoryElement.isSuppliesTypeActive = false;
            inventoryElement.isOthersTypeBlueActive = true;
            inventoryElement.isOthersTypeActive = false;
            stockType = returnStockType();
            var promise = dboticaServices.getStockItemsForTheTable("All", inventoryElement.start, inventoryElement.limit, stockType, organizationId);
            promise.then(function(response) {
                inventoryElement.loading = true;
                itemsDisplayFunction(response);
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = true;
                $log.log("in error response of view all inventory items---");
            });
        }
    }

    function viewDrugInventoryItems() {
        if (inventoryElement.isDrugTypeBlueActive) {
            var stockType = "";
            inventoryElement.startDisplay = inventoryElement.start + 1;
            inventoryElement.endDisplay = displayListLength;
            inventoryElement.isAllTypeBlueActive = true;
            inventoryElement.isAllTypeActive = false;
            inventoryElement.isDrugTypeBlueActive = false;
            inventoryElement.isDrugTypeActive = true;
            inventoryElement.isEquipmentsTypeBlueActive = true;
            inventoryElement.isEquipmentsTypeActive = false;
            inventoryElement.isSuppliesTypeBlueActive = true;
            inventoryElement.isSuppliesTypeActive = false;
            inventoryElement.isOthersTypeBlueActive = true;
            inventoryElement.isOthersTypeActive = false;
            stockType = returnStockType();
            var promise = dboticaServices.getStockItemsForTheTable("DrugItems", inventoryElement.start, inventoryElement.limit, stockType, organizationId);
            promise.then(function(response) {
                inventoryElement.loading = true;
                itemsDisplayFunction(response);
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = true;
                $log.log("in error response of view drug inventory items---");
            });
        }

    }

    function viewSuppliesInventoryItems() {
        if (inventoryElement.isSuppliesTypeBlueActive) {
            var stockType = "";
            inventoryElement.startDisplay = inventoryElement.start + 1;
            inventoryElement.endDisplay = displayListLength;
            inventoryElement.isAllTypeBlueActive = true;
            inventoryElement.isAllTypeActive = false;
            inventoryElement.isDrugTypeBlueActive = true;
            inventoryElement.isDrugTypeActive = false;
            inventoryElement.isEquipmentsTypeBlueActive = true;
            inventoryElement.isEquipmentsTypeActive = false;
            inventoryElement.isSuppliesTypeBlueActive = false;
            inventoryElement.isSuppliesTypeActive = true;
            inventoryElement.isOthersTypeBlueActive = true;
            inventoryElement.isOthersTypeActive = false;
            stockType = returnStockType();
            var promise = dboticaServices.getStockItemsForTheTable("SuppliesItems", inventoryElement.start, inventoryElement.limit, stockType, organizationId);
            promise.then(function(response) {
                inventoryElement.loading = true;
                itemsDisplayFunction(response);
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = true;
                $log.log("in error response of view supplies inventory  items---");
            });
        }
    }

    function viewEquipmentsInventoryItems() {
        if (inventoryElement.isEquipmentsTypeBlueActive) {
            var stockType = "";
            $log.log("in equipment---");
            inventoryElement.isAllTypeBlueActive = true;
            inventoryElement.isAllTypeActive = false;
            inventoryElement.isDrugTypeBlueActive = true;
            inventoryElement.isDrugTypeActive = false;
            inventoryElement.isEquipmentsTypeBlueActive = false;
            inventoryElement.isEquipmentsTypeActive = true;
            inventoryElement.isSuppliesTypeBlueActive = true;
            inventoryElement.isSuppliesTypeActive = false;
            inventoryElement.isOthersTypeBlueActive = true;
            inventoryElement.isOthersTypeActive = false;
            stockType = returnStockType();
            inventoryElement.startDisplay = inventoryElement.start + 1;
            inventoryElement.endDisplay = displayListLength;
            var promise = dboticaServices.getStockItemsForTheTable("EquipmentItems", inventoryElement.start, inventoryElement.limit, stockType, organizationId);
            promise.then(function(response) {
                inventoryElement.loading = true;
                itemsDisplayFunction(response);
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = true;
                $log.log("in error response of view equipments inventory items---");
            });
        }
    }

    function viewOthersInventoryItems() {
        if (inventoryElement.isOthersTypeBlueActive) {
            var stockType = "";
            inventoryElement.isAllTypeBlueActive = true;
            inventoryElement.isAllTypeActive = false;
            inventoryElement.isDrugTypeBlueActive = true;
            inventoryElement.isDrugTypeActive = false;
            inventoryElement.isEquipmentsTypeBlueActive = true;
            inventoryElement.isEquipmentsTypeActive = false;
            inventoryElement.isSuppliesTypeBlueActive = true;
            inventoryElement.isSuppliesTypeActive = false;
            inventoryElement.isOthersTypeBlueActive = false;
            inventoryElement.isOthersTypeActive = true;
            stockType = returnStockType();
            $log.log("stock type is----", stockType);
            var promise = dboticaServices.getStockItemsForTheTable("OtherItems", inventoryElement.start, inventoryElement.limit, stockType, organizationId);
            promise.then(function(response) {
                inventoryElement.loading = true;
                itemsDisplayFunction(response);
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = true;
                $log.log("in error response of view others inventory  items---");
            });
        }
    }

    var itemsDisplayFunction = function(response) {
        var errorCode = response.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            $log.log(response.data.response);
            var itemsFetchedFromApi = $.parseJSON(response.data.response);
            $log.log("items fetched from Api----", itemsFetchedFromApi.inventoryItems);
            inventoryElement.totalDrugsCount = itemsFetchedFromApi.totalCount;
            var itemsFetchedFromApiFromStart = itemsFetchedFromApi.inventoryItems;
            if (itemsFetchedFromApiFromStart.length >= displayListLength) {
                $log.log("in greater than length-----");
                if (itemsFetchedFromApiFromStart.length == displayListLength) {
                    inventoryElement.prevBtnDisabled = true;
                    inventoryElement.nextBtnDisabled = true;
                    inventoryElement.prevBtnEnabled = false;
                    inventoryElement.nextBtnEnabled = false;
                    inventoryElement.itemsDisplayArray = itemsFetchedFromApiFromStart;
                } else {
                    inventoryElement.prevBtnDisabled = true;
                    inventoryElement.nextBtnDisabled = false;
                    inventoryElement.prevBtnEnabled = false;
                    inventoryElement.nextBtnEnabled = true;
                    inventoryElement.itemsDisplayArray = itemsFetchedFromApiFromStart.slice(0, itemsFetchedFromApiFromStart.length - 1);
                }
            } else {
                $log.log("in not display");
                inventoryElement.prevBtnEnabled = false;
                inventoryElement.nextBtnEnabled = false;
                inventoryElement.prevBtnDisabled = true;
                inventoryElement.nextBtnDisabled = true;
                inventoryElement.endDisplay = itemsFetchedFromApiFromStart.length;
                inventoryElement.itemsDisplayArray = itemsFetchedFromApiFromStart;
            }
        }
    }

    var returnItemTypeActive = function() {
        var itemType = "";
        if (inventoryElement.isDrugTypeActive) {
            itemType = "Drug";
        }
        if (inventoryElement.isEquipmentsTypeActive) {
            itemType = "Equipments";
        }
        if (inventoryElement.isSuppliesTypeActive) {
            itemType = "Supplies";
        }
        if (inventoryElement.isAllTypeActive) {
            $log.log("in alll---");
            itemType = "All";
        }
        if (inventoryElement.isOthersTypeActive) {
            itemType = "Others";
        }
        return itemType;
    }

    var returnStockType = function() {
        var stockType = "";
        if (inventoryElement.isAllRedActive) {
            stockType = "All";
        }
        if (inventoryElement.isLowRedActive) {
            stockType = "Low";
        }
        if (inventoryElement.isExpiredRedActive) {
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
