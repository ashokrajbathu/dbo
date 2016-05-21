var myapp = angular.module('appServices', []);

myapp.service('dboticaServices', ['$http', '$q', function($http, $q) {

    var loginResponseSuccessValue, loginResponseErrorCode, loginResponseDoctorsList, loginResponseDoctorName, loginResponseDoctorSpecialization, loginResponseDoctorId, loginResponseDayStartTime, loginResponseDayEndTime, loginResponseTimePerPatient;
    var loginResponsePatientsList = [];
    var itemSelected;

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
            console.log("selected doctor response is----", response);
            deferred.resolve(response);

        }, function(errorResponse) {
            console.log("In doctor selected error response.");
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
            withCredentials: true,
            async: false
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
        console.log("object is----", object);
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

    this.getItemsOfTheTable = function(start, limit, organizationId) {
        var deferred = $q.defer();
        var requestEntity = {
            method: 'GET',
            url: 'http://localhost:8081/dbotica-spring/inventory/getItems?queryString=' + JSON.stringify({ "start": start, "limit": limit, "organizationId": organizationId }),
            withCredentials: true,
            async: false
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
            deferred.reject(response);
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
            deferred.reject(response);
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
                    console.log("in final appointment list---");
                    loginResponsePatientsList.push(appointmentPatientsList[appointmentPatientsListIndex]);
                }
            }
        }
        for (var walkInPatientsListIndex = 0, walkInPatientsListLength = walkInPatientsList.length; walkInPatientsListIndex < walkInPatientsListLength; walkInPatientsListIndex++) {
            if (walkInPatientsList[walkInPatientsListIndex].state === "INACTIVE") {
                continue;
            } else {
                if (!!walkInPatientsList[walkInPatientsListIndex].patientId && walkInPatientsList[walkInPatientsListIndex].patientId.length > 0) {
                    console.log("in final walkinList---");
                    loginResponsePatientsList.push(walkInPatientsList[walkInPatientsListIndex]);
                }
            }
        }

        console.log("walk in patients list is----", walkInPatientsList);
        console.log("appointment patients list is----", appointmentPatientsList);
        console.log("patients list to be displayed is----", loginResponsePatientsList);
        console.log("patients List is----", patientsList);
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

    /*this.setFirstDoctorPatientsList = function(value) {
        loginResponsePatientsList = value;
    }*/

    this.getFirstDoctorPatientsList = function() {
        return loginResponsePatientsList;
    }

    this.setItemSelected = function(value) {
        itemSelected = value;
    }

    this.getSelectedItem = function() {
        return itemSelected;
    }



}]);
