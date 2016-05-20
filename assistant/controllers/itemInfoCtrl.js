angular.module('personalAssistant').controller('itemInfoCtrl', ['$scope', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "itemInfo");
    var itemSelected;
    $scope.batches = {};
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
        $scope.informationOfBatches = batchesInfo.batchInfos;
        console.log("inventory item is----", $scope.inventoryItem);
        console.log("batches information is----", batchesInfo);
    }, function(errorResponse) {
        console.log("in items info error response");

    });

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
        /*requestEntity.itemId = item.itemId;
        requestEntity.costPrice = item.costPrice;*/
        /*switch (valueInSelectBox) {
            case 'CONSUMED':
                requestEntity.consumedUnits = valueInTextBox;
                break;
            case 'EXPIRED':
                requestEntity.expiredUnits = valueInTextBox;
                break;
            case 'RETURNED':
                requestEntity.returnedUnits = valueInTextBox;
                break;
        }*/
        /*requestEntity.expiryTime = item.expiryTime;
        requestEntity.entityState = "ACTIVE";*/
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
