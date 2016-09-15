angular.module('personalAssistant').controller('itemInfoCtrl', itemInfoCtrl);
itemInfoCtrl.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function itemInfoCtrl($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    sessionStorage.setItem("currentState", "itemInfo");

    var itemInfoElement = this;

    angular.element("#addBatchExpiryTimeItemInfo").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0,
        changeMonth: true,
        changeYear: true
    });

    itemInfoElement.backToItems = backToItems;
    itemInfoElement.updateBatch = updateBatch;
    itemInfoElement.stateChanged = stateChanged;

    itemInfoElement.addBatchForSelectedItemInItemInfo = addBatchForSelectedItemInItemInfo;
    itemInfoElement.updateItem = updateItem;
    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);

    var itemSelected;
    itemInfoElement.itemInactive = false;
    itemInfoElement.batches = {};
    var batchesInfo = [];
    itemInfoElement.loading = false;
    itemInfoElement.inventoryItemSelected = {};
    itemInfoElement.itemDetailsUpdateError = false;
    itemInfoElement.blurScreen = false;
    itemInfoElement.disableSelectBox = false;
    itemInfoElement.disableSelectBoxInTable = false;
    itemInfoElement.warningMessageItemInfo = false;
    itemInfoElement.updateItemDetails = false;
    itemInfoElement.updateItemDetailsInTheTable = false;
    itemInfoElement.addBatchInItemInfo = {};
    itemInfoElement.informationOfBatches = [];
    itemSelected = dboticaServices.getSelectedItem();
    if (itemSelected !== undefined) {
        sessionStorage.setItem('currentItemId', itemSelected.id);
        sessionStorage.setItem('organizationId', itemSelected.organizationId);
        sessionStorage.setItem('itemName', itemSelected.itemName);
        sessionStorage.setItem('itemEntityState', itemSelected.state);
    }
    var currentItemId = sessionStorage.getItem('currentItemId');
    var organizationId = sessionStorage.getItem('organizationId');
    var itemName = sessionStorage.getItem('itemName');
    var itemEntityState = sessionStorage.getItem('itemEntityState');
    itemInfoElement.addBatchInItemInfo.itemName = itemName;
    itemInfoElement.addBatchInItemInfo.organizationId = organizationId;
    if (itemEntityState == "ACTIVE") {
        itemInfoElement.itemInactive = false;
    } else {
        itemInfoElement.itemInactive = true;
    }
    itemInfoElement.loading = true;
    itemInfoElement.blurScreen = true;
    var promise = dboticaServices.getAllBatches(currentItemId, organizationId);
    promise.then(function(response) {
        angular.element('#mainInventoryLiActive').addClass('activeAdminLi');
        var errorCode = response.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var batchesInfo = angular.fromJson(response.data.response);
            itemInfoElement.inventoryItem = batchesInfo.inventoryItem;
            batchesInfo = batchesInfo.batchInfos;
            if (itemInfoElement.inventoryItem.state == "INACTIVE") {
                itemInfoElement.itemInactive = true;
                itemInfoElement.itemDetailsUpdateError = true;
                itemInfoElement.textBoxFreeze = true;
                itemInfoElement.updateItemDetails = true;
                itemInfoElement.updateItemDetailsInTheTable = true;
                itemInfoElement.disableSelectBox = true;
                itemInfoElement.disableSelectBoxInTable = true;
            } else {
                itemInfoElement.itemInactive = false;
            }
            angular.forEach(batchesInfo, function(batchesInfoEntity) {
                var newObject = {};
                newObject.id = batchesInfoEntity.id;
                newObject.organizationId = batchesInfoEntity.organizationId;
                newObject.batchNo = batchesInfoEntity.batchNo;
                newObject.expiryTime = batchesInfoEntity.expiryTime;
                newObject.availableStock = batchesInfoEntity.units;
                newObject.totalStock = batchesInfoEntity.units;
                if (batchesInfoEntity.hasOwnProperty('consumedUnits')) {
                    newObject.consumedUnits = batchesInfoEntity.consumedUnits;
                    newObject.totalStock += batchesInfoEntity.consumedUnits;
                } else {
                    newObject.consumedUnits = 0;
                }
                if (batchesInfoEntity.hasOwnProperty('expiredUnits')) {
                    newObject.expiredUnits = batchesInfoEntity.expiredUnits;
                    newObject.totalStock += batchesInfoEntity.expiredUnits;
                } else {
                    newObject.expiredUnits = 0;
                }
                if (batchesInfoEntity.hasOwnProperty('returnedUnits')) {
                    newObject.returnedUnits = batchesInfoEntity.returnedUnits;
                    newObject.totalStock += batchesInfoEntity.returnedUnits;
                } else {
                    newObject.returnedUnits = 0;
                }
                itemInfoElement.informationOfBatches.push(newObject);
            });
        }
        itemInfoElement.loading = false;
        itemInfoElement.blurScreen = false;
    }, function(errorResponse) {
        itemInfoElement.blurScreen = false;
        itemInfoElement.loading = false;
        dboticaServices.noConnectivityError();
    });

    function backToItems() {
        $state.go('home.inventory');
    }

    function stateChanged() {
        var requestEntity = {};
        requestEntity.id = currentItemId;
        requestEntity.organizationId = organizationId;
        var getItemPromise = dboticaServices.getAllBatches(currentItemId, organizationId);
        getItemPromise.then(function(getItemSuccess) {
            var errorCode = getItemSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var errorCode = getItemSuccess.data.errorCode;
                var success = getItemSuccess.data.success;
                if (errorCode == null && success === true) {
                    var item = angular.fromJson(getItemSuccess.data.response);
                    var itemRequestObject = item.inventoryItem;
                    itemInfoElement.inventoryItem = item.inventoryItem;
                    if (itemInfoElement.itemInactive === true) {
                        itemInfoElement.textBoxFreeze = true;
                        itemInfoElement.updateItemDetails = true;
                        itemInfoElement.updateItemDetailsInTheTable = true;
                        itemInfoElement.disableSelectBox = true;
                        itemInfoElement.disableSelectBoxInTable = true;
                        itemInfoElement.itemDetailsUpdateError = true;
                        itemRequestObject.state = "INACTIVE";
                    } else {
                        itemInfoElement.textBoxFreeze = false;
                        itemInfoElement.updateItemDetails = false;
                        itemInfoElement.updateItemDetailsInTheTable = false;
                        itemInfoElement.disableSelectBox = false;
                        itemInfoElement.disableSelectBoxInTable = false;
                        itemInfoElement.itemDetailsUpdateError = false;
                        itemRequestObject.state = "ACTIVE";
                    }
                    var itemInactivePromise = dboticaServices.addItemIntoStock(itemRequestObject);
                    itemInactivePromise.then(function(itemInactiveSuccess) {}, function(itemInactiveError) {});
                }
            }
        }, function(getItemError) {

        });
    }

    function updateItem() {
        var itemUpdatePromise = dboticaServices.addItemIntoStock(itemInfoElement.inventoryItem);
        itemUpdatePromise.then(function(itemUpdateSuccessResponse) {
            var errorCode = itemUpdateSuccessResponse.data.errorCode;
            var success = itemUpdateSuccessResponse.data.success;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                if (errorCode == null && success == true) {
                    dboticaServices.itemUpdateSuccessSwal();
                }
            }
        }, function(itemUpdateErrorResponse) {
            dboticaServices.noConnectivityError();
        });
    }

    function updateBatch(item, index) {
        $log.log('batch for update is-----', item);
        var idOfTheTextBox = "#batchTextBoxes" + index;
        var idOfTheSelectBox = "#batchSelectBoxes" + index;
        var valueInTextBox = angular.element(idOfTheTextBox).val();
        var valueInSelectBox = angular.element(idOfTheSelectBox).val();
        var requestEntity = {};
        requestEntity.batchId = item.id;
        requestEntity.organizationId = item.organizationId;
        requestEntity.batchState = valueInSelectBox;
        requestEntity.units = valueInTextBox;
        if (parseInt(valueInTextBox) <= item.availableStock) {
            requestEntity = JSON.stringify(requestEntity);
            itemInfoElement.loading = true;
            var promise = dboticaServices.updateTheBatch(requestEntity);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var updatedBatchInfo = angular.fromJson(response.data.response);
                    angular.forEach(itemInfoElement.informationOfBatches, function(batchEntity) {
                        if (batchEntity.id == updatedBatchInfo.id) {
                            batchEntity.availableStock = updatedBatchInfo.units;
                            batchEntity.totalStock = updatedBatchInfo.units;
                            if (updatedBatchInfo.hasOwnProperty('consumedUnits')) {
                                batchEntity.consumedUnits = updatedBatchInfo.consumedUnits;
                                batchEntity.totalStock += updatedBatchInfo.consumedUnits;
                            }
                            if (updatedBatchInfo.hasOwnProperty('expiredUnits')) {
                                batchEntity.expiredUnits = updatedBatchInfo.expiredUnits;
                                batchEntity.totalStock += updatedBatchInfo.expiredUnits;
                            }
                            if (updatedBatchInfo.hasOwnProperty('returnedUnits')) {
                                batchEntity.returnedUnits = updatedBatchInfo.returnedUnits;
                                batchEntity.totalStock += updatedBatchInfo.returnedUnits;
                            }
                        }
                    });
                }
                itemInfoElement.loading = false;
            }, function(errorResponse) {
                itemInfoElement.loading = false;
                dboticaServices.noConnectivityError();
            });
        } else {
            dboticaServices.itemsCountErrorSwal();
        }
        angular.element(idOfTheTextBox).val('');
    }

    function addBatchForSelectedItemInItemInfo() {
        var requestEntity = {};
        if (itemInfoElement.addBatchInItemInfo.units == undefined || itemInfoElement.addBatchInItemInfo.expiryDate == undefined) {
            itemInfoElement.warningMessageItemInfo = true;
        } else {
            requestEntity.organizationId = organizationId;
            requestEntity.batchNo = itemInfoElement.addBatchInItemInfo.batchNumber;
            requestEntity.itemId = currentItemId;
            requestEntity.costPrice = itemInfoElement.addBatchInItemInfo.costPrice * 100;
            requestEntity.units = itemInfoElement.addBatchInItemInfo.units;
            requestEntity.consumedUnits = 0;
            var dateSelectedForBatch = itemInfoElement.addBatchInItemInfo.expiryDate;
            var dateSelectedArray = dateSelectedForBatch.split('/');
            dateSelectedForBatch = dateSelectedArray[1] + '/' + dateSelectedArray[0] + '/' + dateSelectedArray[2];
            dateSelectedForBatch = new Date(dateSelectedForBatch);
            dateSelectedForBatch = dateSelectedForBatch.getTime();
            requestEntity.expiryTime = dateSelectedForBatch;
            requestEntity.batchState = "ACTIVE";
            requestEntity.state = "ACTIVE";
            requestEntity = JSON.stringify(requestEntity);
            itemInfoElement.loading = true;
            var promise = dboticaServices.addBatchToTheDrug(requestEntity);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var success = response.data.success;
                    if (success) {
                        dboticaServices.addBatchFromItemInfo();
                    }
                    var itemObject = angular.fromJson(response.data.response);
                    var newObject = {};
                    newObject.id = itemObject.id;
                    newObject.organizationId = itemObject.organizationId;
                    newObject.batchNo = itemObject.batchNo;
                    newObject.expiryTime = itemObject.expiryTime;
                    newObject.availableStock = itemObject.units;
                    newObject.totalStock = itemObject.units;
                    newObject.consumedUnits = 0;
                    newObject.returnedUnits = 0;
                    newObject.expiredUnits = 0;
                    itemInfoElement.informationOfBatches.push(newObject);
                }
                itemInfoElement.loading = false;
            }, function(errorResponse) {
                itemInfoElement.loading = false;
                dboticaServices.noConnectivityError();
            });
        }
    }
};
