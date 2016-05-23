angular.module('personalAssistant').controller('adminCtrl', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "admin");

    $scope.admin = {};
    $scope.admin.procedureName = false;
    $scope.admin.doctorInDropdown;
    $scope.admin.doctorActive;
    $scope.admin.servicesListOfTheDoctor = [];
    $scope.servicesList = ["Java", "Others"];
    $scope.admin.serviceInDropDown = "Select Service"
    var doctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
    $log.log("service initial is----" + $scope.admin.serviceInDropDown);
    doctorsOfThatAssistant.then(function(response) {
        $scope.doctorsListInAdmin = $.parseJSON(response.data.response);
        $scope.admin.doctorActive = $scope.doctorsListInAdmin[0];
        $scope.admin.doctorInDropdown = $scope.doctorsListInAdmin[0].firstName + ' ' + $scope.doctorsListInAdmin[0].lastName;
        if ($scope.admin.doctorActive.hasOwnProperty('doctorPriceInfos')) {
            $scope.admin.servicesListOfTheDoctor = $scope.admin.doctorActive.doctorPriceInfos;
        }
        $log.log("docs list is----", $scope.doctorsListInAdmin);
    }, function(errorResponse) {
        $log.log("in error response of getting doctors");
    });

    $scope.selectOthersService = function() {
        var serviceSelected = $scope.admin.selectService;
        if (serviceSelected.name == "Others") {
            $log.log("in others---");
            $scope.admin.procedureName = true;
        } else {
            $scope.admin.procedureName = false;
        }
    };

    $scope.doctorSelect = function(doctor) {
        $scope.admin.doctorActive = doctor;
        $log.log("doctor selected is---", doctor);
        if (doctor.hasOwnProperty('doctorPriceInfos')) {
            $scope.admin.servicesListOfTheDoctor = doctor.doctorPriceInfos;
        } else {
            $scope.admin.servicesListOfTheDoctor = [];
        }
        $scope.admin.doctorInDropdown = doctor.firstName + ' ' + doctor.lastName;
    }

    $scope.serviceSelect = function(service) {
        $scope.admin.serviceInDropDown = service;
        if (service == "Others") {
            $scope.admin.procedureName = true;
        } else {
            $scope.admin.procedureName = false;
        }
    }

    $scope.submitServiceRequest = function() {
        var serviceRequestEntity = {};
        serviceRequestEntity.doctorId = $scope.admin.doctorActive.id;
        serviceRequestEntity.doctorPriceInfos = [];
        var assistantCurrentlyLoggedIn = localStorage.getItem('assistantCurrentlyLoggedIn');
        assistantCurrentlyLoggedIn = $.parseJSON(assistantCurrentlyLoggedIn);
        if ($scope.admin.doctorActive.hasOwnProperty('doctorPriceInfos')) {
            if ($scope.admin.service !== "Select Service" && $scope.admin.service == "Others") {
                $log.log("in if---");
                for (var doctorPriceInfoIndex = 0; doctorPriceInfoIndex < $scope.admin.doctorActive.doctorPriceInfos.length; doctorPriceInfoIndex++) {
                    var existingInfoObject = {};
                    existingInfoObject.billingName = $scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].billingName;
                    existingInfoObject.price = $scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].price;
                    existingInfoObject.updatedDate = $scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].updatedDate;
                    existingInfoObject.remark = $scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].remark;
                    existingInfoObject.updatedBy = $scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].updatedBy;
                    existingInfoObject.state = $scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].state;
                    serviceRequestEntity.doctorPriceInfos.push(existingInfoObject);
                }
                var newObject = {};
                newObject.billingName = $scope.admin.procedureNameTxtBox;
                newObject.price = $scope.admin.procedureCostTextBox * 100;
                var date = new Date();
                newObject.updatedDate = date.getTime();
                newObject.remark = $scope.admin.procedureRemarksTextBox;
                newObject.updatedBy = assistantCurrentlyLoggedIn.id;
                newObject.state = "ACTIVE";
                serviceRequestEntity.doctorPriceInfos.push(newObject);
            }
        }
        $log.log("req entity is---", serviceRequestEntity);
        var submitServiceRequestPromise = dboticaServices.submitServiceRequest(serviceRequestEntity);
        submitServiceRequestPromise.then(function(successResponseOfServiceRequest) {
            $log.log("service request response is---", successResponseOfServiceRequest);
            if (successResponseOfServiceRequest.data.success === true && successResponseOfServiceRequest.data.errorCode === null) {
                var object = {};
                object.billingName = $scope.admin.procedureNameTxtBox;
                object.price = $scope.admin.procedureCostTextBox * 100;
                object.remark = $scope.admin.procedureRemarksTextBox;
                $scope.admin.servicesListOfTheDoctor.push(object);
            }
        }, function(errorResponseOfServiceRequest) {
            $log.log("in error response of submit service request---");
        });
    }
}]);
