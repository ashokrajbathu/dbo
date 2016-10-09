var myapp = angular.module('appServices', []);

myapp.service('dboticaServices', ['$http', '$state', '$log', '$q', function($http, $state, $log, $q) {

    var loginResponseSuccessValue, loginResponseErrorCode, loginResponseDoctorsList, loginResponseDoctorName, loginResponseDoctorSpecialization, loginResponseDoctorId, loginResponseDayStartTime, loginResponseDayEndTime, loginResponseTimePerPatient;
    var loginResponsePatientsList = [];
    var invoiceObject, doctorActive, patientData = {};
    var inpatient = {};
    var patientName = "";
    var doctorName = "";
    var editedString = '';
    var templateName = '';
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
    var templatePatientEvents = [];
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
            url: 'http://localhost:8080/dbotica-spring/assistant/login',
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
            url: "http://localhost:8080/dbotica-spring/assistant/getMyDoctors",
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
            url: 'http://localhost:8080/dbotica-spring/assistant/getDoctorEvents?doctorId=' + doctorId,
            withCredentials: true
        }
        $http(req).then(function(response) {
            deferred.resolve(response);
        }, function(errorResponse) {
            deferred.reject(errorResponse);
        });
        return deferred.promise;
    }

    this.getCaseHistory = function(patientId) {
        var deferred = $q.defer();
        var caseRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getCaseHistory?patientId=' + patientId,
            withCredentials: true
        }
        $http(caseRequest).then(function(caseSuccess) {
            deferred.resolve(caseSuccess);
        }, function(caseError) {
            deferred.reject(caseError);
        });
        return deferred.promise;
    }

    this.getPatientDetailsOfThatNumber = function(phoneNumberForSearch) {
        var deferred = $q.defer();
        var req = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/assistant/getPatients?patientIds=' + phoneNumberForSearch,
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
            url: 'http://localhost:8080/dbotica-spring/assistant/getDoctorEvents?patientPhoneNumber=' + patientPhoneNumberForCancelling + '&doctorId=' + doctorId + '&fetchAllEvents=true',
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
            url: 'http://localhost:8080/dbotica-spring/assistant/updateCalendarEvent',
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
            url: 'http://localhost:8080/dbotica-spring/assistant/updateDoctorTimings',
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
            url: 'http://localhost:8080/dbotica-spring/assistant/getDoctorEvents?doctorId=' + doctorId + '&requestTime=' + milliSecsOfDate,
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
            url: 'http://localhost:8080/dbotica-spring/drug/getDrugs?start=' + start + '&limit=' + limit + '&brandName=' + brandName,
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
            url: 'http://localhost:8080/dbotica-spring/assistant/addPatient',
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
            url: 'http://localhost:8080/dbotica-spring/assistant/logout',
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
            url: 'http://localhost:8080/dbotica-spring/inventory/addItem',
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
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId });
                    break;
                case 'Low':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "lowStock": true });
                    break;
                case 'Expired':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "expired": true });
                    break;
            }

        }
        if (itemType == "Drug") {
            switch (stockType) {
                case 'All':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "inventoryItemType": "DRUG" });
                    break;
                case 'Low':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "lowStock": true, "inventoryItemType": "DRUG" });
                    break;
                case 'Expired':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "expired": true, "inventoryItemType": "DRUG" });
                    break;
            }

        }
        if (itemType == "Supplies") {
            switch (stockType) {
                case 'All':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "inventoryItemType": "SUPPLIES" });
                    break;
                case 'Low':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "lowStock": true, "inventoryItemType": "SUPPLIES" });
                    break;
                case 'Expired':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "expired": true, "inventoryItemType": "SUPPLIES" });
                    break;
            }

        }
        if (itemType == "Equipments") {
            switch (stockType) {
                case 'All':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "inventoryItemType": "EQUIPMENT" });
                    break;
                case 'Low':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "lowStock": true, "inventoryItemType": "EQUIPMENT" });
                    break;
                case 'Expired':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "expired": true, "inventoryItemType": "EQUIPMENT" });
                    break;
            }
        }
        if (itemType == "Others") {
            switch (stockType) {
                case 'All':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "inventoryItemType": "OTHERS" });
                    break;
                case 'Low':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "lowStock": true, "inventoryItemType": "OTHERS" });
                    break;
                case 'Expired':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId, "expired": true, "inventoryItemType": "OTHERS" });
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
            url: 'http://localhost:8080/dbotica-spring/inventory/addBatch',
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
            url: 'http://localhost:8080/dbotica-spring/inventory/getItemDetails?itemId=' + itemId + '&organizationId=' + organizationId,
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
            url: 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "itemName": itemName, "organizationId": organizationId }),
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
            url: 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "itemId": itemId, "organizationId": organizationId }),
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
            url: 'http://localhost:8080/dbotica-spring/inventory/updateBatchCount',
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
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "lowStock": true, "start": start, "limit": limit, "organizationId": organizationId });
                    break;
                case 'Drug':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "lowStock": true, "start": start, "limit": limit, "inventoryItemType": "DRUG", "organizationId": organizationId });
                    break;
                case 'Supplies':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "lowStock": true, "start": start, "limit": limit, "inventoryItemType": "SUPPLIES", "organizationId": organizationId });
                    break;
                case 'Equipments':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "lowStock": true, "start": start, "limit": limit, "inventoryItemType": "EQUIPMENT", "organizationId": organizationId });
                    break;
                case 'Others':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "lowStock": true, "start": start, "limit": limit, "inventoryItemType": "OTHERS", "organizationId": organizationId });
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
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "expired": true, "start": start, "limit": limit, "organizationId": organizationId });
                    break;
                case 'Drug':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "expired": true, "start": start, "limit": limit, "inventoryItemType": "DRUG", "organizationId": organizationId });
                    break;
                case 'Supplies':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "expired": true, "start": start, "limit": limit, "inventoryItemType": "SUPPLIES", "organizationId": organizationId });
                    break;
                case 'Equipments':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "expired": true, "start": start, "limit": limit, "inventoryItemType": "EQUIPMENT", "organizationId": organizationId });
                    break;
                case 'Others':
                    localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "expired": true, "start": start, "limit": limit, "inventoryItemType": "OTHERS", "organizationId": organizationId });
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
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Low':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "lowStock": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Expired':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "expired": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                }
                break;
            case 'DrugItems':
                switch (stockType) {
                    case 'All':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "DRUG", "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Low':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "DRUG", "lowStock": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Expired':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "DRUG", "expired": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                }
                break;
            case 'EquipmentItems':
                switch (stockType) {
                    case 'All':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "EQUIPMENT", "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Low':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "EQUIPMENT", "lowStock": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Expired':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "EQUIPMENT", "expired": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                }
                break;
            case 'SuppliesItems':
                switch (stockType) {
                    case 'All':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "SUPPLIES", "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Low':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "SUPPLIES", "lowStock": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Expired':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "SUPPLIES", "expired": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                }
                break;
            case 'OtherItems':
                switch (stockType) {
                    case 'All':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "OTHERS", "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Low':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "OTHERS", "lowStock": true, "start": start, "limit": limit, "organizationId": organizationId });
                        break;
                    case 'Expired':
                        localUrl = 'http://localhost:8080/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "inventoryItemType": "OTHERS", "expired": true, "start": start, "limit": limit, "organizationId": organizationId });
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
            url: 'http://localhost:8080/dbotica-spring/organization/updateDoctorPrices',
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
            url: 'http://localhost:8080/dbotica-spring/organization/updateTest',
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
            url: 'http://localhost:8080/dbotica-spring/organization/getTests',
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
        /*if (errorCode == 'BAD_REQUEST_ERROR') {
            swal({
                title: "Error",
                text: "Error with Request Made.Please Check It!!!!!",
                type: "error",
                confirmButtonText: "OK",
                allowOutsideClick: true
            });
        }*/
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
            url: ' http://localhost:8080/dbotica-spring/organization/billing/updateInvoice',
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
            url: 'http://localhost:8080/dbotica-spring/organization/billing/getInvoices?queryString=' + JSON.stringify({ 'organizationId': organizationId }),
            withCredentials: true
        }
        $http(invoiceHistoryRequest).then(function(invoiceHistorySuccessResponse) {
            deferred.resolve(invoiceHistorySuccessResponse);
        }, function(invoiceHistoryErrorResponse) {
            deferred.reject(invoiceHistoryErrorResponse);
        });
        return deferred.promise;
    }

    this.getLocalObject = function(fieldName, fieldValue) {
        var localObject = {};
        localObject.name = fieldName;
        localObject.value = fieldValue;
        return localObject;
    }

    this.getDrugList = function(drugEntity) {
        var localDrugObject = {};
        localDrugObject.brandName = drugEntity.brandName;
        if (drugEntity.perServing == 1) {
            localDrugObject.perServing = 1 + ' unit';
        } else {
            localDrugObject.perServing = drugEntity.perServing + ' units';
        }
        localDrugObject.usageDirection = drugEntity.usageDirection;
        localDrugObject.remarks = drugEntity.remarks;
        if (drugEntity.daysOrQuantity == 'Days') {
            if (drugEntity.noOfDays == 1) {
                localDrugObject.noOfDays = 1 + ' Day';
            } else {
                localDrugObject.noOfDays = drugEntity.noOfDays + ' Days';
            }
        }
        if (drugEntity.daysOrQuantity == 'Quantity') {
            localDrugObject.noOfDays = drugEntity.quantity + ' Quantity';
        }
        return localDrugObject;
    }

    this.getInvoicesWithCaseId = function(caseId) {
        var deferred = $q.defer();
        var caseRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/billing/getInvoices?queryString=' + JSON.stringify({ 'organizationCaseId': caseId }),
            withCredentials: true
        }
        $http(caseRequest).then(function(caseSuccess) {
            deferred.resolve(caseSuccess);
        }, function(caseError) {
            deferred.reject(caseError);
        });
        return deferred.promise;
    }

    this.searchResultOfInvoice = function(organizationId, searchType, firstSearchEntity, secondSearchEntity) {
        var deferred = $q.defer();
        var localUrl;
        var invoiceSearchRequestEntity;
        switch (searchType) {
            case 'Phone Number':
                localUrl = 'http://localhost:8080/dbotica-spring/organization/billing/getInvoices?queryString=' + JSON.stringify({ 'patientPhoneNumber': firstSearchEntity, "organizationId": organizationId });
                break;
            case 'Bill Number':
                localUrl = 'http://localhost:8080/dbotica-spring/organization/billing/getInvoices?queryString=' + JSON.stringify({ 'invoiceId': firstSearchEntity, "organizationId": organizationId });
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
                localUrl = 'http://localhost:8080/dbotica-spring/organization/billing/getInvoices?queryString=' + JSON.stringify({ 'startTime': longValueOfStartDate, 'endTime': longValueOfEndDate, "organizationId": organizationId });
                break;
            case 'Next Due Date':
                var longValueOfDate = this.getLongValueOfDate(firstSearchEntity);
                localUrl = 'http://localhost:8080/dbotica-spring/organization/billing/getInvoices?queryString=' + JSON.stringify({ 'nextPaymentDueDate': longValueOfDate, "organizationId": organizationId });
                break;
            case 'Doctor':
                localUrl = 'http://localhost:8080/dbotica-spring/organization/billing/getInvoices?queryString=' + JSON.stringify({ 'doctorId': firstSearchEntity, "organizationId": organizationId });
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
            url: 'http://localhost:8080/dbotica-spring/organization/billing/getInvoices?queryString=' + JSON.stringify({ 'organizationId': organizationId, 'paymentPending': true }),
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
            url: 'http://localhost:8080/dbotica-spring/assistant/patient/getPrescriptions?patientId=' + patientId + '&start=' + start + '&limit=' + limit,
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/updateRoomCategory',
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getRoomCategories?organizationId=' + organizationId,
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/updateRoom',
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getRooms?organizationId=' + organizationId,
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/updateDoctorCategory',
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getDoctorCategories?organizationId=' + organizationId,
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/updateDoctor',
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getDoctors?organizationId=' + organizationId + '&doctorType=' + '',
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/updateBed',
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getBeds?organizationId=' + organizationId,
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/updatePatient',
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
            url: 'http://localhost:8080/dbotica-spring/organization/addDoctor',
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
            url: 'http://localhost:8080/dbotica-spring/organization/getOrganizationDetails',
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getPatients?organizationId=' + organizationId,
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

    this.updateOrgAddress = function(updateAddress) {
        var deferred = $q.defer();
        var updateEntity = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/organization/updateOrganizationAddress',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: updateAddress
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/updatePatientEvent',
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getPatientEvents?organizationId=' + organizationId,
            withCredentials: true
        }
        $http(getEventsRequestEntity).then(function(getEventsSuccess) {
            deferred.resolve(getEventsSuccess);
        }, function(getEventsError) {
            deferred.reject(getEventsError);
        });
        return deferred.promise;
    }

    this.getPatientEventsWithPatientId = function(organizationId, patientId) {
        var deferred = $q.defer();
        var getEventsRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getPatientEvents?organizationId=' + organizationId + '&patientIds=' + patientId,
            withCredentials: true
        }
        $http(getEventsRequest).then(function(getEventsSuccess) {
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/addPatientToBed',
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

    this.addAssistantSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Assistant Details Successfully Added!!!!",
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getOrgPatientByPhone?phoneNumber=' + phoneNumber,
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/transferPatient',
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
            url: 'http://localhost:8080/dbotica-spring/assistant/updatePrescription',
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getTransferEvents?organizationId=' + organizationId,
            withCredentials: true
        }
        $http(getTransferEntity).then(function(getTransferResponse) {
            deferred.resolve(getTransferResponse);
        }, function(getTransferError) {
            deferred.reject(getTransferError);
        });
        return deferred.promise;
    }

    this.getOrganizationAssistants = function(organizationId) {
        var deferred = $q.defer();
        var getAssistantsRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/getAssistantsByOrganizationId?organizationId=' + organizationId,
            withCredentials: true
        }
        $http(getAssistantsRequest).then(function(getAssistantsResponse) {
            deferred.resolve(getAssistantsResponse);
        }, function(getAssistantsError) {
            deferred.reject(getTransferError);
        });
        return deferred.promise;
    }

    this.assistantAddition = function(assistantToAdd) {
        var deferred = $q.defer();
        var addAssistantRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/organization/addAssistant',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(assistantToAdd)
        }
        $http(addAssistantRequest).then(function(addAssistantResponse) {
            deferred.resolve(addAssistantResponse);
        }, function(addAssistantError) {
            deferred.reject(addAssistantError);
        });
        return deferred.promise;
    }

    this.getTests = function(test) {
        var deferred = $q.defer();
        var getTestRequestEntity = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/diagnosis/getDiagnosisTest?diagnosisTest=' + test,
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
            url: 'http://localhost:8080/dbotica-spring/organization/getLabEvents',
            withCredentials: true
        }
        $http(labEntityRequest).then(function(getLabsSuccess) {
            deferred.resolve(getLabsSuccess);
        }, function(getLabsError) {
            deferred.reject(getLabsError);
        });
        return deferred.promise;
    }

    this.getPatientCaseHistory = function(patientId) {
        var deferred = $q.defer();
        var caseHistoryRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getCaseHistory?patientId=' + patientId,
            withCredentials: true
        }
        $http(caseHistoryRequest).then(function(caseHistorySuccess) {
            deferred.resolve(caseHistorySuccess);
        }, function(caseHistoryError) {
            deferred.reject(caseHistoryError);
        });
        return deferred.promise;
    }

    this.getPrescriptionsOfCase = function(caseId) {
        var deferred = $q.defer();
        var caseRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getPrescriptionsByCase?organizationCaseId=' + caseId,
            withCredentials: true
        }
        $http(caseRequest).then(function(caseSuccess) {
            deferred.resolve(caseSuccess);
        }, function(caseError) {
            deferred.reject(caseError);
        });
        return deferred.promise;
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

    this.appointmentSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Appointment successfully booked!!!",
            type: "success",
            confirmButtonText: "OK"
        });
    }

    this.insuranceSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Insurance Registration Successfully Done!!!",
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
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getPatientAndOrganizationPatient?phoneNumber=' + phoneNumber,
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

    this.updateLabEvent = function(labEvent) {
        var deferred = $q.defer();
        var labRequestEntity = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/organization/updateLabEvent',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(labEvent)
        }
        $http(labRequestEntity).then(function(labSuccessResponse) {
            deferred.resolve(labSuccessResponse);
        }, function(labErrorResponse) {
            deferred.reject(labErrorResponse);
        });
        return deferred.promise;
    }

    this.getOrganizationPatient = function(patientId) {
        var deferred = $q.defer();
        var getOrganizationRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/getOrgPatientByPatientId?patientId=' + patientId,
            withCredentials: true
        }
        $http(getOrganizationRequest).then(function(getOrgPatientSuccess) {
            deferred.resolve(getOrgPatientSuccess);
        }, function(getOrgPatientError) {
            deferred.reject(getOrgPatientError);
        });
        return deferred.promise;
    }

    this.templateMandatoryFieldsSwal = function() {
        swal({
            title: "Error",
            text: "Please fill all the fields",
            type: "error",
            confirmButtonText: "OK"
        });
    }

    this.registerPatientInsurance = function(insuranceRequest) {
        var deferred = $q.defer();
        var fieldRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/organization/billing/updatePatientInsurance',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(insuranceRequest)
        }
        $http(fieldRequest).then(function(fieldSuccess) {
            deferred.resolve(fieldSuccess);
        }, function(fieldError) {
            deferred.reject(fieldError);
        });
        return deferred.promise;
    }

    this.addFieldRequest = function(addFieldRequestEntity) {
        var deferred = $q.defer();
        var fieldRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/template/addTemplate',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(addFieldRequestEntity)
        }
        $http(fieldRequest).then(function(addFieldSuccess) {
            deferred.resolve(addFieldSuccess);
        }, function(addFieldError) {
            deferred.reject(addFieldError);
        });
        return deferred.promise;
    }

    this.getAllTemplates = function(organizationId, template, visibility) {
        var deferred = $q.defer();
        var getTemplatesRequest = {
            method: 'GET',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/template/getTemplates?organizationId=' + organizationId + '&name=' + template + '&showInvisible=' + visibility,
            withCredentials: true
        }
        $http(getTemplatesRequest).then(function(getTemplateSuccess) {
            deferred.resolve(getTemplateSuccess);
        }, function(getAllTemplateError) {
            deferred.reject(getAllTemplateError);
        });
        return deferred.promise;
    }

    this.getDescription = function(descriptionName) {
        editedString = _.lowerFirst(descriptionName);
        editedString = _.replace(editedString, ' ', '');
        return editedString;
    }

    this.setTemplatePatientDetails = function(value) {
        templatePatientEvents = value;
    }

    this.getTemplatePatientDetails = function() {
        return templatePatientEvents;
    }


    this.templateDetailsSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Details Successfully Updated!!",
            type: "success",
            confirmButtonText: "OK"
        });
    }

    this.fieldDetailsUpdateSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Field Details Updated Successfully!!",
            type: "success",
            confirmButtonText: "OK"
        });
    }

    this.newTemplateSuccessSwal = function() {
        swal({
            title: "Success",
            text: "New Template Added Successfully!!",
            type: "success",
            confirmButtonText: "OK"
        });
        swal({
            title: "Success",
            text: "New Template Added Successfully!!",
            type: "success",
            confirmButtonText: "OK"
        });
    }

    this.addTemplateNameSwal = function() {
        swal({
            title: "Error",
            text: "Please Enter Template Name",
            type: "error",
            confirmButtonText: "OK"
        });
    }

    this.selectTemplateSwal = function() {
        swal({
            title: "Error",
            text: "Please Select Template Name",
            type: "error",
            confirmButtonText: "OK"
        });
    }

    this.editFieldSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Field Successfully updated!!",
            type: "success",
            confirmButtonText: "OK"
        });
    }

    this.templateInstanceSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Details Successfully Added",
            type: "success",
            confirmButtonText: "OK"
        });
    }

    this.deleteFieldSuccessSwal = function() {
        swal({
            title: "Success",
            text: "Field Successfully deleted!!",
            type: "success",
            confirmButtonText: "OK"
        });
    }


    this.getStringValues = function(array, type) {
        var fieldString = '';
        if (type == 'CHECK_BOX') {
            var fieldValues = [];
            angular.forEach(array, function(restEntity) {
                fieldValues.push(restEntity.name);
            });
            fieldString = _.join(fieldValues, ',');
        }
        if (type == 'DROPDOWN') {
            var fieldValues = [];
            angular.forEach(array, function(restEntity) {
                fieldValues.push(restEntity.value);
            });
            fieldString = _.join(fieldValues, ',');
        }
        return fieldString;
    }

    this.getTemplateId = function(array, elementToEdit) {
        var templateToEdit = {};
        angular.forEach(array, function(editEntity) {
            if (editEntity.id == elementToEdit.elementId) {
                angular.copy(editEntity, templateToEdit);
            }
        });
        return templateToEdit;
    }

    this.sectionIndex = function(templateToEdit, elementToEdit) {
        var sectionElementIndex;
        sectionElementIndex = _.findLastIndex(templateToEdit.templateFields, function(resEntity) {
            return resEntity.name == elementToEdit.name && resEntity.fieldType == elementToEdit.fieldType;
        });
        return sectionElementIndex;
    }

    this.getReqTemplate = function(localActiveSectionsFields, editTemplateResponse) {
        var index;
        index = _.findLastIndex(localActiveSectionsFields, function(localEntity) {
            return localEntity.id == editTemplateResponse.id;
        });
        return index;
    }

    this.getReqTemplateToDelete = function(localActiveSectionsFields, id) {
        var index;
        index = _.findLastIndex(localActiveSectionsFields, function(localEntity) {
            return localEntity.id == id;
        });
        return index;
    }

    this.addTemplateInstance = function(templateInstance) {
        var deferred = $q.defer();
        var instanceRequest = {
            method: 'POST',
            url: 'http://localhost:8080/dbotica-spring/organization/hospital/template/addTemplateInstance',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
            data: JSON.stringify(templateInstance)
        }
        $http(instanceRequest).then(function(instanceSuccess) {
            deferred.resolve(instanceSuccess);
        }, function(instanceError) {
            deferred.reject(instanceError);
        });
        return deferred.promise;
    }

}]);

/*
Angular js provides capability to create single page applications in a clean and maintainable way
it gives user data binding capability to HTML
angular js uses dependency injection and make use of separation of concerns
developers writes less code and get more functionality
views are pure htmls and controllers written in javascript do pure business processing


MVC Pattern: 

Angular JS uses MVC based framework.
Model:it represents the data of your application
View:responsible to display/show the data
controller:responsible to control the relation between model and view

Every section in angular JS is created using the modules.
A module can have dependencies of other modules or a single module by itself.
because of this code becomes reusable.

ng-app directive indicates the start of an angular JS application.

scope is key entity for two way binding in angular JS
$scope acts as a bridge between javascript and DOM.it creates a binding between them.
$scope is a javascript object with properties and methods which are available for both view and controller.

$rootscope isnt different from scope object
except it is the very top level scope object.once angular startts rendering your application a $rootscope object is created
remaining all scope objects become the children of the scope object.

ng-controller attribute simply tells Angular where to bind and scope an instance of a controller and make the controllers data and methods be available in that DOM scope.
its basically a meeeting place of our business logic and presentation logic

An angular JS controller allows us to interact with a view and a model,its the place where presentation logic can take place to keep our UI bindings in sync with the model.

controller as helps us to clearly identify to which controller a property belongs to .

the main deifference between a service and factory is the way in which they are created.
All services are applicationsingletons. there is only one instance of a service per injector.

A service is a constructor function.

A service is a constructor function whereas a factory is not.

Angular JS directives:
Angular JS has a set of buit in directives which offers functionality to your applications.
Angular JS also let you define your own directives.
'A':only matches attribute name
'E':only matches element name
'C':only matches class name

An angular controller allows us to interact with view and model,it is the place where presentation logic can take place to keep the UI bindings in sync with the Model
it is the meeting place between our business logic and our presentation logic.
    

*/

/*
An expression is a unit of code that result in a value

Javascript weird parts

the parameters you pass to a function

inheritance one object gets access to properties and methods of another object


understanding the prototype: All objects in JS have a prototype

Call() - 
Apply() - 
Bind() - 

angular.bind(self,fn,args)-return a function fn bound to self.
self - context in which fn should be evaluated in
fn- function to be bound
angular.bootstrap - use this function to manually startup angular application
angular.bootstrap(element,[modules])
DOM- DOM element which is the root of angular application
modules - an array of modules to load into the application.
angular.bootstrap(document,['demo']);
creates a deep copy of source,which should be an object or an array : angular.copy
if source is identical to destination an exception is thrown
if source is not an object or array,source is returned
angular.element returns the jQuery object - wraps a raw DOM element or a HTML string as a jQuery element.
Determines if two objects or two values are equivalent.Supports value types,regular expressions,arrays and objects.
angular.injector creates an injector object that can be used for retrieving services as well as for dependency injection
angular.isArray determines if a reference is an array
angular.isDefined determines if a reference is defined
angular.isElement determines if a reference is a DOM element
angular.isFunction- determines if a reference is a function
angular.isNumber- determines if a reference is a number
angular.isObject- determines if a reference is an object unlike 
angular.isString- determines if a reference is a string
angular.isUndefined-determines if a reference is undefined

bootstrap is mainly used for developing responsive,mobile-first web sites
Responsive web design is about creating web sites which automatically adjust themselves to look good in all devices,from small phones to large desktops
easy to use
responsive features
mobile-first approach
browser compatibility

the .container class provides a responsive fixed width container
the .container-fluid provides a full width container,spanning the entire width of the view port.
bootstraps global default font size is 14px,with a line-height of 1.428
text-success,text-info,text-danger,text-warning
bg-success,bg-info,bg-danger,bg-primary,bg-warning
A jumbotron indicates a big box for calling extra attention to some special content or information
the most basic list group is an unordered list with list items

<nav class="navbar navbar-default">
<div class="container-fluid">
<div class="navbar-header">

it provides a different approach than ngRoute in that it changes application views based on state of the application and not just the route URL.

<form name="userForm">
<input type="text" name="userName" ng-model="user.username" ng-minlength="3" ng-maxlength="10" required>

<div ng-messages="userForm.name.$error">
<p ng-message="minLength">

$animate.on(event,DOMElement,function callback(element,phase){
    
});

$filter('uppercase')($scope.originalText);

$q : A service that helps you run functions asynchronously,and use their return values when they are done processing
A deferred object is simply an object that exposes a promise as well as the methods associated for resolving that promise. 

A service which creates a resource object that lets you interact with RESTful server-side data sources.
selectors 
box models
backgrounds and borders
text effects
animations
2D/3D transformations

A promise object represents a value that may not be available yet,but will be resolved at some point in the future.It allows you to write asynchronous code in a more synchronous way.

================-----------------===================---------------------------===================

angular.bind : return a function which calls function fn bound to self.(self becomes this for fn).
angular.bind(self,fn,args)
self: context which fn should be evaluated in.
fn: function to be bind.
angular.bootstrap: use this function to manually start up angular application.
angular.bootstrap(element,[modules],[config]);
element: DOM element which is the root of angular application
modules : an array of modules to load into application
angular.copy: creates a deep copy of source ,which should be an object or array.
if no destination is supplied a copy of object or array is returned.
if source is not an object or array,source is returned.
A jQuery object is returned by angular.element(element)-HTML string or a raw DOM element
wraps a raw DOM element or HTML string as a jQuery object.
angular.equals: determines if two objects or two values are equivalent.supports value types,regular expressions,arrays and objects.
var object=angular.extend({},object1,object2);
angular.identity: A function that returns the first argument
angular.injector: creates an injector object that can be used for retrieving services as well as for dependency injection.
angular.noop: a function that performs no operation
angular.toJson: serializes input into a JSON-formatted string.

the ngBind attribute tells the Angular to replace the text content of the specified HTML with the value of a given expression,and to update the text content when the value of the expression changes.
evaluates the expressions and inserts the resulting HTML into the element in a secured way.Toutilize this service 
ng-bind-template="{{salutation}} {{name}}"

when called it scrolls to the element related to the specified hash or to the current value of $location.hash
$animate service provides a series of DOM utility methods that provides support for animations.
$animate.on(event,container,callback);
event: the animation event that will be captured
container: the container element that will capture each of the animation events on itself and its children.
$animate.off(event,container,callback);
$cacheFactory: factory that constructs cache objects and gives access to them.
$controller service is responsible for instantiating controllers.
$document: A jquery wrapper for the browser's window.document object.
Any uncaught exception in angular expressions is delegated to this service.

CSS is a language that describes the style of the HTML document.
It describes how HTML elements should be displayed.
CSS stands for Cascading Style Sheets.
CSS describes how HTML elements are to be displayed on screen,paper or in other media.
HTML was created to describe the content of the webpage.
p.center{
    text-align:center;
    color:red;
}

external style sheet
internal style sheet
inline style sheet

colors in CSS are most often specified by name:red;
an RGB value
a HEX value
background-color
background-image
background-repeat
background-attachment
background-position

background-repeat:repeat-x;
background-repeat:repeat-y;
background-repeat:no-repeat;
background-position:right top;
background-attachment:fixed;

border-style property specifies what kind of border to display
dotted,dashed,solid,
border-width property specifies the width of the four borders

font-style has 3 values : normal,italic and oblique
1em-16px

ol.c{
    list-style-type:upper-roman;
}

tr:nth-child(even){
    
}

tr:nth-child(odd){
    
}

*/
