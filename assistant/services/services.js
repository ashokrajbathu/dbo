var myapp = angular.module('appServices', []);

myapp.service('dboticaServices', ['$http', '$state', '$log', '$q', function($http, $state, $log, $q) {

    var loginResponseSuccessValue, loginResponseErrorCode, loginResponseDoctorsList, loginResponseDoctorName, loginResponseDoctorSpecialization, loginResponseDoctorId, loginResponseDayStartTime, loginResponseDayEndTime, loginResponseTimePerPatient;
    var loginResponsePatientsList = [];
    var invoiceObject, doctorActive, patientData = {};
    var inpatient = {};
    var patientName = "";
    var doctorName = "";
    var medicineNames, doctorsListArray = [];
    var testsList = [];
    var testsNameList = [];
    var doctorCategoriesList = [];
    var doctorsNamesList = [];
    var medicine = [];
    var medicinesFromNurse = [];
    var medicineNamesFromNurse = [];
    var roomCategoriesList = [];
    var patientsArray = [];
    var progressNotePatientEvents = [];
    var vitalSignPatientEvents = [];
    var selectedPatient = {};
    var itemSelected, longDate;
    var intakeEvents = [];
    var outputEventsList = [];
    var transfersArray = [];

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
            deferred.resolve(response);

        }, function(errorResponse) {
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

    this.getDrugsFromDb = function(start, limit, brandName) {
        var deferred = $q.defer();
        var requestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/drug/getDrugs?start=' + start + '&limit=' + limit + '&brandName=' + brandName,
            withCredentials: true
        }
        $http(requestEntity).then(function(getDrugSuccess) {
            deferred.resolve(getDrugSuccess);
        }, function(getDrugError) {
            deferred.reject(getDrugError);
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

    this.getItemFromDBWithId = function(itemId, organizationId) {
        var deferred = $q.defer();
        var requestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "itemId": itemId, "organizationId": organizationId }),
            withCredentials: true,
        }
        $http(requestEntity).then(function(successResponse) {
            deferred.resolve(successResponse);
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
                switch (stockType) {
                    case 'All':
                        localUrl = 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "EQUIPMENT", "start": start, "limit": limit, "organizationId": organizationId });
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

    this.getTestsByAdmin = function() {
        var deferred = $q.defer();
        var getTestsRequest = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/organization/getTests',
            withCredentials: true
        }
        $http(getTestsRequest).then(function(getTestsSuccessResponse) {
            deferred.resolve(getTestsSuccessResponse);
        }, function(getTestsErrorResponse) {
            deferred.reject(getTestsErrorResponse);
        });

        return deferred.promise;
    }

    this.logoutFromThePage = function(errorCode) {
        if (errorCode == 'NO_USER_LOGGED_IN' || errorCode == 'USER_ALREADY_LOGGED_IN') {
            swal({
                title: "Error",
                text: "You are not logged into your account. Kindly login again to view this page",
                type: "error",
                confirmButtonText: "OK",
                allowOutsideClick: true
            });
            localStorage.clear();
            localStorage.setItem("isLoggedInAssistant", "false");
            $state.go('login');
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
                localUrl = 'http://localhost:8081/dbotica-spring/billing/getInvoices?queryString=' + JSON.stringify({ 'nextPaymentDueDate': longValueOfDate, "organizationId": organizationId });
                break;
            case 'Doctor':
                localUrl = 'http://localhost:8081/dbotica-spring/billing/getInvoices?queryString=' + JSON.stringify({ 'doctorId': firstSearchEntity, "organizationId": organizationId });
                break;
        }
        invoiceSearchRequestEntity = {
            method: 'GET',
            url: localUrl,
            withCredentials: true
        }
        $http(invoiceSearchRequestEntity).then(function(successResponseOfSearchRequest) {
            deferred.resolve(successResponseOfSearchRequest);
        }, function(errorResponseOfSearchRequest) {
            deferred.reject(errorResponseOfSearchRequest);
        });
        return deferred.promise;
    }

    this.getPendingInvoices = function(organizationId) {
        var deferred = $q.defer();
        var getPendingRequestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/billing/getInvoices?queryString=' + JSON.stringify({ 'organizationId': organizationId, 'paymentPending': true }),
            withCredentials: true
        }
        $http(getPendingRequestEntity).then(function(pendingInvoiceSuccess) {
            deferred.resolve(pendingInvoiceSuccess);
        }, function(pendingInvoiceError) {
            deferred.reject(pendingInvoiceError);
        });
        return deferred.promise;
    }

    this.getPrescriptionsOfThePatient = function(patientId) {
        var deferred = $q.defer();
        var start = parseInt(0);
        var limit = parseInt(3);
        var getPrescriptionRequestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/assistant/patient/getPrescriptions?patientId=' + patientId + '&start=' + start + '&limit=' + limit,
            withCredentials: true
        }
        $http(getPrescriptionRequestEntity).then(function(gtPrescriptionSuccess) {
            deferred.resolve(gtPrescriptionSuccess);
        }, function(getPrescriptionError) {
            deferred.reject(getPrescriptionError);
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
                    loginResponsePatientsList.push(appointmentPatientsList[appointmentPatientsListIndex]);
                }
            }
        }
        for (var walkInPatientsListIndex = 0, walkInPatientsListLength = walkInPatientsList.length; walkInPatientsListIndex < walkInPatientsListLength; walkInPatientsListIndex++) {
            if (walkInPatientsList[walkInPatientsListIndex].state === "INACTIVE") {
                continue;
            } else {
                if (!!walkInPatientsList[walkInPatientsListIndex].patientId && walkInPatientsList[walkInPatientsListIndex].patientId.length > 0) {
                    loginResponsePatientsList.push(walkInPatientsList[walkInPatientsListIndex]);
                }
            }
        }

        return loginResponsePatientsList;

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

    this.setMedicinesFromNurse = function(value) {
        medicinesFromNurse = value;
    }

    this.getMedicinesFromNurse = function() {
        return medicinesFromNurse;
    }

    this.setMedicineNamesFromNurse = function(value) {
        medicineNamesFromNurse = value;
    }

    this.getMedicineNamesFromNurse = function() {
        return medicineNamesFromNurse;
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
        if (longDate == undefined || longDate == "") {
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
        for (var itemIndex in itemsFromInvoice) {
            itemsFromInvoice[itemIndex].cost = itemsFromInvoice[itemIndex].cost / 100;
            itemsFromInvoice[itemIndex].amountCharged = itemsFromInvoice[itemIndex].amountCharged / 100;
        }
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

    this.batchAdditionForItemUnsuccessSwal = function() {
        swal({
            title: "Error",
            text: "Batch Could Not Be Added To Item",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.itemAdditionIntoStockUnsuccessfullSwal = function() {
        swal({
            title: "Error",
            text: "Item Could not be Added Into Stock",
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

    this.itemAdditionIntoStockSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Item Added Successfully",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.batchAdditionForItemSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Batch Successfully Added.",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.noConnectivityError = function() {
        localStorage.clear();
        localStorage.setItem("isLoggedInAssistant", "false");
        swal({
            title: "Error",
            text: "Please try after some time!!!!",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
        $state.go('login');
    }

    this.itemUpdateSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Item Details Updated SuccessFully!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.roomCategorySuccessSwal = function() {
        swal({
            title: "Success",
            text: "Room Category Added or Updated SuccessFully!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.deleteRoomCategorySuccessSwal = function() {
        swal({
            title: "Success",
            text: "Room Category Deleted SuccessFully!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.deleteRoomSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Selected Room Deleted SuccessFully!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.deleteDoctorCategorySuccessSwal = function() {
        swal({
            title: "Success",
            text: "Selected Doctor Category Deleted SuccessFully!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.addBatchFromItemInfo = function() {
        swal({
            title: "Success",
            text: "Batch Successfully Added.",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.getPatientOrDoctorName = function(value) {
        var patientFirstName = "";
        var patientLastName = "";
        var name = "";
        if (value.hasOwnProperty('firstName')) {
            patientFirstName = value.firstName;
        }
        if (value.hasOwnProperty('lastName')) {
            if (patientFirstName !== "") {
                patientLastName = " " + value.lastName;
            } else {
                patientLastName = value.lastName;
            }
        }
        name = patientFirstName + patientLastName;
        return name;
    }

    this.addOrUpdateRoomCategory = function(roomCategoryObject) {
        var deferred = $q.defer();
        var roomCategoryEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/updateRoomCategory',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(roomCategoryObject)
        }
        $http(roomCategoryEntity).then(function(addOrUpdateCategorySuccess) {
            deferred.resolve(addOrUpdateCategorySuccess);
        }, function(addOrUpdateCategoryError) {
            deferred.reject(addOrUpdateCategoryError);
        });
        return deferred.promise;
    }

    this.getRoomCategories = function(organizationId) {
        var deferred = $q.defer();
        var getRoomCategoriesEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/getRoomCategories?organizationId=' + organizationId,
            withCredentials: true
        }
        $http(getRoomCategoriesEntity).then(function(getRoomCategoriesSuuccess) {
            deferred.resolve(getRoomCategoriesSuuccess);
        }, function(getRoomCategoriesError) {
            deferred.reject(getRoomCategoriesError);
        });
        return deferred.promise;
    }

    this.addOrUpdateRoom = function(newRoomObject) {
        var deferred = $q.defer();
        var newRoomEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/updateRoom',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(newRoomObject)
        }
        $http(newRoomEntity).then(function(newRoomSuccess) {
            deferred.resolve(newRoomSuccess);
        }, function(newRoomError) {
            deferred.reject(newRoomError);
        });
        return deferred.promise;
    }

    this.addNewRoomSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Room Details Successfully Added or Updated.",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.addNewDoctorCategorySuccessSwal = function() {
        swal({
            title: "Success",
            text: "Doctor Category Details Successfully Added or Updated.",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.addNewDoctorSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Doctor Details Successfully Added or Updated.",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.patientDetailsSuccessFullyUpdatedSwal = function() {
        swal({
            title: "Success",
            text: "Patient Details Successfully Updated.",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.registerPatientSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Registered Patient Details Successfully Added or Updated.",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.getRooms = function(organizationId) {
        var deferred = $q.defer();
        var getRoomsEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/getRooms?organizationId=' + organizationId,
            withCredentials: true
        }
        $http(getRoomsEntity).then(function(getRoomsSuccess) {
            deferred.resolve(getRoomsSuccess);
        }, function(getRoomsError) {
            deferred.reject(getRoomsError);
        });
        return deferred.promise;
    }

    this.addNewDoctorCategory = function(newDoctorCategoryObject) {
        var deferred = $q.defer();
        var addNewDoctorCategoryEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/updateDoctorCategory',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(newDoctorCategoryObject)
        }
        $http(addNewDoctorCategoryEntity).then(function(addNewDoctorResponse) {
            deferred.resolve(addNewDoctorResponse);
        }, function(addNewDoctorErrorResponse) {
            deferred.reject(addNewDoctorErrorResponse);
        });
        return deferred.promise;
    }

    this.getDoctorCategories = function(organizationId) {
        var deferred = $q.defer();
        var getDoctorCategoriesEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/getDoctorCategories?organizationId=' + organizationId,
            withCredentials: true
        }
        $http(getDoctorCategoriesEntity).then(function(doctorCategoriesSuccess) {
            deferred.resolve(doctorCategoriesSuccess);
        }, function(doctorCategoriesError) {
            deferred.reject(doctorCategoriesError);
        });
        return deferred.promise;
    }

    this.addNewDoctorToACategory = function(addDoctorToACategoryObject) {
        var deferred = $q.defer();
        var addNewDoctorRequestentity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/updateDoctor',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(addDoctorToACategoryObject)
        }
        $http(addNewDoctorRequestentity).then(function(newDoctorSuccess) {
            deferred.resolve(newDoctorSuccess);
        }, function(newDoctorError) {
            deferred.reject(newDoctorError);
        });
        return deferred.promise;
    }

    this.doctorsListInMainAdmin = function(organizationId) {
        var deferred = $q.defer();
        var getDoctorListInMainAdminEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/getDoctors?organizationId=' + organizationId + '&doctorType=' + '',
            withCredentials: true
        }
        $http(getDoctorListInMainAdminEntity).then(function(doctorsListInMainAdminSuccess) {
            deferred.resolve(doctorsListInMainAdminSuccess);
        }, function(doctorsListInMainError) {
            deferred.reject(doctorsListInMainError);
        });
        return deferred.promise;
    }

    this.deleteDoctorSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Selected Doctor Deleted SuccessFully!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.deleteBedSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Selected bed Deleted SuccessFully!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.deleteRegisteredPatientSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Selected Registered Patient Deleted SuccessFully!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.addOrUpdateBedSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Bed Details Successfully added or updated!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.addNewBed = function(addNewBedRequest) {
        var deferred = $q.defer();
        var addNewBedRequestEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/updateBed',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(addNewBedRequest)
        }
        $http(addNewBedRequestEntity).then(function(addNewSuccess) {
            deferred.resolve(addNewSuccess);
        }, function(addNewError) {
            deferred.reject(addNewError);
        });
        return deferred.promise;
    }

    this.getBeds = function(organizationId) {
        var deferred = $q.defer();
        var getBedsRequestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/getBeds?organizationId=' + organizationId,
            withCredentials: true
        }
        $http(getBedsRequestEntity).then(function(getBedsSuccess) {
            deferred.resolve(getBedsSuccess);
        }, function(getBedsError) {
            deferred.reject(getBedsError);
        });
        return deferred.promise;
    }

    this.registerPatient = function(registerPatientEntityFromController) {
        var deferred = $q.defer();
        var registPatientEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/updatePatient',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(registerPatientEntityFromController)
        }
        $http(registPatientEntity).then(function(registerPatientSuccess) {
            deferred.resolve(registerPatientSuccess);
        }, function(registerPatientError) {
            deferred.reject(registerPatientError);
        });
        return deferred.promise;
    }

    this.newDoctorByAssistant = function(newDoctor) {
        var deferred = $q.defer();
        var newDoctorEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/doctor/signup',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(newDoctor)
        }
        $http(newDoctorEntity).then(function(newDoctorSuccess) {
            deferred.resolve(newDoctorSuccess);
        }, function(newDoctorError) {
            deferred.reject(newDoctorError);
        });
        return deferred.promise;
    }

    this.getOrganizationAddress = function() {
        var deferred = $q.defer();
        var addressEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/assistant/getAddress',
            withCredentials: true,
        }
        $http(addressEntity).then(function(addressSuccess) {
            deferred.resolve(addressSuccess);
        }, function(addressError) {
            deferred.reject(addressError);
        });
        return deferred.promise;
    }

    this.getRegisteredPatients = function(organizationId) {
        var deferred = $q.defer();
        var registeredPatientsRequestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/getPatients?organizationId=' + organizationId,
            withCredentials: true
        }
        $http(registeredPatientsRequestEntity).then(function(registeredPatientSuccess) {
            deferred.resolve(registeredPatientSuccess);
        }, function(registeredPatientError) {
            deferred.reject(registeredPatientError);
        });
        return deferred.promise;
    }

    this.requiredIndexFromArray = function(searchArray, requiredId) {
        var result = '';
        for (var index in searchArray) {
            if (searchArray[index].id == requiredId) {
                result = index;
                break;
            } else {
                continue;
            }
        }
        return result;
    }

    this.getOrganizationAddress = function() {
        var deferred = $q.defer();
        var addressRequestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/assistant/getAddress',
            withCredentials: true
        }
        $http(addressRequestEntity).then(function(orgSuccess) {
            deferred.resolve(orgSuccess);
        }, function(orgError) {
            deferred.reject(orgError);
        });
        return deferred.promise;
    }

    this.updateOrgAddress = function(updateAddress) {
        var deferred = $q.defer();
        var updateEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/assistant/updateAddress',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(updateAddress)
        }
        $http(updateEntity).then(function(updateSuccess) {
            deferred.resolve(updateSuccess);
        }, function(updateError) {
            deferred.reject(updateError);
        });
        return deferred.promise;
    }

    this.updateAddressSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Organization Address Successfully added or updated!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.setPatientDetailsInService = function(value) {
        selectedPatient = value;
    }

    this.getPatientDetailsFromService = function() {
        return selectedPatient;
    }

    this.patientEvent = function(patientEventToBeUpdated) {
        var deferred = $q.defer();
        var patientEventRequestEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/updatePatientEvent',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(patientEventToBeUpdated)
        }
        $http(patientEventRequestEntity).then(function(eventSuccess) {
            deferred.resolve(eventSuccess);
        }, function(eventError) {
            deferred.reject(eventError);
        });
        return deferred.promise;
    }

    this.getPatientEvents = function(organizationId) {
        var deferred = $q.defer();
        var getEventsRequestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/getPatientEvents?organizationId=' + organizationId,
            withCredentials: true
        }
        $http(getEventsRequestEntity).then(function(getEventsSuccess) {
            deferred.resolve(getEventsSuccess);
        }, function(getEventsError) {
            deferred.reject(getEventsError);
        });
        return deferred.promise;
    }

    this.addPatientToBed = function(addPatientBedObject) {
        var deferred = $q.defer();
        var addPatientRequestEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/addPatientToBed',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(addPatientBedObject)
        }
        $http(addPatientRequestEntity).then(function(addPatientSuccess) {
            deferred.resolve(addPatientSuccess);
        }, function(addPatientError) {
            deferred.reject(addPatientError);
        });
        return deferred.promise;
    }

    this.setPatientEvents = function(value) {
        patientsArray = value;
    }

    this.getPatientsEvents = function() {
        return patientsArray;
    }

    this.setInpatient = function(value) {
        inpatient = value;
    }

    this.getInpatient = function() {
        return inpatient;
    }

    this.saveMedicineSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Medicine Details Successfully saved!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.inpatientErrorSwal = function() {
        swal({
            title: "Info",
            text: "Please Select the Inpatient for Room Transfer",
            type: "info",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.nonAllergicDrugSwal = function() {
        swal({
            title: "Error",
            text: "Please select a drug to which patient is not allergic",
            type: "error",
            confirmButtonText: "OK"
        });
    }

    this.noActivePatientSwal = function() {
        swal({
            title: "Error",
            text: "Please select patient before adding drugs",
            type: "error",
            confirmButtonText: "OK"
        });
    }

    this.medicationDeleteSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Medicine Details Successfully Deleted!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.setProgressNotePatientEvents = function(value) {
        progressNotePatientEvents = value;
    }

    this.getProgressNotePatientEvents = function() {
        return progressNotePatientEvents;
    }

    this.saveNotesSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Notes Details Successfully saved!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.noteDeleteSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Notes Details Successfully Deleted!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.setVitalSignEvents = function(value) {
        vitalSignPatientEvents = value;
    }

    this.getVitalSignEvents = function() {
        return vitalSignPatientEvents;
    }

    this.setTransfersArray = function(value) {
        transfersArray = value;
    }

    this.getTransfersArray = function() {
        return transfersArray;
    }

    this.addVitalSignSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Vital Sign Details Successfully Saved!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.vitalSignDeleteSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Vital Sign Details Successfully Deleted!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.patientHistoryUpdatedSwal = function() {
        swal({
            title: "Success",
            text: "Patient History Successfully Saved!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.dischargeSummarySuccessSwal = function() {
        swal({
            title: "Success",
            text: "Discharge Summary Successfully Saved!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.pleaseSelectPatientSwal = function() {
        swal({
            title: "Info",
            text: "Please Select the Patient",
            type: "info",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.setIntakeEvents = function(value) {
        intakeEvents = value;
    }

    this.getIntakeEvents = function() {
        return intakeEvents;
    }

    this.intakeEventSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Intake Record Successfully Saved!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.intakeRecordDeleteSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Intake Record Successfully Deleted!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.setOutputEvents = function(value) {
        outputEventsList = value;
    }

    this.getOutputEvents = function() {
        return outputEventsList;
    }

    this.outputEventSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Output Record Successfully Saved!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.outputRecordDeleteSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Output Record Successfully Deleted!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.admitPatientSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Patient Successfully Admitted!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.addPrescriptionSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Prescription Successfully Saved!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.noAdmittedPatientSwal = function() {
        swal({
            title: "Info",
            text: "Please Admit the Patient",
            type: "info",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.noPatientOrNoDoctorSwal = function() {
        swal({
            title: "Info",
            text: "Please Select Doctor And Patient before saving prescription!!!",
            type: "info",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.getInPatientsWithPhoneNumber = function(phoneNumber) {
        var deferred = $q.defer();
        var getInPatientsRequestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/getOrgPatientByPhone?phoneNumber=' + phoneNumber,
            withCredentials: true
        }
        $http(getInPatientsRequestEntity).then(function(inpatientsSuccess) {
            deferred.resolve(inpatientsSuccess);
        }, function(inpatientsError) {
            deferred.reject(inpatientsError);
        });
        return deferred.promise;
    }

    this.transferPatientToAnotherRoom = function(transferPatientObject) {
        var deferred = $q.defer();
        var transferEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/transferPatient',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(transferPatientObject)
        }
        $http(transferEntity).then(function(transferPatientSuccess) {
            deferred.resolve(transferPatientSuccess);
        }, function(transferPatientError) {
            deferred.reject(transferPatientError);
        });
        return deferred.promise;
    }

    this.addPrescription = function(prescription) {
        var deferred = $q.defer();
        var prescriptionEntity = {
            method: 'POST',
            url: 'http://localhost:8081/dbotica-spring/prescription/updatePrescription',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(prescription)
        }
        $http(prescriptionEntity).then(function(prescriptionSuccess) {
            deferred.resolve(prescriptionSuccess);
        }, function(prescriptionError) {
            deferred.reject(prescriptionError);
        });
        return deferred.promise;
    }

    this.getTransferPatients = function(organizationId) {
        var deferred = $q.defer();
        var getTransferEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/getTransferEvents?organizationId=' + organizationId,
            withCredentials: true
        }
        $http(getTransferEntity).then(function(getTransferResponse) {
            deferred.resolve(getTransferResponse);
        }, function(getTransferError) {
            deferred.reject(getTransferError);
        });
        return deferred.promise;
    }

    this.getTests = function(test) {
        var deferred = $q.defer();
        var getTestRequestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/diagnosis/getDiagnosisTest?diagnosisName=' + test,
            withCredentials: true
        }
        $http(getTestRequestEntity).then(function(getTestsResponse) {
            deferred.resolve(getTestsResponse);
        }, function(getTestsResponse) {
            deferred.reject(getTestsResponse);
        });
        return deferred.promise;
    }

    this.daysToDate = function(noOfDays) {
        var revisitDate;
        var date = new Date();
        var newDate = new Date(date.getTime() + noOfDays * 24 * 60 * 60 * 1000);
        var day = newDate.getDate();
        var month = Number(newDate.getMonth()) + 1;
        var year = newDate.getFullYear();
        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;
        var revisitDate = day + "/" + month + "/" + year;
        return revisitDate;
    }

    this.roomTransferSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Room Transfer is successfully done!!!!",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.serviceUpdateSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Service successfully updated.",
            type: "success",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.serviceUpdateError = function() {
        swal({
            title: "Error",
            text: "Please Fill All The Details!!!!",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    this.getLabEntities = function() {
        var deferred = $q.defer();
        labEntityRequest = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/organization/getLabEvents',
            withCredentials: true
        }
        $http(labEntityRequest).then(function(getLabsSuccess) {
            deferred.resolve(getLabsSuccess);
        }, function(getLabsError) {
            deferred.reject(getLabsError);
        });
        return deferred.promise;
    }

    this.appointmentSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Appointment successfully booked!!!",
            type: "success",
            confirmButtonText: "OK"
        });
    }

    this.bookAppointmentFailureSwal = function() {
        swal({
            title: "Error",
            text: "Book Appointment is Failed!",
            type: "error",
            confirmButtonText: "OK"
        });
    }

    this.phoneNumberErrorSwal = function() {
        swal({
            title: "Error",
            text: "Please enter phone number.",
            type: "error",
            confirmButtonText: "OK"
        });
    }

    this.mandatoryFieldsMissingSwal = function() {
        swal({
            title: "Error",
            text: "Mandatory fields are missing!! Patient not added.",
            type: "error",
            confirmButtonText: "OK"
        });
    }

    this.getPatientAndOrganizationPatient = function(phoneNumber) {
        var deferred = $q.defer();
        var requestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/organization/hospital/getPatientAndOrganizationPatient?phoneNumber=' + phoneNumber,
            withCredentials: true
        }
        $http(requestEntity).then(function(getSuccess) {
            deferred.resolve(getSuccess);
        }, function(getError) {
            deferred.reject(getError);
        });
        return deferred.promise;
    }

    this.itemsCountErrorSwal = function() {
        swal({
            title: "Error",
            text: "Please enter units below available stock.",
            type: "error",
            confirmButtonText: "OK"
        });
    }

}]);
