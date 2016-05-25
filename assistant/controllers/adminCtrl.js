angular.module('personalAssistant').controller('adminCtrl', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "admin");
    var adminElement = this;

    adminElement.admin = {};
    adminElement.admin.procedureName = false;
    adminElement.admin.doctorInDropdown;
    adminElement.admin.doctorActive;
    adminElement.admin.servicesListOfTheDoctor = [];
    adminElement.servicesList = ["Others"];
    adminElement.admin.serviceInDropDown = "Select Service"
    adminElement.admin.procedureCostTextBox = "";
    adminElement.admin.procedureRemarksTextBox = "";
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
                    localStorage.setItem('isLoggedInAssistant', false);
                    $state.go('login');
                    break;
            }
        } else {
            adminElement.doctorsListInAdmin = $.parseJSON(response.data.response);
            adminElement.admin.doctorActive = adminElement.doctorsListInAdmin[0];
            adminElement.admin.doctorInDropdown = adminElement.doctorsListInAdmin[0].firstName + ' ' + adminElement.doctorsListInAdmin[0].lastName;
            if (adminElement.admin.doctorActive.hasOwnProperty('doctorPriceInfos')) {
                adminElement.admin.servicesListOfTheDoctor = adminElement.admin.doctorActive.doctorPriceInfos;
                for (service in adminElement.admin.servicesListOfTheDoctor) {
                    adminElement.servicesList.unshift(adminElement.admin.servicesListOfTheDoctor[service].billingName);
                }
            }
            $log.log("docs list is----", adminElement.doctorsListInAdmin);
        }
    }, function(errorResponse) {
        $log.log("in error response of getting doctors");
    });



    adminElement.selectOthersService = function() {
        var serviceSelected = adminElement.admin.selectService;
        if (serviceSelected.name == "Others") {
            $log.log("in others---");
            adminElement.admin.procedureName = true;
        } else {
            adminElement.admin.procedureName = false;
        }
    };

    adminElement.doctorSelect = function(doctor) {
        adminElement.admin.doctorActive = doctor;
        adminElement.servicesList = ["Others"];
        $log.log("doctor selected is---", doctor);
        if (doctor.hasOwnProperty('doctorPriceInfos')) {
            adminElement.admin.servicesListOfTheDoctor = doctor.doctorPriceInfos;
            for (service in doctor.doctorPriceInfos) {
                adminElement.servicesList.unshift(doctor.doctorPriceInfos[service].billingName);
            }
        } else {
            adminElement.admin.servicesListOfTheDoctor = [];
        }
        adminElement.admin.doctorInDropdown = doctor.firstName + ' ' + doctor.lastName;
    }

    adminElement.serviceSelect = function(service) {
        adminElement.admin.serviceInDropDown = service;
        if (service == "Others") {
            adminElement.admin.procedureName = true;
        } else {
            adminElement.admin.procedureNameTxtBox = service;
            adminElement.admin.procedureName = false;
        }
    }

    adminElement.submitServiceRequest = function() {
        var serviceRequestEntity = {};
        serviceRequestEntity.doctorId = adminElement.admin.doctorActive.id;
        serviceRequestEntity.doctorPriceInfos = [];
        $log.log("cost is---" + adminElement.admin.procedureCostTextBox);
        $log.log("remark is----" + adminElement.admin.procedureRemarksTextBox);
        if (adminElement.admin.serviceInDropDown !== "Select Service" && adminElement.admin.procedureCostTextBox !== "" && adminElement.admin.procedureRemarksTextBox !== "") {
            $log.log("in required---");
            if (adminElement.admin.doctorActive.hasOwnProperty('doctorPriceInfos')) {
                $log.log("in first if--");
                if (adminElement.admin.doctorActive.doctorPriceInfos.length > 0) {
                    for (var doctorPriceInfoIndex = 0; doctorPriceInfoIndex < adminElement.admin.doctorActive.doctorPriceInfos.length; doctorPriceInfoIndex++) {
                        var existingInfoObject = {};
                        if (adminElement.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].billingName == adminElement.admin.serviceInDropDown) {} else {
                            existingInfoObject.billingName = adminElement.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].billingName;
                            existingInfoObject.price = adminElement.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].price;
                            existingInfoObject.updatedDate = adminElement.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].updatedDate;
                            existingInfoObject.remark = adminElement.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].remark;
                            existingInfoObject.updatedBy = adminElement.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].updatedBy;
                            existingInfoObject.state = adminElement.admin.doctorActive.doctorPriceInfos[doctorPriceInfoIndex].state;
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
                        updateTheServices(updatedDoctorsOfThatAssistantResponse);
                        /*adminElement.doctorsListInAdmin = [];
                        adminElement.admin.servicesListOfTheDoctor = [];
                        for (doctorIndex in updatedDoctorsOfThatAssistantResponse) {
                            adminElement.doctorsListInAdmin.push(updatedDoctorsOfThatAssistantResponse[doctorIndex]);
                            if (updatedDoctorsOfThatAssistantResponse[doctorIndex].id == adminElement.admin.doctorActive.id) {
                                adminElement.admin.doctorActive = updatedDoctorsOfThatAssistantResponse[doctorIndex];
                                $log.log("updated docs are---", adminElement.admin.doctorActive);
                                adminElement.admin.servicesListOfTheDoctor = updatedDoctorsOfThatAssistantResponse[doctorIndex].doctorPriceInfos;
                                adminElement.servicesList = ["Others"];
                                for (eachService in adminElement.admin.servicesListOfTheDoctor) {
                                    adminElement.servicesList.unshift(adminElement.admin.servicesListOfTheDoctor[eachService].billingName);
                                }
                            }
                        }*/
                    }, function(errorResponse) {});
                }
                swal({
                    title: "Success",
                    text: "Service successfully updated.",
                    type: "success",
                    confirmButtonText: "OK",
                    allowOutsideClick: true
                });
                adminElement.admin.procedureName = false;
                adminElement.admin.procedureNameTxtBox = "";
                adminElement.admin.procedureCostTextBox = "";
                adminElement.admin.procedureRemarksTextBox = "";
                adminElement.admin.serviceInDropDown = "Select Service";
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

    adminElement.btnActiveInServicesTable = function(doctorService) {
        var changeStateRequestEntity = {};
        changeStateRequestEntity.doctorPriceInfos = [];
        changeStateRequestEntity.doctorId = adminElement.admin.doctorActive.id;
        for (doctorServiceIndex in adminElement.admin.servicesListOfTheDoctor) {
            var object = {};
            object.billingName = adminElement.admin.servicesListOfTheDoctor[doctorServiceIndex].billingName;
            object.price = adminElement.admin.servicesListOfTheDoctor[doctorServiceIndex].price;
            object.remark = adminElement.admin.servicesListOfTheDoctor[doctorServiceIndex].remark;
            object.updatedBy = adminElement.admin.servicesListOfTheDoctor[doctorServiceIndex].updatedBy;
            check = (doctorService.billingName == adminElement.admin.servicesListOfTheDoctor[doctorServiceIndex].billingName) && (doctorService.price == adminElement.admin.servicesListOfTheDoctor[doctorServiceIndex].price);
            if (check) {
                var date = new Date();
                object.updatedDate = date.getTime();
                if (doctorService.state == "ACTIVE") {
                    object.state = "INACTIVE";
                } else {
                    object.state = "ACTIVE";
                }
                changeStateRequestEntity.doctorPriceInfos.push(object);
            } else {
                object.updatedDate = adminElement.admin.servicesListOfTheDoctor[doctorServiceIndex].updatedDate;
                object.state = adminElement.admin.servicesListOfTheDoctor[doctorServiceIndex].state;
                changeStateRequestEntity.doctorPriceInfos.push(object);
            }
        }
        $log.log("req entity is---", changeStateRequestEntity);
        var changeServiceStateRequestPromise = dboticaServices.submitServiceRequest(changeStateRequestEntity);
        changeServiceStateRequestPromise.then(function(successResponseOfChangeStateRequest) {
            if (successResponseOfChangeStateRequest.data.success === true && successResponseOfChangeStateRequest.data.errorCode === null) {
                var updatedDoctors = dboticaServices.doctorsOfAssistant();
                updatedDoctors.then(function(successResponse) {
                    var updatedDoctorsResponse = $.parseJSON(successResponse.data.response);
                    updateTheServices(updatedDoctorsResponse);
                }, function(errorResponse) {

                });
            }

        }, function(changeStateRequestErrorResponse) {

        });

    }

    var updateTheServices = function(doctorServiceResponse) {
        adminElement.doctorsListInAdmin = [];
        adminElement.admin.servicesListOfTheDoctor = [];
        for (doctorIndex in doctorServiceResponse) {
            adminElement.doctorsListInAdmin.push(doctorServiceResponse[doctorIndex]);
            if (doctorServiceResponse[doctorIndex].id == adminElement.admin.doctorActive.id) {
                adminElement.admin.doctorActive = doctorServiceResponse[doctorIndex];
                $log.log("updated docs are---", adminElement.admin.doctorActive);
                adminElement.admin.servicesListOfTheDoctor = doctorServiceResponse[doctorIndex].doctorPriceInfos;
                adminElement.servicesList = ["Others"];
                for (eachService in adminElement.admin.servicesListOfTheDoctor) {
                    adminElement.servicesList.unshift(adminElement.admin.servicesListOfTheDoctor[eachService].billingName);
                }
            }
        }

    }

    var getServiceRequestObject = function() {
        var newObject = {};
        var assistantCurrentlyLoggedIn = localStorage.getItem('assistantCurrentlyLoggedIn');
        assistantCurrentlyLoggedIn = $.parseJSON(assistantCurrentlyLoggedIn);
        newObject.billingName = adminElement.admin.procedureNameTxtBox;
        newObject.price = adminElement.admin.procedureCostTextBox * 100;
        var date = new Date();
        newObject.updatedDate = date.getTime();
        newObject.remark = adminElement.admin.procedureRemarksTextBox;
        newObject.updatedBy = assistantCurrentlyLoggedIn.id;
        newObject.state = "ACTIVE";
        return newObject;
    }
}]);
