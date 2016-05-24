angular.module('personalAssistant').controller('adminCtrl', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "admin");

    $scope.admin = {};
    $scope.admin.procedureName = false;
    $scope.admin.doctorInDropdown;
    $scope.admin.doctorActive;
    $scope.admin.servicesListOfTheDoctor = [];
    $scope.servicesList = ["Others"];
    $scope.admin.serviceInDropDown = "Select Service"
    $scope.admin.procedureCostTextBox = "";
    $scope.admin.procedureRemarksTextBox = "";
    var doctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
    doctorsOfThatAssistant.then(function(response) {
        var errorCode = response.data.errorCode;
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
            $scope.doctorsListInAdmin = $.parseJSON(response.data.response);
            $scope.admin.doctorActive = $scope.doctorsListInAdmin[0];
            $scope.admin.doctorInDropdown = $scope.doctorsListInAdmin[0].firstName + ' ' + $scope.doctorsListInAdmin[0].lastName;
            if ($scope.admin.doctorActive.hasOwnProperty('doctorPriceInfos')) {
                $scope.admin.servicesListOfTheDoctor = $scope.admin.doctorActive.doctorPriceInfos;
                for (service in $scope.admin.servicesListOfTheDoctor) {
                    $scope.servicesList.unshift($scope.admin.servicesListOfTheDoctor[service].billingName);
                }
            }
            $log.log("docs list is----", $scope.doctorsListInAdmin);
        }
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
        $scope.servicesList = ["Others"];
        $log.log("doctor selected is---", doctor);
        if (doctor.hasOwnProperty('doctorPriceInfos')) {
            $scope.admin.servicesListOfTheDoctor = doctor.doctorPriceInfos;
            for (service in doctor.doctorPriceInfos) {
                $scope.servicesList.unshift(doctor.doctorPriceInfos[service].billingName);
            }
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
            $scope.admin.procedureNameTxtBox = service;
            $scope.admin.procedureName = false;
        }
    }

    $scope.submitServiceRequest = function() {
        var serviceRequestEntity = {};
        serviceRequestEntity.doctorId = $scope.admin.doctorActive.id;
        serviceRequestEntity.doctorPriceInfos = [];
        $log.log("cost is---" + $scope.admin.procedureCostTextBox);
        $log.log("remark is----" + $scope.admin.procedureRemarksTextBox);
        if ($scope.admin.serviceInDropDown !== "Select Service" && $scope.admin.procedureCostTextBox !== "" && $scope.admin.procedureRemarksTextBox !== "") {
            $log.log("in required---");
            if ($scope.admin.doctorActive.hasOwnProperty('doctorPriceInfos')) {
                $log.log("in first if--");
                if ($scope.admin.doctorActive.doctorPriceInfos.length > 0) {
                    for (var doctorPriceInfoIndex = 0; doctorPriceInfoIndex < $scope.admin.doctorActive.doctorPriceInfos.length; doctorPriceInfoIndex++) {
                        var existingInfoObject = {};
                        if ($scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].billingName == $scope.admin.serviceInDropDown) {} else {
                            existingInfoObject.billingName = $scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].billingName;
                            existingInfoObject.price = $scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].price;
                            existingInfoObject.updatedDate = $scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].updatedDate;
                            existingInfoObject.remark = $scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].remark;
                            existingInfoObject.updatedBy = $scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].updatedBy;
                            existingInfoObject.state = $scope.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].state;
                            serviceRequestEntity.doctorPriceInfos.push(existingInfoObject);
                        }
                    }
                    var serviceObject = getServiceRequestObject();
                    serviceRequestEntity.doctorPriceInfos.push(serviceObject);
                } else {
                    var serviceObject = getServiceRequestObject();
                    serviceRequestEntity.doctorPriceInfos.push(serviceObject);
                }

            } else {
                var serviceObject = getServiceRequestObject();
                serviceRequestEntity.doctorPriceInfos.push(serviceObject);
            }
            $log.log("req entity is---", serviceRequestEntity);
            var submitServiceRequestPromise = dboticaServices.submitServiceRequest(serviceRequestEntity);
            submitServiceRequestPromise.then(function(successResponseOfServiceRequest) {
                if (successResponseOfServiceRequest.data.success === true && successResponseOfServiceRequest.data.errorCode === null) {
                    var updatedDoctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
                    updatedDoctorsOfThatAssistant.then(function(successResponse) {
                        var updatedDoctorsOfThatAssistantResponse = $.parseJSON(successResponse.data.response);
                        $scope.doctorsListInAdmin = [];
                        $scope.admin.servicesListOfTheDoctor = [];
                        for (doctorIndex in updatedDoctorsOfThatAssistantResponse) {
                            $scope.doctorsListInAdmin.push(updatedDoctorsOfThatAssistantResponse[doctorIndex]);
                            if (updatedDoctorsOfThatAssistantResponse[doctorIndex].id == $scope.admin.doctorActive.id) {
                                $scope.admin.doctorActive = updatedDoctorsOfThatAssistantResponse[doctorIndex];
                                $log.log("updated docs are---", $scope.admin.doctorActive);
                                $scope.admin.servicesListOfTheDoctor = updatedDoctorsOfThatAssistantResponse[doctorIndex].doctorPriceInfos;
                                $scope.servicesList = ["Others"];
                                for (eachService in $scope.admin.servicesListOfTheDoctor) {
                                    $scope.servicesList.unshift($scope.admin.servicesListOfTheDoctor[eachService].billingName);
                                }
                            }
                        }
                    }, function(errorResponse) {});
                }
                swal({
                    title: "Success",
                    text: "Service successfully updated.",
                    type: "success",
                    confirmButtonText: "OK",
                    allowOutsideClick: true
                });
                $scope.admin.procedureName = false;
                $scope.admin.procedureNameTxtBox = "";
                $scope.admin.procedureCostTextBox = "";
                $scope.admin.procedureRemarksTextBox = "";
                $scope.admin.serviceInDropDown = "Select Service";
            }, function(errorResponseOfServiceRequest) {
                $log.log("in error response of submit service request---");
            });
        } else {
            swal({
                title: "Error",
                text: "Please Fill All The Details!!!!",
                type: "error",
                confirmButtonText: "OK",
                allowOutsideClick: true
            });
        }
    }

    var getServiceRequestObject = function() {
        var newObject = {};
        var assistantCurrentlyLoggedIn = localStorage.getItem('assistantCurrentlyLoggedIn');
        assistantCurrentlyLoggedIn = $.parseJSON(assistantCurrentlyLoggedIn);
        newObject.billingName = $scope.admin.procedureNameTxtBox;
        newObject.price = $scope.admin.procedureCostTextBox * 100;
        var date = new Date();
        newObject.updatedDate = date.getTime();
        newObject.remark = $scope.admin.procedureRemarksTextBox;
        newObject.updatedBy = assistantCurrentlyLoggedIn.id;
        newObject.state = "ACTIVE";
        return newObject;
    }
}]);
