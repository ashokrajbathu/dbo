angular.module('personalAssistant').controller('inventoryCtrl', ['$scope', '$log', '$timeout', '$filter', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, $timeout, $filter, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
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
    inventoryElement.drugItemSearch = drugItemSearch;

    inventoryElement.loading = false;
    inventoryElement.drugsToBeDisplayedInDropdown = [];
    var drugs = [];
    var drugsList = [];
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
    inventoryElement.limit = 4;
    var displayListLength = 3;
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

    inventoryElement.loading = true;
    var promise = dboticaServices.getItemsOfTheTable(inventoryElement.start, inventoryElement.limit, "All", "All", organizationId);
    promise.then(function(response) {
        var errorCode = response.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            itemsDisplayFunction(response);
        }
        inventoryElement.loading = false;
    }, function(errorResponse) {
        inventoryElement.loading = false;
        dboticaServices.noConnectivityError();
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
                inventoryElement.endCorrection = inventoryElement.totalDrugsCount - inventoryElement.endDisplay;
                inventoryElement.endDisplay = inventoryElement.totalDrugsCount;
                inventoryElement.nextBtnEnabled = false;
                inventoryElement.nextBtnDisabled = true;
                limit = inventoryElement.endCorrection + 1;
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
        inventoryElement.loading = true;
        var promise = dboticaServices.getItemsOfTheTable(inventoryElement.startDisplay - 1, limit, stockType, itemType, organizationId);
        promise.then(function(response) {
            var errorCode = response.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var nextBtnFetchedItemsObject = angular.fromJson(response.data.response);
                var nextBtnFetchedItems = nextBtnFetchedItemsObject.inventoryItems;
                if (nextBtnFetchedItems.length > displayListLength) {
                    inventoryElement.itemsDisplayArray = nextBtnFetchedItems.slice(0, nextBtnFetchedItems.length - 1);
                } else {
                    inventoryElement.itemsDisplayArray = nextBtnFetchedItems;
                }

            }
            inventoryElement.loading = false;
        }, function(errorResponse) {

            inventoryElement.loading = false;
            dboticaServices.noConnectivityError();
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
        inventoryElement.loading = true;
        var promise = dboticaServices.getItemsOfTheTable(inventoryElement.startDisplay - 1, inventoryElement.limit, stockType, itemType, organizationId);
        promise.then(function(response) {
            var errorCode = response.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var previousBtnFetchedItemsObject = angular.fromJson(response.data.response);
                var previousBtnFetchedItems = previousBtnFetchedItemsObject.inventoryItems;
                inventoryElement.itemsDisplayArray = previousBtnFetchedItems.slice(0, previousBtnFetchedItems.length - 1);
            }
            inventoryElement.loading = false;
        }, function(errorResponse) {
            inventoryElement.loading = false;
            dboticaServices.noConnectivityError();
        });
    }


    function addItem() {
        inventoryElement.addItemObject = {};
        inventoryElement.addItemObject.itemType = "DRUG";
        inventoryElement.addItemObject.organizationId = organizationId;
    }

    function addItemIntoStock() {
        inventoryElement.loading = true;
        var promise = dboticaServices.addItemIntoStock(inventoryElement.addItemObject);
        promise.then(function(response) {
            var errorCode = response.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var success = response.data.success;
                if (success) {
                    dboticaServices.itemAdditionIntoStockSuccessSwal();
                    var drugObject = angular.fromJson(response.data.response);
                    if (inventoryElement.itemsDisplayArray.length + 1 <= displayListLength) {
                        inventoryElement.itemsDisplayArray.push(drugObject);
                        if (inventoryElement.prevBtnDisabled === true && inventoryElement.nextBtnDisabled === true) {
                            inventoryElement.startDisplay = 1;
                            inventoryElement.endDisplay = inventoryElement.endDisplay + 1;
                        }
                    } else {
                        inventoryElement.itemsDisplayArray.unshift(drugObject);
                        inventoryElement.itemsDisplayArray.pop();
                        inventoryElement.nextBtnDisabled = false;
                        inventoryElement.nextBtnEnabled = true;
                    }
                    inventoryElement.totalDrugsCount = inventoryElement.totalDrugsCount + 1;
                } else {
                    dboticaServices.itemAdditionIntoStockUnsuccessfullSwal();
                }
            }
            inventoryElement.loading = false;
        }, function(errorResponse) {
            inventoryElement.loading = false;
            dboticaServices.noConnectivityError();
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
            requestEntity.state = "ACTIVE";
            requestEntity = JSON.stringify(requestEntity);
            inventoryElement.loading = true;
            var promise = dboticaServices.addBatchToTheDrug(requestEntity);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var success = response.data.success;
                    if (success) {
                        dboticaServices.batchAdditionForItemSuccessSwal();
                        var itemObject = angular.fromJson(response.data.response);
                        angular.forEach(inventoryElement.itemsDisplayArray, function(itemsDisplayArrayElement) {
                            if (itemsDisplayArrayElement.id === itemObject.itemId) {
                                itemsDisplayArrayElement.availableStock += itemObject.units;
                            }
                        });
                    } else {
                        dboticaServices.batchAdditionForItemUnsuccessSwal();
                    }
                }
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = false;
                dboticaServices.noConnectivityError();
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
            inventoryElement.loading = true;
            var promise = dboticaServices.lowStockExpiredStockItems("lowItems", inventoryElement.start, inventoryElement.limit, itemType, organizationId);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    itemsDisplayFunction(response);
                }
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = false;
                dboticaServices.noConnectivityError();
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
            inventoryElement.loading = true;
            var promise = dboticaServices.getItemsOfTheTable(inventoryElement.start, inventoryElement.limit, stockType, itemType, organizationId);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    itemsDisplayFunction(response);
                }
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = false;
                dboticaServices.noConnectivityError();
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
            inventoryElement.loading = true;
            var promise = dboticaServices.lowStockExpiredStockItems("expiredStockItems", inventoryElement.start, inventoryElement.limit, itemType, organizationId);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    itemsDisplayFunction(response);
                }
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = false;
                dboticaServices.noConnectivityError();
            });
        }
    }

    function itemSearchFromDB() {
        if (inventoryElement.itemSearch.itemName !== "") {
            inventoryElement.prevNextBtnsRow = false;
            inventoryElement.viewAllItemsBtn = true;
            inventoryElement.loading = true;
            var promise = dboticaServices.getItemFromDB(inventoryElement.itemSearch.itemName, organizationId);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var itemSearchResponse = angular.fromJson(response.data.response);
                    inventoryElement.itemsDisplayArray = itemSearchResponse.inventoryItems;
                    if (itemSearchResponse.totalCount === 0) {
                        inventoryElement.warning = true;
                    } else {
                        inventoryElement.warning = false;
                    }
                }
                inventoryElement.loading = false;
            }, function(errorResponse) {

                inventoryElement.loading = false;
                dboticaServices.noConnectivityError();
            });
        }
    }

    function viewAllItems() {
        inventoryElement.warning = false;
        inventoryElement.startDisplay = inventoryElement.start + 1;
        inventoryElement.endDisplay = displayListLength;
        inventoryElement.loading = true;
        var promise = dboticaServices.getItemsOfTheTable(inventoryElement.start, inventoryElement.limit, 'All', 'All', organizationId);
        promise.then(function(response) {
            var errorCode = response.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                itemsDisplayFunction(response);
                inventoryElement.itemSearch.itemName = "";
                inventoryElement.viewAllItemsBtn = false;
                inventoryElement.prevNextBtnsRow = true;
            }
            inventoryElement.loading = false;
        }, function(errorResponse) {

            inventoryElement.loading = false;
            dboticaServices.noConnectivityError();
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
            inventoryElement.loading = true;
            var promise = dboticaServices.getStockItemsForTheTable("All", inventoryElement.start, inventoryElement.limit, stockType, organizationId);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    itemsDisplayFunction(response);
                }
                inventoryElement.loading = false;
            }, function(errorResponse) {

                inventoryElement.loading = false;
                dboticaServices.noConnectivityError();
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
            inventoryElement.loading = true;
            var promise = dboticaServices.getStockItemsForTheTable("DrugItems", inventoryElement.start, inventoryElement.limit, stockType, organizationId);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    itemsDisplayFunction(response);
                }
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = false;
                dboticaServices.noConnectivityError();
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
            inventoryElement.loading = true;
            var promise = dboticaServices.getStockItemsForTheTable("SuppliesItems", inventoryElement.start, inventoryElement.limit, stockType, organizationId);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    itemsDisplayFunction(response);
                }
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = false;
                dboticaServices.noConnectivityError();
            });
        }
    }

    function viewEquipmentsInventoryItems() {
        if (inventoryElement.isEquipmentsTypeBlueActive) {
            var stockType = "";
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
            inventoryElement.loading = true;
            var promise = dboticaServices.getStockItemsForTheTable("EquipmentItems", inventoryElement.start, inventoryElement.limit, stockType, organizationId);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    itemsDisplayFunction(response);
                }
                inventoryElement.loading = false;
            }, function(errorResponse) {

                inventoryElement.loading = false;
                dboticaServices.noConnectivityError();
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
            inventoryElement.loading = true;
            var promise = dboticaServices.getStockItemsForTheTable("OtherItems", inventoryElement.start, inventoryElement.limit, stockType, organizationId);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    itemsDisplayFunction(response);
                }
                inventoryElement.loading = false;
            }, function(errorResponse) {
                inventoryElement.loading = false;
                dboticaServices.noConnectivityError();
            });
        }
    }

    var itemsDisplayFunction = function(response) {
        var errorCode = response.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var itemsFetchedFromApi = angular.fromJson(response.data.response);
            inventoryElement.totalDrugsCount = itemsFetchedFromApi.totalCount;
            var itemsFetchedFromApiFromStart = itemsFetchedFromApi.inventoryItems;
            if (itemsFetchedFromApiFromStart.length >= displayListLength) {
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
                inventoryElement.prevBtnEnabled = false;
                inventoryElement.nextBtnEnabled = false;
                inventoryElement.prevBtnDisabled = true;
                inventoryElement.nextBtnDisabled = true;
                inventoryElement.endDisplay = itemsFetchedFromApiFromStart.length;
                if (itemsFetchedFromApiFromStart.length == 0) {
                    inventoryElement.startDisplay = 0;
                }
                inventoryElement.itemsDisplayArray = itemsFetchedFromApiFromStart;
            }
        }
    }

    function drugItemSearch() {
        inventoryElement.drugsToBeDisplayedInDropdown.length = 0;
        drugs.length = 0;
        drugsList.length = 0;
        if (inventoryElement.addItemObject.itemName.length > 1) {
            var getDrugsPromise = dboticaServices.getDrugsFromDb(0, 20, inventoryElement.addItemObject.itemName);
            getDrugsPromise.then(function(getDrugSuccess) {
                drugs = angular.fromJson(getDrugSuccess.data.response);
                angular.forEach(drugs, function(drugElement) {
                    var drugEntity = {};
                    drugEntity.name = drugElement.brandName;
                    drugsList.push(drugEntity);
                });
                angular.copy(drugsList, inventoryElement.drugsToBeDisplayedInDropdown);
            }, function(getDrugErrorResponse) {});
        } else {
            inventoryElement.drugsToBeDisplayedInDropdown = [];
        }
    }

    /*angular.element('#inputItemNameInventory').autocomplete({
        source: function(request, callback) {
            var searchParam = request.term;
            //drugItemSearch(searchParam, callback);
            var result = [];
            result.push("dfcghjbn");
            callback(result);
        },
        minLength: 2,
        focus: function(event, ui) {
            event.preventDefault();
        },
        select: function(event, ui) {

        }

    });

    function getDropdownElementsOfDrug(drug) {

    }*/

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

    /*inventoryElement.drugsToBeDisplayedInDropdown = ['ravi', 'raviteja', 'bhisetti'];*/

    /*angular.module('personalAssistant').directive('inventorySelection', function(dboticaServices, $timeout, $log) {
        return {
            require: 'ngModel',
            restrict: 'A',
            controller: 'inventoryCtrl',
            controllerAs: 'inventory',
            bindToController: true,
            scope: { drp: '=' },
            link: function(scope, elem) {
                scope.$watch(function() {
                    $timeout(function() {
                        elem.autocomplete({
                            source: inventoryElement.drugsToBeDisplayedInDropdown,
                            minLength: 2,
                            select: function(event, ui) {
                                                            }
                        }, 5);
                    });
                });
            }
        };
    });*/

    angular.module('personalAssistant').filter("billingAndBatchConsumed", function() {
        return function(input) {
            var result;
            if (input == "") {
                result = 0;
            } else {
                result = input;
            }
            return result;
        };
    });
}]);
