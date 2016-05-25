angular.module('personalAssistant').controller('billManagementCtrl', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "billManagement");
    angular.element("#sessionDatepickerCost").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0
    });

    angular.element("#exampleDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0
    });

    $scope.bill = {};
    $scope.bill.doctorsListInBillManagement = [];
    $scope.bill.billTypes = [];
    $scope.bill.doctorActiveName = "";
    $scope.bill.doctorActiveService = "No Bill Type";

    var doctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
    doctorsOfThatAssistant.then(function(successResponse) {
        $log.log("bill response is----", successResponse);
        var errorCode = successResponse.data.errorCode;
        if (!!errorCode) {
            switch (errorCode) {
                case 'NO_USER_LOGGED_IN':
                    swal({
                        title: "Error",
                        text: "You are not logged into your account. Kindly login again to view this page",
                        type: "error",
                        confirmButtonText: "OK",
                        allowOutsideClick: true
                    });
                    localStorage.setItem('isLoggedIn', false);
                    $state.go('login');
                    break;
            }
        } else {
            $scope.bill.doctorsListInBillManagement = $.parseJSON(successResponse.data.response);
            $scope.bill.doctorActive = $scope.bill.doctorsListInBillManagement[0];
            if ($scope.bill.doctorActive.hasOwnProperty('doctorPriceInfos')) {
                $scope.bill.billTypes = $scope.bill.doctorActive.doctorPriceInfos;
                $scope.bill.doctorActiveService = $scope.bill.billTypes[0].billingName;
                $scope.bill.billCost = $scope.bill.billTypes[0].price / 100;
                $log.log("bill types are---", $scope.bill.billTypes);
            }
            $scope.bill.doctorActiveName = $scope.bill.doctorActive.firstName + ' ' + $scope.bill.doctorActive.lastName;
            $log.log("doctors list is---", $scope.bill.doctorsListInBillManagement);
        }
    }, function(errorResponse) {
        $log.log("in error response of getting doctors");
    });

    $scope.selectDoctorFromDropdown = function(doctor) {
        $scope.bill.doctorActive = doctor;
        if (doctor.hasOwnProperty('doctorPriceInfos')) {
            $scope.bill.doctorActiveService = doctor.doctorPriceInfos[0].billingName;
            $scope.bill.billTypes = doctor.doctorPriceInfos;
            $scope.bill.billCost = doctor.doctorPriceInfos[0].price / 100;
        } else {
            $scope.bill.doctorActiveService = "No Service";
            $scope.bill.billTypes = [];
        }
        $scope.bill.doctorActiveName = doctor.firstName + ' ' + doctor.lastName;
    }

    $scope.selectBillFromDropdown = function(billing) {
        $scope.bill.doctorActiveService = billing.billingName;
        $scope.bill.billCost = billing.price / 100;
    }

}]);
