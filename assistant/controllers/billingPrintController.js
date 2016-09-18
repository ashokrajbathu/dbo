var app = angular.module('printBill', []);

app.controller('printBillController', ['$scope', function($scope) {
    $scope.itemsToBeDisplayed = [];
    $scope.billNowActiveDetails = {};
    var d = new Date();
    $scope.todayDate = d.getTime();
    $scope.rupees = 'Rs.';
    $scope.doctorServicesPageDisplay = true;
    $scope.medicinesPageDisplay = true;
    $scope.testsPageDisplay = true;
    var billNowActive = localStorage.getItem('billActiveToPrint');
    $scope.patientNameInBill = localStorage.getItem('patientNameInBillActive');
    $scope.patientNumberInBill = localStorage.getItem('patientNumberInBillActive');
    $scope.addressInTheBill = localStorage.getItem('addressInTheBill');
    $scope.addressInTheBill = JSON.parse($scope.addressInTheBill);
    $scope.organizationName = $scope.addressInTheBill[0].label;
    $scope.address = $scope.addressInTheBill[0].address;
    $scope.cellNumber = $scope.addressInTheBill[0].cellNumber;
    $scope.phoneNumber = $scope.addressInTheBill[0].phoneNumber;
    $scope.tinNo = $scope.addressInTheBill[0].tinNo;
    $scope.billNowActiveDetails = JSON.parse(billNowActive);
    console.log("bill now active is----", JSON.parse(billNowActive));
    console.log('address active is----', $scope.addressInTheBill);
    $scope.itemsToBeDisplayedDoctorServices = [];
    $scope.itemsToBeDisplayedMedicines = [];
    $scope.itemsToBeDisplayedTests = [];
    //$scope.itemsToBeDisplayed = $scope.billNowActiveDetails.items;
    angular.forEach($scope.billNowActiveDetails.items, function(entity) {
        if (entity.itemType == 'DOCTOR_CHARGE') {
            $scope.itemsToBeDisplayedDoctorServices.push(entity);
        }
    });
    if ($scope.itemsToBeDisplayedDoctorServices.length > 0) {
        $scope.doctorServicesPageDisplay = false;
    }
    angular.forEach($scope.billNowActiveDetails.items, function(medicineEntity) {
        if (medicineEntity.itemType == 'MEDICINE') {
            $scope.itemsToBeDisplayedMedicines.push(medicineEntity);
        }
    });
    if ($scope.itemsToBeDisplayedMedicines.length > 0) {
        $scope.medicinesPageBreakerFlag = true;
        $scope.medicinesPageDisplay = false;
    }
    angular.forEach($scope.billNowActiveDetails.items, function(testEntity) {
        if (testEntity.itemType == 'TEST') {
            $scope.itemsToBeDisplayedTests.push(testEntity);
        }
    });
    if ($scope.itemsToBeDisplayedTests.length > 0) {
        $scope.testsPageBreakerFlag = true;
        $scope.testsPageDisplay = false;
    }

    $scope.paymentEntries = $scope.billNowActiveDetails.paymentEntries;
}]);

app.filter("longDateIntoReadableDate", function() {
    return function(input) {
        var result;
        if (input == undefined) {
            result = "";
        } else {
            result = new Date(input);
            result = moment(result).format('DD/MM/YYYY,hh:mm:ss A');
            var timeArray = result.split(",");
            result = timeArray[0];
        }
        return result;
    };
});
