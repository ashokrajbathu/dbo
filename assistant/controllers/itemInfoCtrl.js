angular.module('personalAssistant').controller('itemInfoCtrl', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "itemInfo");

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
    itemInfoElement.addBatchForSelectedItemInItemInfo = addBatchForSelectedItemInItemInfo;
    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);

    var itemSelected;
    itemInfoElement.batches = {};
    var batchesInfo = [];
    itemInfoElement.loading = false;
    itemInfoElement.blurScreen=false;
    itemInfoElement.warningMessageItemInfo = false;
    itemInfoElement.addBatchInItemInfo = {};
    itemInfoElement.informationOfBatches = [];
    itemSelected = dboticaServices.getSelectedItem();
    $log.log("selected item is----", itemSelected);
    if (itemSelected !== undefined) {
        localStorage.setItem('currentItemId', itemSelected.id);
        localStorage.setItem('organizationId', itemSelected.organizationId);
        localStorage.setItem('itemName', itemSelected.itemName);
    }
    var currentItemId = localStorage.getItem('currentItemId');
    var organizationId = localStorage.getItem('organizationId');
    var itemName = localStorage.getItem('itemName');
    itemInfoElement.addBatchInItemInfo.itemName = itemName;
    itemInfoElement.addBatchInItemInfo.organizationId = organizationId;
    itemInfoElement.loading = true;
    itemInfoElement.blurScreen=true;
    var promise = dboticaServices.getAllBatches(currentItemId, organizationId);
    promise.then(function(response) {
        var batchesInfo = $.parseJSON(response.data.response);
        $log.log("batches info is-----", batchesInfo);
        itemInfoElement.inventoryItem = batchesInfo.inventoryItem;
        batchesInfo = batchesInfo.batchInfos;
        for (var itemIndex = 0; itemIndex < batchesInfo.length; itemIndex++) {
            var newObject = {};
            newObject.id = batchesInfo[itemIndex].id;
            newObject.organizationId = batchesInfo[itemIndex].organizationId;
            newObject.batchNo = batchesInfo[itemIndex].batchNo;
            newObject.expiryTime = batchesInfo[itemIndex].expiryTime;
            newObject.availableStock = batchesInfo[itemIndex].units;
            newObject.totalStock = batchesInfo[itemIndex].units;
            if (batchesInfo[itemIndex].hasOwnProperty('consumedUnits')) {
                newObject.consumedUnits = batchesInfo[itemIndex].consumedUnits;
                newObject.totalStock += batchesInfo[itemIndex].consumedUnits;
            } else {
                newObject.consumedUnits = 0;
            }
            if (batchesInfo[itemIndex].hasOwnProperty('expiredUnits')) {
                newObject.expiredUnits = batchesInfo[itemIndex].expiredUnits;
                newObject.totalStock += batchesInfo[itemIndex].expiredUnits;
            } else {
                newObject.expiredUnits = 0;
            }
            if (batchesInfo[itemIndex].hasOwnProperty('returnedUnits')) {
                newObject.returnedUnits = batchesInfo[itemIndex].returnedUnits;
                newObject.totalStock += batchesInfo[itemIndex].returnedUnits;
            } else {
                newObject.returnedUnits = 0;
            }
            itemInfoElement.informationOfBatches.push(newObject);
        }
        $log.log("batches in scope are----", itemInfoElement.informationOfBatches);
        $log.log("inventory item is----", itemInfoElement.inventoryItem);
        $log.log("batches information is----", batchesInfo);
        itemInfoElement.loading = false;
        itemInfoElement.blurScreen=false;
    }, function(errorResponse) {
        itemInfoElement.blurScreen=true;
        itemInfoElement.loading = true;
        $log.log("in items info error response");

    });

    function backToItems() {
        $state.go('home.inventory');
    }

    function updateBatch(item, index) {
        $log.log("item selected for update is----", item);
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
            $log.log("request entity is---", requestEntity);
            itemInfoElement.loading = true;
            var promise = dboticaServices.updateTheBatch(requestEntity);
            promise.then(function(response) {
                $log.log("response after updating is----", response);
                var updatedBatchInfo = $.parseJSON(response.data.response);
                for (var itemBatchIndex = 0; itemBatchIndex < itemInfoElement.informationOfBatches.length; itemBatchIndex++) {
                    if (itemInfoElement.informationOfBatches[itemBatchIndex].id == updatedBatchInfo.id) {
                        itemInfoElement.informationOfBatches[itemBatchIndex].availableStock = updatedBatchInfo.units;
                        itemInfoElement.informationOfBatches[itemBatchIndex].totalStock = updatedBatchInfo.units;
                        if (updatedBatchInfo.hasOwnProperty('consumedUnits')) {
                            itemInfoElement.informationOfBatches[itemBatchIndex].consumedUnits = updatedBatchInfo.consumedUnits;
                            itemInfoElement.informationOfBatches[itemBatchIndex].totalStock += updatedBatchInfo.consumedUnits;
                        }
                        if (updatedBatchInfo.hasOwnProperty('expiredUnits')) {
                            itemInfoElement.informationOfBatches[itemBatchIndex].expiredUnits = updatedBatchInfo.expiredUnits;
                            itemInfoElement.informationOfBatches[itemBatchIndex].totalStock += updatedBatchInfo.expiredUnits;
                        }
                        if (updatedBatchInfo.hasOwnProperty('returnedUnits')) {
                            itemInfoElement.informationOfBatches[itemBatchIndex].returnedUnits = updatedBatchInfo.returnedUnits;
                            itemInfoElement.informationOfBatches[itemBatchIndex].totalStock += updatedBatchInfo.returnedUnits;
                        }
                    }
                }
                $log.log("updated batch is-----", updatedBatchInfo);
                itemInfoElement.loading = false;
            }, function(errorResponse) {
                itemInfoElement.loading = true;
                $log.log("in error response of update batch");
            });
        } else {
            swal({
                title: "Error",
                text: "Please enter units below available stock.",
                type: "error",
                confirmButtonText: "OK"
            }, function() {

            });
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
            requestEntity.entityState = "ACTIVE";
            requestEntity = JSON.stringify(requestEntity);
            $log.log("added batch is----", requestEntity);
            itemInfoElement.loading = true;
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
                $log.log("array after adding batch is-----", itemInfoElement.informationOfBatches);
                itemInfoElement.loading = false;
            }, function(errorResponse) {
                itemInfoElement.loading = true;
            });
        }

    }
}]);
