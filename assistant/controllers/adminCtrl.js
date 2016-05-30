angular.module('personalAssistant').controller('adminCtrl', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "admin");
    var adminElement = this;

    adminElement.selectOthersService = selectOthersService;
    adminElement.doctorSelect = doctorSelect;
    adminElement.serviceSelect = serviceSelect;
    adminElement.submitServiceRequest = submitServiceRequest;
    adminElement.btnActiveInServicesTable = btnActiveInServicesTable;

    adminElement.admin = {};
    adminElement.admin.procedureName = false;
    adminElement.admin.doctorInDropdown;
    adminElement.admin.doctorActive;
    adminElement.admin.servicesListOfTheDoctor = [];
    adminElement.servicesList = ["Others"];
    adminElement.admin.serviceInDropDown = "Select Service";
    adminElement.admin.procedureCostTextBox = "";
    adminElement.admin.procedureRemarksTextBox = "";
    var selectService = "Select Service";
    var others = "Others";
    var newTest = "New Test";
    var service = "service";
    var test = "test";
    var general = "General";

    var testActiveIndex = 0;
    var getTestsSuccess = [];
    var organizationId = localStorage.getItem('orgId');
    var generalObject = { 'firstName': "General", 'lastName': "" };


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
                    localStorage.clear();
                    localStorage.setItem('isLoggedInAssistant', "false");
                    $state.go('login');
                    break;
            }
        } else {
            adminElement.doctorsListInAdmin = $.parseJSON(response.data.response);
            $log.log("docs list in admin is-----", adminElement.doctorsListInAdmin);
            if (adminElement.doctorsListInAdmin.length > 0) {
                adminElement.admin.doctorActive = adminElement.doctorsListInAdmin[0];
                adminElement.admin.doctorInDropdown = adminElement.doctorsListInAdmin[0].firstName + ' ' + adminElement.doctorsListInAdmin[0].lastName;
                adminElement.doctorsListInAdmin.push(generalObject);
            } else {
                adminElement.doctorsListInAdmin.push(generalObject);
                adminElement.admin.doctorInDropdown = adminElement.doctorsListInAdmin[0].firstName + ' ' + adminElement.doctorsListInAdmin[0].lastName;
            }
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



    function selectOthersService() {
        var serviceSelected = adminElement.admin.selectService;
        if (serviceSelected.name == "Others") {
            $log.log("in others---");
            adminElement.admin.procedureName = true;
        } else {
            adminElement.admin.procedureName = false;
        }
    };

    function doctorSelect(doctor) {
        $log.log("doc selected is----", doctor);
        adminElement.admin.doctorActive = doctor;
        if (doctor.firstName == general) {
            adminElement.admin.serviceInDropDown = selectService;
            adminElement.servicesList = ["New Test"];
            adminElement.admin.procedureName = false;
            adminElement.admin.doctorInDropdown = doctor.firstName + doctor.lastName;
            var getTestsPromise = dboticaServices.getTests();
            getTestsPromise.then(function(getTestsSuccessResponse) {
                $log.log("get tests success is-----", getTestsSuccessResponse);
                getTestsSuccess = $.parseJSON(getTestsSuccessResponse.data.response);
                for (test in getTestsSuccess) {
                    if (getTestsSuccess[test].hasOwnProperty('organizationId')) {
                        if (getTestsSuccess[test].organizationId == organizationId) {
                            adminElement.servicesList.unshift(getTestsSuccess[test].testName);
                            getTestsSuccess[test].billingName = getTestsSuccess[test].testName;
                            delete getTestsSuccess[test].testName;
                        }
                    }
                }
                $log.log("table array is----", getTestsSuccess);
                angular.copy(getTestsSuccess, adminElement.admin.servicesListOfTheDoctor);
            }, function(getTestsErrorResponse) {

            });
            adminElement.admin.servicesListOfTheDoctor = [];
        } else {
            adminElement.admin.serviceInDropDown = selectService;
            adminElement.admin.doctorInDropdown = doctor.firstName + ' ' + doctor.lastName;
            adminElement.admin.procedureName = false;
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
        }

    }

    function serviceSelect(service) {
        $log.log("service is---", service);
        adminElement.admin.serviceInDropDown = service;
        if (service == others || service == newTest) {
            if (service == newTest) {
                adminElement.admin.doctorInDropdown = generalObject.firstName + generalObject.lastName;
            }
            adminElement.admin.procedureName = true;
        } else {
            adminElement.admin.procedureNameTxtBox = service;
            adminElement.admin.procedureName = false;
        }
    }

    function submitServiceRequest() {
        var serviceRequestEntity = {};
        var testObject = {};
        serviceRequestEntity.doctorId = adminElement.admin.doctorActive.id;
        serviceRequestEntity.doctorPriceInfos = [];
        $log.log("cost is---" + adminElement.admin.procedureCostTextBox);
        $log.log("remark is----" + adminElement.admin.procedureRemarksTextBox);
        if (adminElement.admin.serviceInDropDown !== selectService && adminElement.admin.procedureCostTextBox !== "" && adminElement.admin.procedureRemarksTextBox !== "") {
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
                    var serviceObject = getServiceRequestObject(service);
                    serviceRequestEntity.doctorPriceInfos.push(serviceObject);
                } else {
                    var serviceObject = getServiceRequestObject(service);
                    serviceRequestEntity.doctorPriceInfos.push(serviceObject);
                }

            } else {
                if (adminElement.admin.doctorInDropdown == general) {
                    if (adminElement.admin.serviceInDropDown == newTest) {
                        testObject = getServiceRequestObject(test);
                    } else {
                        testObject = getServiceRequestObject(test);
                        for (var testIndex in getTestsSuccess) {
                            if (getTestsSuccess[testIndex].billingName == adminElement.admin.serviceInDropDown) {
                                testObject.id = getTestsSuccess[testIndex].id;
                            }
                        }
                        $log.log("test obj is----", testObject);
                    }
                } else {
                    var serviceObject = getServiceRequestObject(service);
                    serviceRequestEntity.doctorPriceInfos.push(serviceObject);
                }
            }
            $log.log("req entity is---", serviceRequestEntity);
            if (adminElement.admin.doctorInDropdown == general) {
                var submitTestRequestPromise = dboticaServices.submitTestRequest(testObject);
                submitTestRequestPromise.then(function(testRequestSuccessResponse) {
                    $log.log("test success is----", testRequestSuccessResponse);
                    var testSuccess = $.parseJSON(testRequestSuccessResponse.data.response);
                    if (testObject.hasOwnProperty('id')) {
                        for (var testInTableIndex in adminElement.admin.servicesListOfTheDoctor) {
                            if (testSuccess.id == adminElement.admin.servicesListOfTheDoctor[testInTableIndex].id) {
                                adminElement.admin.servicesListOfTheDoctor[testInTableIndex].price = testSuccess.price;
                                adminElement.admin.servicesListOfTheDoctor[testInTableIndex].remark = testSuccess.remark;
                            }
                        }
                    } else {
                        testSuccess['billingName'] = testSuccess.testName;
                        delete testSuccess.testName;
                        adminElement.admin.servicesListOfTheDoctor.push(testSuccess);
                    }
                }, function(testRequestErrorResponse) {
                    $log.log("in error response of submit test request promise----");
                });
            } else {
                var submitServiceRequestPromise = dboticaServices.submitServiceRequest(serviceRequestEntity);
                submitServiceRequestPromise.then(function(successResponseOfServiceRequest) {
                    if (successResponseOfServiceRequest.data.success === true && successResponseOfServiceRequest.data.errorCode === null) {
                        var updatedDoctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
                        updatedDoctorsOfThatAssistant.then(function(successResponse) {
                            var updatedDoctorsOfThatAssistantResponse = $.parseJSON(successResponse.data.response);
                            updateTheServices(updatedDoctorsOfThatAssistantResponse);
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
                    adminElement.admin.serviceInDropDown = selectService;
                }, function(errorResponseOfServiceRequest) {
                    $log.log("in error response of submit service request---");
                });
            }
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

    function btnActiveInServicesTable(doctorService) {
        $log.log("doctor service for state editing is-----", doctorService);
        var changeStateRequestEntity = {};
        var changeTestStateRequestEntity = {};
        changeStateRequestEntity.doctorPriceInfos = [];
        if (adminElement.admin.doctorInDropdown == general) {
            changeTestStateRequestEntity['testName'] = doctorService.billingName;
            changeTestStateRequestEntity.organizationId = organizationId;
            changeTestStateRequestEntity.price = doctorService.price;
            changeTestStateRequestEntity.remark = doctorService.remark;
            changeTestStateRequestEntity.id = doctorService.id;
            changeTestStateRequestEntity.updatedBy = doctorService.updatedBy;
            var date = new Date();
            changeTestStateRequestEntity.updatedDate = date.getTime();
            if (doctorService.state == "ACTIVE") {
                changeTestStateRequestEntity.state = "INACTIVE";
            } else {
                changeTestStateRequestEntity.state = "ACTIVE";
            }
            var submitTestStatePromise = dboticaServices.submitTestRequest(changeTestStateRequestEntity);
            submitTestStatePromise.then(function(submitTestStateChangeSuccess) {
                var successtestStateChange = $.parseJSON(submitTestStateChangeSuccess.data.response);
                $log.log("success state change is----", successtestStateChange);
                if (submitTestStateChangeSuccess.data.success === true && submitTestStateChangeSuccess.data.errorCode === null) {
                    $log.log("in ste----");
                    doctorService.state = successtestStateChange.state;
                }
            }, function(submitTestStateChangeError) {});

        } else {
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
                        $log.log("in error response of updated Doctors Response");
                    });
                }
            }, function(changeStateRequestErrorResponse) {
                $log.log("in error response of change state request");
            });
        }
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
        adminElement.doctorsListInAdmin.push(generalObject);
    }

    var getServiceRequestObject = function(testOrService) {
        var newObject = {};
        var assistantCurrentlyLoggedIn = localStorage.getItem('assistantCurrentlyLoggedIn');
        assistantCurrentlyLoggedIn = $.parseJSON(assistantCurrentlyLoggedIn);
        if (testOrService == test) {
            newObject.organizationId = organizationId;
            newObject.testName = adminElement.admin.procedureNameTxtBox;
        } else {
            newObject.billingName = adminElement.admin.procedureNameTxtBox;
        }
        newObject.price = adminElement.admin.procedureCostTextBox * 100;
        var date = new Date();
        newObject.updatedDate = date.getTime();
        newObject.remark = adminElement.admin.procedureRemarksTextBox;
        newObject.updatedBy = assistantCurrentlyLoggedIn.id;
        newObject.state = "ACTIVE";
        return newObject;
    }
}]);
