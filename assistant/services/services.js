var myapp = angular.module('appServices', []);

myapp.service('dboticaServices', ['$http', '$state', '$log', '$q', function($http, $state, $log, $q) {

    var loginResponseSuccessValue, loginResponseErrorCode, loginResponseDoctorsList, loginResponseDoctorName, loginResponseDoctorSpecialization, loginResponseDoctorId, loginResponseDayStartTime, loginResponseDayEndTime, loginResponseTimePerPatient;
    var loginResponsePatientsList = [];
    var invoiceObject, doctorActive, patientData = {};
    var patientName = "";
    var doctorName = "";
    var medicineNames, doctorsListArray = [];
    var testsList = [];
    var testsNameList = [];
    var medicine = [];
    var itemSelected, longDate;

    this.login = function(userEmailId, password) {
        var inputData = {};
        var deferred = $q.defer();
        inputData.emailId = userEmailId;
        inputData.password = password;
        var req = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/assistant/login',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(inputData)
        }
        $http(req).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    };

    this.doctorsOfAssistant = function() {
        var deferred = $q.defer();
        var requestEntity = {
            method: "GET",
            url: "http://localhost:8081/dbotica-spring/assistant/getMyDoctors",
            withCredentials: true
        }
        $http(requestEntity).then(function(doctorsResponse) {
            deferred.resolve(doctorsResponse);

        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    };

    this.getPatientsListOfDoctor = function(doctorId) {
        var deferred = $q.defer();
        var req = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/assistant/getDoctorEvents?doctorId=' + doctorId,
            withCredentials: true
        }
        $http(req).then(function(response) {
            $log.log("selected doctor response is----", response);
            deferred.resolve(response);

        }, function(errorResponse) {
            $log.log("In doctor selected error response.");
            deferred.reject(errorResponse);

        });
        return deferred.promise;
    }

    this.getPatientDetailsOfThatNumber = function(phoneNumberForSearch) {
        var deferred = $q.defer();
        var req = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/assistant/getPatients?patientIds=' + phoneNumberForSearch,
            withCredentials: true
        }
        $http(req).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.futureAppointmentListOfNumber = function(patientPhoneNumberForCancelling, doctorId) {
        var deferred = $q.defer();
        var req = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/assistant/getDoctorEvents?patientPhoneNumber=' + patientPhoneNumberForCancelling + '&doctorId=' + doctorId + '&fetchAllEvents=true',
            withCredentials: true
        }
        $http(req).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.cancelAppointmentOfADateOrUpdateDoctorEvent = function(cancelBook) {
        var deferred = $q.defer();
        var req = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/assistant/updateCalendarEvent',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(cancelBook)
        }
        $http(req).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.updateDoctorTimings = function(addTimeObj) {
        var deferred = $q.defer();
        var req = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/assistant/updateDoctorTimings',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(addTimeObj)
        }
        $http(req).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.getDoctorEventsOfDocOnADate = function(doctorId, milliSecsOfDate) {
        var deferred = $q.defer();
        var req = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/assistant/getDoctorEvents?doctorId=' + doctorId + '&requestTime=' + milliSecsOfDate,
            withCredentials: true

        }
        $http(req).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.addNewPatient = function(newPatientDetails) {
        var deferred = $q.defer();
        var req = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/assistant/addPatient',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: newPatientDetails
        }
        $http(req).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;

    }

    this.logout = function() {
        var deferred = $q.defer();
        var req = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/assistant/logout',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true
        }
        $http(req).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.addItemIntoStock = function(object) {
        $log.log("object is----", object);
        var deferred = $q.defer();
        var requestEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/inventory/addItem',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(object)
        }
        $http(requestEntity).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.getItemsOfTheTable = function(start, limit, stockType, itemType, organizationId) {
        var deferred = $q.defer();
        var localUrl;
        if (itemType == "All") {
            switch (stockType) {
                case 'All':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId });
                    break;
                case 'Low':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "lowStock": true });
                    break;
                case 'Expired':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "expired": true });
                    break;
            }

        }
        if (itemType == "Drug") {
            switch (stockType) {
                case 'All':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "inventoryItemType": "DRUG" });
                    break;
                case 'Low':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "lowStock": true, "inventoryItemType": "DRUG" });
                    break;
                case 'Expired':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "expired": true, "inventoryItemType": "DRUG" });
                    break;
            }

        }
        if (itemType == "Supplies") {
            switch (stockType) {
                case 'All':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "inventoryItemType": "SUPPLIES" });
                    break;
                case 'Low':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "lowStock": true, "inventoryItemType": "SUPPLIES" });
                    break;
                case 'Expired':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "expired": true, "inventoryItemType": "SUPPLIES" });
                    break;
            }

        }
        if (itemType == "Equipments") {
            switch (stockType) {
                case 'All':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "inventoryItemType": "EQUIPMENT" });
                    break;
                case 'Low':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "lowStock": true, "inventoryItemType": "EQUIPMENT" });
                    break;
                case 'Expired':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "expired": true, "inventoryItemType": "EQUIPMENT" });
                    break;
            }
        }
        if (itemType == "Others") {
            switch (stockType) {
                case 'All':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "inventoryItemType": "OTHERS" });
                    break;
                case 'Low':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "lowStock": true, "inventoryItemType": "OTHERS" });
                    break;
                case 'Expired':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "expired": true, "inventoryItemType": "OTHERS" });
                    break;
            }
        }
        var requestEntity = {
            method: 'GET',
            url: localUrl,
            withCredentials: true
        }
        $http(requestEntity).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.addBatchToTheDrug = function(requestEntity) {
        var deferred = $q.defer();
        var req = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/inventory/addBatch',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: requestEntity
        }
        $http(req).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.getAllBatches = function(itemId, organizationId) {
        var deferred = $q.defer();
        var requestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/inventory/getItemDetails?itemId=' + itemId + '&organizationId=' + organizationId,
            withCredentials: true
        }
        $http(requestEntity).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.getItemFromDB = function(itemName, organizationId) {
        var deferred = $q.defer();
        var requestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "itemName": itemName, "organizationId": organizationId }),
            withCredentials: true,
        }
        $http(requestEntity).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.updateTheBatch = function(req) {
        var deferred = $q.defer();
        var requestEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/inventory/updateBatchCount',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: req
        }
        $http(requestEntity).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.lowStockExpiredStockItems = function(lowOrExpired, start, limit, itemType, organizationId) {
        var deferred = $q.defer();
        var requestEntity = {};
        if (lowOrExpired == "lowItems") {
            var localUrl;
            switch (itemType) {
                case 'All':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "lowStock": true, "start": start, "limit": limit, "organizationId": organizationId });
                    break;
                case 'Drug':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "lowStock": true, "start": start, "limit": limit, "inventoryItemType": "DRUG", "organizationId": organizationId });
                    break;
                case 'Supplies':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "lowStock": true, "start": start, "limit": limit, "inventoryItemType": "SUPPLIES", "organizationId": organizationId });
                    break;
                case 'Equipments':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "lowStock": true, "start": start, "limit": limit, "inventoryItemType": "EQUIPMENT", "organizationId": organizationId });
                    break;
                case 'Others':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "lowStock": true, "start": start, "limit": limit, "inventoryItemType": "OTHERS", "organizationId": organizationId });
                    break;
            }
            requestEntity = {
                method: 'GET',
                url: localUrl,
                withCredentials: true
            }
        } else {
            $log.log("in expired");
            var localUrl;
            switch (itemType) {
                case 'All':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "expired": true, "start": start, "limit": limit, "organizationId": organizationId });
                    break;
                case 'Drug':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "expired": true, "start": start, "limit": limit, "inventoryItemType": "DRUG", "organizationId": organizationId });
                    break;
                case 'Supplies':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "expired": true, "start": start, "limit": limit, "inventoryItemType": "SUPPLIES", "organizationId": organizationId });
                    break;
                case 'Equipments':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "expired": true, "start": start, "limit": limit, "inventoryItemType": "EQUIPMENT", "organizationId": organizationId });
                    break;
                case 'Others':
                    localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "expired": true, "start": start, "limit": limit, "inventoryItemType": "OTHERS", "organizationId": organizationId });
                    break;
            }
            requestEntity = {
                method: 'GET',
                url: localUrl,
                withCredentials: true
            }
        }

        $http(requestEntity).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });

        return deferred.promise;
    }

    this.getStockItemsForTheTable = function(type, start, limit, stockType, organizationId) {
        var localUrl;
        var deferred = $q.defer();
        var requestEntity;
        switch (type) {
            case 'All':
                switch (stockType) {
                    case 'All':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Low':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "lowStock": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Expired':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "expired": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                }
                break;
            case 'DrugItems':
                switch (stockType) {
                    case 'All':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "DRUG", "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Low':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "DRUG", "lowStock": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Expired':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "DRUG", "expired": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                }
                break;
            case 'EquipmentItems':
                $log.log("in equipment items");
                switch (stockType) {
                    case 'All':
                        $log.log("in stock type of equipment----");
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "EQUIPMENT", "start": start, "limit": limit, "organizationId": organizationId });
                        $log.log("local url is----", localUrl);
                        break;
                    case 'Low':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "EQUIPMENT", "lowStock": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Expired':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "EQUIPMENT", "expired": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                }
                break;
            case 'SuppliesItems':
                switch (stockType) {
                    case 'All':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "SUPPLIES", "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Low':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "SUPPLIES", "lowStock": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Expired':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "SUPPLIES", "expired": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                }
                break;
            case 'OtherItems':
                switch (stockType) {
                    case 'All':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "OTHERS", "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Low':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "OTHERS", "lowStock": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Expired':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "OTHERS", "expired": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                }
                break;
        }
        requestEntity = {
            method: 'GET',
            url: localUrl,
            withCredentials: true
        }
        $log.log("req entity is----", requestEntity);
        $http(requestEntity).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.submitServiceRequest = function(serviceRequestEntity) {
        var deferred = $q.defer();
        var serviceRequestIs = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/organization/updateDoctorPrices',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(serviceRequestEntity)
        }
        $http(serviceRequestIs).then(function(successResponse) {
            deferred.resolve(successResponse);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.submitTestRequest = function(testObject) {
        var deferred = $q.defer();
        var testRequest = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/organization/updateTest',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(testObject)
        }
        $http(testRequest).then(function(testRequestSuccessResponse) {
            deferred.resolve(testRequestSuccessResponse);
        }, function(testRequestErrorResponse) {
            deferred.reject(testRequestErrorResponse);
        });
        return deferred.promise;
    }

    this.getTests = function() {
        var deferred = $q.defer();
        var active = "ACTIVE";
        var getTestsRequest = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/organization/getTests',
            withCredentials: true,
            data: JSON.stringify({
                "state": active
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
        $http(getTestsRequest).then(function(getTestsSuccessResponse) {
            deferred.resolve(getTestsSuccessResponse);
        }, function(getTestsErrorResponse) {
            deferred.reject(getTestsErrorResponse);
        });

        return deferred.promise;
    }

    this.logoutFromThePage = function(errorCode) {
        switch (errorCode) {
            case "NO_USER_LOGGED_IN":
                localStorage.setItem("isLoggedInAssistant", "false");
                swal({
                    title: "Error",
                    text: "You are not logged into your account. Kindly login again to view this page",
                    type: "error",
                    confirmButtonText: "OK",
                    allowOutsideClick: true
                });
                $state.go('login');
                break;
        }

    }

    this.getLongValueOfDate = function(dateSelected) {
        var dateArray = dateSelected.split('/');
        longDate = dateArray[1] + '/' + dateArray[0] + '/' + dateArray[2];
        longDate = new Date(longDate);
        longDate = longDate.getTime();
        return longDate;
    }

    this.updateInvoice = function(invoice) {
        var deferred = $q.defer();
        $log.log("amount paid in service is----" + invoice.amountPaid);
        var invoiceRequest = {
            method: 'POST',
            url: ' http://localhost:8081/dbotica-spring/billing/updateInvoice',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(invoice)
        }
        $http(invoiceRequest).then(function(invoiceSuccessResponse) {
            deferred.resolve(invoiceSuccessResponse);
        }, function(invoiceErrorResponse) {
            deferred.reject(invoiceErrorResponse);
        });
        return deferred.promise;
    }

    this.getInvoiceHistoryOnLoad = function(organizationId) {
        var deferred = $q.defer();
        var invoiceHistoryRequest = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/billing/getInvoices?queryString=' + JSON.stringify({ 'organizationId': organizationId }),
            withCredentials: true
        }
        $http(invoiceHistoryRequest).then(function(invoiceHistorySuccessResponse) {
            deferred.resolve(invoiceHistorySuccessResponse);
        }, function(invoiceHistoryErrorResponse) {
            deferred.reject(invoiceHistoryErrorResponse);
        });
        return deferred.promise;

    }

    this.searchResultOfInvoice = function(organizationId, searchType, firstSearchEntity, secondSearchEntity) {
        var deferred = $q.defer();
        var localUrl;
        var invoiceSearchRequestEntity;
        switch (searchType) {
            case 'Phone Number':
                localUrl = 'http://localhost:8081/dbotica-spring/billing/getInvoices?queryString=' + JSON.stringify({ 'patientPhoneNumber': firstSearchEntity, "organizationId": organizationId });
                break;
            case 'Bill Number':
                localUrl = 'http://localhost:8081/dbotica-spring/billing/getInvoices?queryString=' + JSON.stringify({ 'invoiceId': firstSearchEntity, "organizationId": organizationId });
                break;
            case 'Date':
                var longValueOfStartDate = "";
                var longValueOfEndDate = "";
                if (firstSearchEntity !== "") {
                    longValueOfStartDate = this.getLongValueOfDate(firstSearchEntity);
                } else {
                    longValueOfStartDate = 0;
                }
                if (secondSearchEntity !== "") {
                    longValueOfEndDate = this.getLongValueOfDate(secondSearchEntity);
                } else {
                    longValueOfEndDate = 0;
                }
                localUrl = 'http://localhost:8081/dbotica-spring/billing/getInvoices?queryString=' + JSON.stringify({ 'startTime': longValueOfStartDate, 'endTime': longValueOfEndDate, "organizationId": organizationId });
                break;
            case 'Next Due Date':
                var longValueOfDate = this.getLongValueOfDate(firstSearchEntity);
                $log.log("due date is----" + longValueOfDate);
                localUrl = 'http://localhost:8081/dbotica-spring/billing/getInvoices?queryString=' + JSON.stringify({ 'nextPaymentDueDate': longValueOfDate, "organizationId": organizationId });
                break;
            case 'Doctor':
                $log.log("doctor id is----" + firstSearchEntity);
                localUrl = 'http://localhost:8081/dbotica-spring/billing/getInvoices?queryString=' + JSON.stringify({ 'doctorId': firstSearchEntity, "organizationId": organizationId });
                break;
        }
        invoiceSearchRequestEntity = {
            method: 'GET',
            url: localUrl,
            withCredentials: true
        }
        $http(invoiceSearchRequestEntity).then(function(successResponseOfSearchRequest) {
            $log.log("in service success----");
            deferred.resolve(successResponseOfSearchRequest);
        }, function(errorResponseOfSearchRequest) {
            deferred.reject(errorResponseOfSearchRequest);
        });
        return deferred.promise;
    }

    this.getPendingInvoices = function(organizationId) {
        $log.log("org id is----" + organizationId);
        var deferred = $q.defer();
        var getPendingRequestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/billing/getInvoices?queryString=' + JSON.stringify({ 'organizationId': organizationId, 'paymentPending': true }),
            withCredentials: true
        }
        $http(getPendingRequestEntity).then(function(pendingInvoiceSuccess) {
            $log.log("in service success");
            deferred.resolve(pendingInvoiceSuccess);
        }, function(pendingInvoiceError) {
            deferred.reject(pendingInvoiceError);
        });
        return deferred.promise;
    }

    this.getPatientsListOfDoctorSorted = function(patientsList) {
        var walkInPatientsList = [];
        var appointmentPatientsList = [];
        loginResponsePatientsList = [];
        for (var patientsListIndex = 0, patientsListLength = patientsList.length; patientsListIndex < patientsListLength; patientsListIndex++) {
            if (patientsList[patientsListIndex].calendarStatus === "WALK_IN") {
                patientsList[patientsListIndex].startTime = "";
                walkInPatientsList.push(patientsList[patientsListIndex]);
            } else {
                appointmentPatientsList.push(patientsList[patientsListIndex]);

            }
        }
        for (var appointmentPatientsListIndex = 0, appointmentPatientsListLength = appointmentPatientsList.length; appointmentPatientsListIndex < appointmentPatientsListLength; appointmentPatientsListIndex++) {
            if (appointmentPatientsList[appointmentPatientsListIndex].state === "INACTIVE") {
                continue;
            } else {
                if (!!appointmentPatientsList[appointmentPatientsListIndex].patientId && appointmentPatientsList[appointmentPatientsListIndex].patientId.length > 0) {
                    $log.log("in final appointment list---");
                    loginResponsePatientsList.push(appointmentPatientsList[appointmentPatientsListIndex]);
                }
            }
        }
        for (var walkInPatientsListIndex = 0, walkInPatientsListLength = walkInPatientsList.length; walkInPatientsListIndex < walkInPatientsListLength; walkInPatientsListIndex++) {
            if (walkInPatientsList[walkInPatientsListIndex].state === "INACTIVE") {
                continue;
            } else {
                if (!!walkInPatientsList[walkInPatientsListIndex].patientId && walkInPatientsList[walkInPatientsListIndex].patientId.length > 0) {
                    $log.log("in final walkinList---");
                    loginResponsePatientsList.push(walkInPatientsList[walkInPatientsListIndex]);
                }
            }
        }

        $log.log("walk in patients list is----", walkInPatientsList);
        $log.log("appointment patients list is----", appointmentPatientsList);
        $log.log("patients list to be displayed is----", loginResponsePatientsList);
        $log.log("patients List is----", patientsList);
        return loginResponsePatientsList;

    }


    this.setSuccessValue = function(value) {
        loginResponseSuccessValue = value;
    }

    this.getSuccessValue = function() {
        return loginResponseSuccessValue;
    }

    this.getErrorCode = function() {
        return loginResponseErrorCode;
    }

    this.setMedicine = function(value) {
        medicine = value;
    }

    this.getMedicine = function() {
        return medicine;
    }

    this.setMedicineNames = function(value) {
        medicineNames = value;

    }

    this.getMedicineNames = function() {

        return medicineNames;
    }

    this.setDoctorsOfThatAssistant = function(value) {
        loginResponseDoctorsList = value;
    }

    this.getDoctorsList = function() {
        return loginResponseDoctorsList;
    }

    this.setFirstDoctorName = function(value) {
        loginResponseDoctorName = value;
    }

    this.getFirstDoctorName = function() {
        return loginResponseDoctorName;
    }

    this.setFirstDoctorSpecialization = function(value) {
        loginResponseDoctorSpecialization = value;
    }

    this.getFirstDoctorSpecialization = function() {
        return loginResponseDoctorSpecialization;
    }

    this.setFirstDoctorId = function(value) {
        loginResponseDoctorId = value;
    }

    this.getFirstDoctorId = function() {
        return loginResponseDoctorId;
    }

    this.setFirstDoctorDayStartTime = function(value) {
        loginResponseDayStartTime = value;
    }

    this.getFirstDoctorDayStartTime = function() {
        return loginResponseDayStartTime;
    }

    this.setFirstDoctorDayEndTime = function(value) {
        loginResponseDayEndTime = value;
    }

    this.getFirstDoctorDayEndTime = function() {
        return loginResponseDayEndTime;
    }

    this.setFirstDoctorTimePerPatient = function(value) {
        loginResponseTimePerPatient = value;
    }

    this.getFirstDoctorTimePerPatient = function() {
        return loginResponseTimePerPatient;
    }

    this.getFirstDoctorPatientsList = function() {
        return loginResponsePatientsList;
    }

    this.setItemSelected = function(value) {
        itemSelected = value;
    }

    this.getSelectedItem = function() {
        return itemSelected;
    }

    this.setTestsFromBillManagement = function(value) {
        testsList = value;
    }

    this.getTestsFromService = function() {
        return testsList;
    }

    this.setTestsNamesFromBillManagement = function(value) {
        testsNameList = value;
    }

    this.getTestsNamesList = function() {
        return testsNameList;
    }

    this.setInvoice = function(value) {
        invoiceObject = value;
    }

    this.getInvoice = function() {
        return invoiceObject;
    }

    this.setDoctorsDetailsArray = function(value) {
        doctorsListArray = value;
    }

    this.getDoctorsDetailsArray = function(doctorId) {
        for (var doctorIndex in doctorsListArray) {
            if (doctorsListArray[doctorIndex].id == doctorId) {
                doctorActive = doctorsListArray[doctorIndex];
            }
        }
        return doctorActive;
    }

    this.getPatientDetails = function(patientId) {

        var patientPromise = this.getPatientDetailsOfThatNumber(patientId);

        patientPromise.then(function(patientSuccess) {
            var errorCode = patientSuccess.data.errorCode;
            if (!!errorCode) {
                this.logoutFromThePage();
            } else {
                var patientDetails = $.parseJSON(patientSuccess.data.response);

                patientData = patientDetails[0];
            }
        }, function(patientError) {

        });

        return patientData;
    }

    this.longDateToReadableDate = function(longDate) {
        var result;
        if (longDate == undefined) {
            result = "";
        } else {
            result = new Date(longDate);
            result = result.toLocaleString();
            var resultArray = result.split(',');
            var resultArrayDate = resultArray[0];
            var resultArrayDateReadable = resultArrayDate.split('/');
            result = resultArrayDateReadable[1] + '/' + resultArrayDateReadable[0] + '/' + resultArrayDateReadable[2];
        }
        return result;
    }

    this.getPaymentEntriesToDisplay = function(paymentEntries) {
        var paymentEntriesAndTotalPaidAmount = [];
        var totalAmountPaid = 0;
        var paymentEntriesAfterSorting = [];
        if (paymentEntries.length > 0) {
            for (paymentIndex in paymentEntries) {
                var paymentObject = {};
                paymentObject.amountPaid = paymentEntries[paymentIndex].amountPaid / 100;
                totalAmountPaid += paymentEntries[paymentIndex].amountPaid / 100;
                paymentObject.updatedAt = this.longDateToReadableDate(paymentEntries[paymentIndex].updatedAt);
                paymentEntriesAfterSorting.push(paymentObject);
            }
        }
        paymentEntriesAndTotalPaidAmount.push(paymentEntriesAfterSorting);
        paymentEntriesAndTotalPaidAmount.push(totalAmountPaid);
        return paymentEntriesAndTotalPaidAmount;
    }

    this.getItemsToBeDisplayed = function(itemsFromInvoice) {
        $log.log("items before----", itemsFromInvoice);
        for (var itemIndex in itemsFromInvoice) {
            itemsFromInvoice[itemIndex].cost = itemsFromInvoice[itemIndex].cost / 100;
            itemsFromInvoice[itemIndex].amountCharged = itemsFromInvoice[itemIndex].amountCharged / 100;
        }
        $log.log("items after----", itemsFromInvoice);
        return itemsFromInvoice;
    }

    this.validPhoneNumberSwal = function() {
        swal({
            title: "Error",
            text: "Please Enter Valid Phone Number",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.showNoPhoneNumberSwal = function() {
        swal({
            title: "Error",
            text: "Please Enter Phone Number Before Search",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.showNoPatientSwal = function() {
        swal({
            title: "Error",
            text: "Enter Patient Details Before Billing",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }


    this.nextDueErrorSwal = function() {
        swal({
            title: "Error",
            text: "Enter next Due Amount Less than Total Due",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.loginErrorSwal = function() {
        swal({
            title: "Error",
            text: "User Id or Password is Missing!!!",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.noMedicineCostSwal = function() {
        swal({
            title: "Error",
            text: "Please enter the medicine cost details",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.noMedicineNameSwal = function() {
        swal({
            title: "Error",
            text: "Please enter the Medicine Name",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.noTestNameSwal = function() {
        swal({
            title: "Error",
            text: "Please enter the Test Name",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.noTestCostSwal = function() {
        swal({
            title: "Error",
            text: "Please enter the Test Cost Details",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.noConsultationCostSwal = function() {
        swal({
            title: "Error",
            text: "Please enter the Doctor Service Cost Details",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }
}]);
