angular.module('personalAssistant').controller('adminCtrl', adminCtrl);
adminCtrl.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function adminCtrl($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "admin");
    var adminElement = this;

    adminElement.selectOthersService = selectOthersService;
    adminElement.doctorSelect = doctorSelect;
    adminElement.serviceSelect = serviceSelect;
    adminElement.submitServiceRequest = submitServiceRequest;
    adminElement.btnActiveInServicesTable = btnActiveInServicesTable;
    adminElement.toggleBetweenViews = toggleBetweenViews;
    adminElement.updateAddress = updateAddress;
    adminElement.roomSelectForTest = roomSelectForTest;
    adminElement.testSearch = testSearch;
    adminElement.selectTestFromTheDropdown = selectTestFromTheDropdown;

    adminElement.admin = {};
    var selectRoomObject = { 'roomNo': '--Select Room-', 'floorNo': '-' };
    adminElement.activeRoomId = '';
    adminElement.activeRooms = [];
    adminElement.tableFlag = true;
    adminElement.dropdownActive = false;
    adminElement.testDuration = false;
    adminElement.blurScreen = false;
    adminElement.loading = false;
    adminElement.testsListFlag = false;
    adminElement.roomDropDown = false;
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
    adminElement.orgAddress = {};
    adminElement.orgAddress.label = '';
    adminElement.orgAddress.address = '';
    adminElement.orgAddress.city = '';
    adminElement.orgAddress.pinCode = '';
    adminElement.orgAddress.phoneNumber = '';
    adminElement.orgAddress.cellNumber = '';
    adminElement.orgAddress.tinNo = '';
    var organizationAddressId = '';
    adminElement.roomName = '--Select Room--';

    var testActiveIndex = 0;
    var getTestsSuccess = [];
    var organizationId = localStorage.getItem('orgId');
    var generalObject = { 'firstName': "General", 'lastName': "" };

    adminElement.doctorSectionDiv = true;
    adminElement.addressSectionDiv = false;
    adminElement.changeAddressLink = true;
    adminElement.backLink = false;

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);

    adminElement.loading = true;
    adminElement.blurScreen = true;
    var doctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
    doctorsOfThatAssistant.then(function(response) {
        var errorCode = response.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            adminElement.doctorsListInAdmin = angular.fromJson(response.data.response);
            if (adminElement.doctorsListInAdmin.length > 0) {
                adminElement.admin.doctorActive = adminElement.doctorsListInAdmin[0];
                adminElement.admin.doctorInDropdown = adminElement.doctorsListInAdmin[0].firstName + ' ' + adminElement.doctorsListInAdmin[0].lastName;
                adminElement.doctorsListInAdmin.push(generalObject);
            } else {
                adminElement.doctorsListInAdmin.push(generalObject);
                adminElement.admin.doctorInDropdown = adminElement.doctorsListInAdmin[0].firstName + ' ' + adminElement.doctorsListInAdmin[0].lastName;
            }
            if (adminElement.doctorsListInAdmin.length > 0) {
                if (adminElement.admin.doctorActive.hasOwnProperty('doctorPriceInfos')) {
                    adminElement.admin.servicesListOfTheDoctor = adminElement.admin.doctorActive.doctorPriceInfos;
                    angular.forEach(adminElement.admin.servicesListOfTheDoctor, function(serviceEntity) {
                        adminElement.servicesList.unshift(serviceEntity.billingName);
                    });
                }
            } else {
                dboticaServices.noConnectivityError();
            }
        }
        adminElement.loading = false;
        adminElement.blurScreen = false;
    }, function(errorResponse) {
        adminElement.blurScreen = false;
        adminElement.loading = false;
        dboticaServices.noConnectivityError();
    });

    var organizationAddressPromise = dboticaServices.getOrganizationAddress();
    organizationAddressPromise.then(function(organizationAddressSuccess) {
        var errorCode = organizationAddressSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var organizationAddress = angular.fromJson(organizationAddressSuccess.data.response);
            if (organizationAddress.length > 0) {
                organizationAddressId = organizationAddress[0].id;
                adminElement.orgAddress.label = organizationAddress[0].label;
                adminElement.orgAddress.address = organizationAddress[0].address;
                adminElement.orgAddress.city = organizationAddress[0].city;
                adminElement.orgAddress.pinCode = organizationAddress[0].pinCode;
                adminElement.orgAddress.phoneNumber = organizationAddress[0].phoneNumber;
                adminElement.orgAddress.cellNumber = organizationAddress[0].cellNumber;
                adminElement.orgAddress.tinNo = organizationAddress[0].tinNo;
            }
        }
    }, function(organizationAddressError) {
        dboticaServices.noConnectivityError();
    });

    var getRoomsPromise = dboticaServices.getRooms(organizationId);
    getRoomsPromise.then(function(getRoomsSuccess) {
        var errorCode = getRoomsSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var getRoomsResponse = angular.fromJson(getRoomsSuccess.data.response);
            adminElement.activeRooms = _.filter(getRoomsResponse, function(entity) {
                return entity.state == 'ACTIVE';
            });
            adminElement.activeRooms.unshift(selectRoomObject);
        }
    }, function(getRoomsError) {
        dboticaServices.noConnectivityError();
    });

    function selectOthersService() {
        var serviceSelected = adminElement.admin.selectService;
        if (serviceSelected.name == "Others") {
            adminElement.admin.procedureName = true;
            adminElement.admin.procedureNameTxtBox = "";
        } else {
            adminElement.admin.procedureName = false;
        }
    };

    function doctorSelect(doctor) {
        adminElement.admin.doctorActive = doctor;
        if (doctor.firstName == general) {
            adminElement.testsListFlag = true;
            adminElement.tableFlag = false;
            adminElement.admin.serviceInDropDown = selectService;
            adminElement.servicesList = ["New Test"];
            adminElement.admin.procedureName = false;
            adminElement.admin.doctorInDropdown = doctor.firstName + doctor.lastName;
            adminElement.loading = true;
            var getTestsPromise = dboticaServices.getTestsByAdmin();
            getTestsPromise.then(function(getTestsSuccessResponse) {
                var errorCode = getTestsSuccessResponse.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    getTestsSuccess = angular.fromJson(getTestsSuccessResponse.data.response);
                    angular.forEach(getTestsSuccess, function(testEntity) {
                        if (testEntity.hasOwnProperty('organizationId')) {
                            if (testEntity.organizationId == organizationId) {
                                adminElement.servicesList.unshift(testEntity.diagnosisTest);
                                testEntity.billingName = testEntity.diagnosisTest;
                                delete testEntity.diagnosisTest;
                            }
                        }
                    });
                    angular.copy(getTestsSuccess, adminElement.admin.servicesListOfTheDoctor);
                    getRoomAndFloorNo();
                    adminElement.tableFlag = true;
                }
                adminElement.loading = false;
            }, function(getTestsErrorResponse) {
                adminElement.loading = false;
                dboticaServices.noConnectivityError();
            });
            adminElement.admin.servicesListOfTheDoctor = [];
        } else {
            adminElement.testsListFlag = false;
            adminElement.tableFlag = false;
            adminElement.admin.serviceInDropDown = selectService;
            adminElement.admin.doctorInDropdown = doctor.firstName + ' ' + doctor.lastName;
            adminElement.admin.procedureName = false;
            adminElement.servicesList = ["Others"];
            if (doctor.hasOwnProperty('doctorPriceInfos')) {
                adminElement.admin.servicesListOfTheDoctor = doctor.doctorPriceInfos;
                angular.forEach(doctor.doctorPriceInfos, function(docPriceEntity) {
                    adminElement.servicesList.unshift(docPriceEntity.billingName);
                });
            } else {
                adminElement.admin.servicesListOfTheDoctor = [];
            }
            adminElement.tableFlag = true;
        }
    }

    function serviceSelect(service) {
        adminElement.admin.serviceInDropDown = service;
        if (service == others || service == newTest) {
            if (service == newTest) {
                adminElement.admin.doctorInDropdown = generalObject.firstName + generalObject.lastName;
                adminElement.admin.procedureNameTxtBox = '';
            }
            adminElement.admin.procedureName = true;
        } else {
            adminElement.admin.procedureNameTxtBox = service;
            adminElement.admin.procedureName = false;
        }
        adminElement.roomDropDown = true;
        adminElement.testDuration = true;
        adminElement.roomName = '--Select Room--';
        adminElement.activeRoomId = '';
    }

    function submitServiceRequest() {
        var serviceRequestEntity = {};
        var testObject = {};
        if (adminElement.admin.doctorInDropdown == general) {
            serviceRequestEntity.doctorId = "";
        } else {
            serviceRequestEntity.doctorId = adminElement.admin.doctorActive.id;
        }
        serviceRequestEntity.doctorPriceInfos = [];
        if (adminElement.admin.serviceInDropDown !== selectService && adminElement.admin.procedureCostTextBox !== "" && adminElement.admin.procedureRemarksTextBox !== "") {
            if (adminElement.admin.doctorActive.hasOwnProperty('doctorPriceInfos')) {
                if (adminElement.admin.doctorActive.doctorPriceInfos.length > 0) {
                    angular.forEach(adminElement.admin.doctorActive.doctorPriceInfos, function(doctorPriceInfoEntity) {
                        var existingInfoObject = {};
                        if (doctorPriceInfoEntity.billingName == adminElement.admin.serviceInDropDown) {} else {
                            existingInfoObject.billingName = doctorPriceInfoEntity.billingName;
                            existingInfoObject.price = doctorPriceInfoEntity.price;
                            existingInfoObject.updatedDate = doctorPriceInfoEntity.updatedDate;
                            existingInfoObject.remark = doctorPriceInfoEntity.remark;
                            existingInfoObject.updatedBy = doctorPriceInfoEntity.updatedBy;
                            existingInfoObject.state = doctorPriceInfoEntity.state;
                            serviceRequestEntity.doctorPriceInfos.push(existingInfoObject);
                        }
                    });
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
                        angular.forEach(getTestsSuccess, function(testsSuccessEntity) {
                            if (testsSuccessEntity.billingName == adminElement.admin.serviceInDropDown) {
                                testObject.id = testsSuccessEntity.id;
                            }
                        });
                    }
                } else {
                    var serviceObject = getServiceRequestObject(service);
                    serviceRequestEntity.doctorPriceInfos.push(serviceObject);
                }
            }
            if (adminElement.admin.doctorInDropdown == general) {
                adminElement.loading = true;
                var submitTestRequestPromise = dboticaServices.submitTestRequest(testObject);
                submitTestRequestPromise.then(function(testRequestSuccessResponse) {
                    var errorCode = testRequestSuccessResponse.data.errorCode;
                    if (errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        var errorCode = testRequestSuccessResponse.data.errorCode;
                        var success = testRequestSuccessResponse.data.success;
                        if (errorCode == null && success == true) {
                            var testSuccess = angular.fromJson(testRequestSuccessResponse.data.response);
                            var localRoom = _.filter(adminElement.activeRooms, function(entity) {
                                return entity.id == testSuccess.roomIds[0];
                            });
                            if (testObject.hasOwnProperty('id')) {
                                angular.forEach(adminElement.admin.servicesListOfTheDoctor, function(serviceOfDoctor) {
                                    if (testSuccess.id == serviceOfDoctor.id) {
                                        serviceOfDoctor.price = testSuccess.price;
                                        serviceOfDoctor.duration = testSuccess.duration;
                                        serviceOfDoctor.remark = testSuccess.remark;
                                        serviceOfDoctor.roomAndFloorNumbers = localRoom[0].roomNo + '-' + localRoom[0].floorNo;
                                    }
                                });
                                adminElement.admin.procedureCostTextBox = "";
                                adminElement.admin.procedureRemarksTextBox = "";
                                adminElement.admin.procedureNameTxtBox = "";
                                adminElement.admin.duration = '';
                                adminElement.activeRoomId = '';
                                adminElement.roomName = '--Select Room--';
                            } else {
                                testSuccess['billingName'] = testSuccess.diagnosisTest;
                                delete testSuccess.diagnosisTest;
                                testSuccess.roomAndFloorNumbers = localRoom[0].roomNo + '-' + localRoom[0].floorNo;
                                adminElement.servicesList.unshift(testSuccess['billingName']);
                                adminElement.admin.servicesListOfTheDoctor.push(testSuccess);
                                adminElement.admin.procedureCostTextBox = "";
                                adminElement.activeRoomId = '';
                                adminElement.roomName = '--Select Room--';
                                adminElement.admin.procedureRemarksTextBox = "";
                                adminElement.admin.procedureNameTxtBox = "";
                            }
                        }
                    }
                    adminElement.loading = false;
                }, function(testRequestErrorResponse) {
                    adminElement.loading = false;
                    dboticaServices.noConnectivityError();
                });
            } else {
                adminElement.loading = true;
                var submitServiceRequestPromise = dboticaServices.submitServiceRequest(serviceRequestEntity);
                submitServiceRequestPromise.then(function(successResponseOfServiceRequest) {
                    var errorCode = successResponseOfServiceRequest.data.errorCode;
                    if (errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        if (successResponseOfServiceRequest.data.success === true && successResponseOfServiceRequest.data.errorCode === null) {
                            var updatedDoctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
                            updatedDoctorsOfThatAssistant.then(function(successResponse) {
                                var errorCode = successResponse.data.errorCode;
                                if (errorCode) {
                                    dboticaServices.logoutFromThePage(errorCode);
                                } else {
                                    var updatedDoctorsOfThatAssistantResponse = angular.fromJson(successResponse.data.response);
                                    updateTheServices(updatedDoctorsOfThatAssistantResponse);
                                }
                            }, function(errorResponse) {});
                        }
                        dboticaServices.serviceUpdateSuccessSwal();
                        adminElement.admin.procedureName = false;
                        adminElement.admin.procedureNameTxtBox = "";
                        adminElement.admin.procedureCostTextBox = "";
                        adminElement.admin.procedureRemarksTextBox = "";
                        adminElement.admin.serviceInDropDown = selectService;
                    }
                    adminElement.loading = false;
                }, function(errorResponseOfServiceRequest) {
                    adminElement.loading = false;
                    dboticaServices.noConnectivityError();
                });
            }
        } else {
            dboticaServices.serviceUpdateError();
        }
    }

    function btnActiveInServicesTable(doctorService) {
        var changeStateRequestEntity = {};
        var changeTestStateRequestEntity = {};
        changeStateRequestEntity.doctorPriceInfos = [];
        if (adminElement.admin.doctorInDropdown == general) {
            changeTestStateRequestEntity['diagnosisTest'] = doctorService.billingName;
            changeTestStateRequestEntity.organizationId = organizationId;
            changeTestStateRequestEntity.price = doctorService.price;
            changeTestStateRequestEntity.duration = doctorService.duration;
            changeTestStateRequestEntity.roomIds = doctorService.roomIds;
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
            adminElement.loading = true;
            var submitTestStatePromise = dboticaServices.submitTestRequest(changeTestStateRequestEntity);
            submitTestStatePromise.then(function(submitTestStateChangeSuccess) {
                var errorCode = submitTestStateChangeSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var successtestStateChange = angular.fromJson(submitTestStateChangeSuccess.data.response);
                    if (submitTestStateChangeSuccess.data.success === true && submitTestStateChangeSuccess.data.errorCode === null) {
                        doctorService.state = successtestStateChange.state;
                    }
                }
                adminElement.loading = false;
            }, function(submitTestStateChangeError) {
                adminElement.loading = false;
                dboticaServices.noConnectivityError();
            });
        } else {
            changeStateRequestEntity.doctorId = adminElement.admin.doctorActive.id;
            angular.forEach(adminElement.admin.servicesListOfTheDoctor, function(doctorServicesEntity) {
                var object = {};
                object.billingName = doctorServicesEntity.billingName;
                object.price = doctorServicesEntity.price;
                object.remark = doctorServicesEntity.remark;
                object.updatedBy = doctorServicesEntity.updatedBy;
                check = (doctorService.billingName == doctorServicesEntity.billingName) && (doctorService.price == doctorServicesEntity.price);
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
                    object.updatedDate = doctorServicesEntity.updatedDate;
                    object.state = doctorServicesEntity.state;
                    changeStateRequestEntity.doctorPriceInfos.push(object);
                }
            });
            adminElement.loading = true;
            var changeServiceStateRequestPromise = dboticaServices.submitServiceRequest(changeStateRequestEntity);
            changeServiceStateRequestPromise.then(function(successResponseOfChangeStateRequest) {
                var errorCode = successResponseOfChangeStateRequest.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    if (successResponseOfChangeStateRequest.data.success === true && successResponseOfChangeStateRequest.data.errorCode === null) {
                        var updatedDoctors = dboticaServices.doctorsOfAssistant();
                        updatedDoctors.then(function(successResponse) {
                            var errorCode = successResponse.data.errorCode;
                            if (errorCode) {
                                dboticaServices.logoutFromThePage(errorCode);
                            } else {
                                var updatedDoctorsResponse = angular.fromJson(successResponse.data.response);
                                updateTheServices(updatedDoctorsResponse);
                            }
                        }, function(errorResponse) {
                            dboticaServices.noConnectivityError();
                        });
                    }
                }
                adminElement.loading = false;
            }, function(changeStateRequestErrorResponse) {
                adminElement.loading = false;
                dboticaServices.noConnectivityError();
            });
        }
    }

    var updateTheServices = function(doctorServiceResponse) {
        adminElement.doctorsListInAdmin = [];
        adminElement.admin.servicesListOfTheDoctor = [];
        angular.forEach(doctorServiceResponse, function(doctorServiceResponseEntity) {
            adminElement.doctorsListInAdmin.push(doctorServiceResponseEntity);
            if (doctorServiceResponseEntity.id == adminElement.admin.doctorActive.id) {
                adminElement.admin.doctorActive = doctorServiceResponseEntity;
                adminElement.admin.servicesListOfTheDoctor = doctorServiceResponseEntity.doctorPriceInfos;
                adminElement.servicesList = ["Others"];
                angular.forEach(adminElement.admin.servicesListOfTheDoctor, function(eachService) {
                    adminElement.servicesList.unshift(eachService.billingName);
                });
            }
        });
        adminElement.doctorsListInAdmin.push(generalObject);
    }

    var getServiceRequestObject = function(testOrService) {
        var newObject = {};
        newObject.roomIds = [];
        var assistantCurrentlyLoggedIn = localStorage.getItem('assistantCurrentlyLoggedIn');
        assistantCurrentlyLoggedIn = $.parseJSON(assistantCurrentlyLoggedIn);
        if (testOrService == test) {
            newObject.organizationId = organizationId;
            newObject.diagnosisTest = adminElement.admin.procedureNameTxtBox;
            newObject.duration = adminElement.admin.duration;
            newObject.duration = newObject.duration * 60 * 100;
            newObject.roomIds.push(adminElement.activeRoomId);
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

    var getRoomAndFloorNo = function() {
        angular.forEach(adminElement.admin.servicesListOfTheDoctor, function(entity) {
            var localRoomAndFloor = _.filter(adminElement.activeRooms, function(roomEntity) {
                if (roomEntity.id == entity.roomIds[0]) {
                    return roomEntity;
                }
            });
            entity.roomAndFloorNumbers = localRoomAndFloor[0].roomNo + '-' + localRoomAndFloor[0].floorNo;
        });
    }

    function toggleBetweenViews() {
        if (adminElement.changeAddressLink == true) {
            adminElement.changeAddressLink = false;
            adminElement.backLink = true;
            adminElement.doctorSectionDiv = false;
            adminElement.changeAddressView = true;
        } else {
            adminElement.backLink = false;
            adminElement.changeAddressLink = true;
            adminElement.changeAddressView = false;
            adminElement.doctorSectionDiv = true;
        }
    }

    function updateAddress() {
        var addressRequestEntity = {};
        if (organizationAddressId == '') {
            addressRequestEntity = adminElement.orgAddress;
        } else {
            addressRequestEntity = adminElement.orgAddress;
            addressRequestEntity.id = organizationAddressId;
        }
        var updateOrgAddressPromise = dboticaServices.updateOrgAddress(addressRequestEntity);
        updateOrgAddressPromise.then(function(updateOrgSuccess) {
            var errorCode = updateOrgSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage();
            } else {
                updatedAddress = angular.fromJson(updateOrgSuccess.data.response);
                if (errorCode == null && updateOrgSuccess.data.success == true) {
                    if (updatedAddress.length > 0) {
                        adminElement.orgAddress = updatedAddress[0];
                    }
                    dboticaServices.updateAddressSuccessSwal();
                }
            }
        }, function(updateOrgError) {
            dboticaServices.noConnectivityError();
        });
    }

    function roomSelectForTest(selectedRoom, index) {
        if (selectedRoom.roomNo !== '--Select Room-') {
            adminElement.roomName = selectedRoom.roomNo + '-' + selectedRoom.floorNo;
            adminElement.activeRoomId = selectedRoom.id;
        } else {
            adminElement.activeRoomId = '';
            adminElement.roomName = '--Select Room--';
        }
    }

    function testSearch() {
        var testOnSearch = adminElement.admin.procedureNameTxtBox;
        if (testOnSearch.length > 0) {
            var testsPromise = dboticaServices.getTests(testOnSearch);
            testsPromise.then(function(getTestsSuccess) {
                var errorCode = getTestsSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    adminElement.testsList = angular.fromJson(getTestsSuccess.data.response);
                    if (adminElement.testsList.length > 0) {
                        angular.element('#testDropdownDiv').show();
                        angular.element('#testsDropDown').css('display', 'block');
                        adminElement.dropdownActive = true;
                    } else {
                        adminElement.dropdownActive = false;
                    }
                }
            }, function(getTestsError) {
                dboticaServices.noConnectivityError();
            });
        } else {
            adminElement.dropdownActive = false;
        }
    }

    angular.element(window).resize(function() {
        $('#testsDropDown').css('display', 'none');
    });

    $(document).on('click', function(e) {
        if ($(e.target).closest("#exampleInputProcedureName").length === 0) {
            $("#testDropdownDiv").hide();
            adminElement.dropdownActive = false;
        }
    });

    function selectTestFromTheDropdown(selectedTest) {
        adminElement.dropdownActive = false;
        adminElement.admin.procedureNameTxtBox = selectedTest.diagnosisTest;
    }
};
