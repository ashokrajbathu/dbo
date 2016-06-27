var app = angular.module('printBill', []);

app.controller('printBillController', ['$scope', function($scope) {
    $scope.itemsToBeDisplayed = [];
    $scope.billNowActiveDetails = {};
    var d = new Date();
    $scope.todayDate = d.getTime();
    $scope.rupees = 'Rs.';
    var billNowActive = localStorage.getItem('billActiveToPrint');
    $scope.patientNameInBill = localStorage.getItem('patientNameInBillActive');
    $scope.patientNumberInBill = localStorage.getItem('patientNumberInBillActive');
    $scope.addressInTheBill = localStorage.getItem('addressInTheBill');
    $scope.addressInTheBill = JSON.parse($scope.addressInTheBill);
    $scope.organizationName = $scope.addressInTheBill[0].label;
    $scope.address = $scope.addressInTheBill[0].address;
    $scope.cellNumber = $scope.addressInTheBill[0].cellNumber;
    $scope.phoneNumber = $scope.addressInTheBill[0].phoneNumber;
    $scope.billNowActiveDetails = JSON.parse(billNowActive);
    console.log("bill now active is----", JSON.parse(billNowActive));
    console.log('address active is----', $scope.addressInTheBill);
    $scope.itemsToBeDisplayed = $scope.billNowActiveDetails.items;
    $scope.paymentEntries = $scope.billNowActiveDetails.paymentEntries;
}]);

app.filter("longDateIntoReadableDate", function() {
    return function(input) {
        var result;
        if (input == undefined) {
            result = "";
        } else {
            result = new Date(input);
            result = result.toLocaleString();
            var resultArray = result.split(',');
            var resultArrayDate = resultArray[0];
            var resultArrayDateReadable = resultArrayDate.split('/');
            result = resultArrayDateReadable[1] + '/' + resultArrayDateReadable[0] + '/' + resultArrayDateReadable[2];
        }
        return result;
    };
});
