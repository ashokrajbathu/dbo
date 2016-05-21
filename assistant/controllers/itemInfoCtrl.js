angular.module('personalAssistant').controller('itemInfoCtrl', ['$scope', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "itemInfo");
    var itemSelected;
    $scope.batches = {};
    var batchesInfo = [];
    $scope.informationOfBatches = [];
    itemSelected = dboticaServices.getSelectedItem();
    console.log("selected item is----", itemSelected);
    if (itemSelected !== undefined) {
        localStorage.setItem('currentItemId', itemSelected.id);
        localStorage.setItem('organizationId', itemSelected.organizationId);
    }
    var currentItemId = localStorage.getItem('currentItemId');
    var organizationId = localStorage.getItem('organizationId');

    var promise = dboticaServices.getAllBatches(currentItemId, organizationId);
    promise.then(function(response) {
        var batchesInfo = $.parseJSON(response.data.response);
        console.log("batches info is-----", batchesInfo);
        $scope.inventoryItem = batchesInfo.inventoryItem;
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
            $scope.informationOfBatches.push(newObject);
        }
        console.log("batches in scope are----", $scope.informationOfBatches);
        console.log("inventory item is----", $scope.inventoryItem);
        console.log("batches information is----", batchesInfo);
    }, function(errorResponse) {
        console.log("in items info error response");

    });

    $scope.backToItems = function() {
        $state.go('home.inventory');
    }

    $scope.updateBatch = function(item, index) {
        console.log("item selected for update is----", item);
        var idOfTheTextBox = "#batchTextBoxes" + index;
        var idOfTheSelectBox = "#batchSelectBoxes" + index;
        var valueInTextBox = angular.element(idOfTheTextBox).val();
        var valueInSelectBox = angular.element(idOfTheSelectBox).val();
        var requestEntity = {};
        requestEntity.batchId = item.id;
        requestEntity.organizationId = item.organizationId;
        requestEntity.batchState = valueInSelectBox;
        requestEntity.units = valueInTextBox;
        requestEntity = JSON.stringify(requestEntity);
        console.log("request entity is---", requestEntity);
        var promise = dboticaServices.updateTheBatch(requestEntity);
        promise.then(function(response) {
            console.log("response after updating is----", response);
            var updatedBatchInfo = $.parseJSON(response.data.response);
            console.log("updated batch is-----", updatedBatchInfo);
        }, function(errorResponse) {
            console.log("in error response of update batch");
        });
        angular.element(idOfTheTextBox).val('');

    }
}]);
