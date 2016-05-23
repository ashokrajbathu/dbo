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

    var doctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
    doctorsOfThatAssistant.then(function(response) {
        $scope.doctorsListInBillManagement = $.parseJSON(response.data.response);
        $log.log("doctors list is---", $scope.doctorsListInBillManagement);
    }, function(errorResponse) {
        $log.log("in error response of getting doctors");
    });

}]);
