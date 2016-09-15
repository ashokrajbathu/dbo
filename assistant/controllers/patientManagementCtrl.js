angular.module('personalAssistant').controller('patientManagementCtrl', patientManagementCtrl);
patientManagementCtrl.$inject = ['$scope', 'dboticaServices', '$state', '$filter', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function patientManagementCtrl($scope, dboticaServices, $state, $http, $filter, $parse, doctorServices, SweetAlert) {
    sessionStorage.setItem("currentState", "patientManagement");
    angular.element("#sessionDatepicker").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0
    });

    angular.element("#datepicker").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0
    });
    angular.element("#datepicker").datepicker("setDate", new Date());
    angular.element("#deleteTimeDatepicker").datepicker({
        format: "dd/mm/yyyy",
        autoclose: true,
        minDate: new Date()
    });
    angular.element("#deleteTimeDatepicker").datepicker("setDate", new Date());

    angular.element("#timepicker").timepicker({
        'minTime': '7:00 AM',
        'maxTime': '11:30 PM',
        'timeFormat': 'h:i A',
        'step': 15
    });

    angular.element("#timepickerEndTime").timepicker({
        'minTime': '7:00 AM',
        'maxTime': '11:30 PM',
        'timeFormat': 'h:i A',
        'step': 15
    });

    angular.element("#timepickerEvening").timepicker({
        'minTime': '4:15pm',
        'maxTime': '12:00am',
        'disableTimeRanges': [
            ['6pm', '7pm']
        ]
    });

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);

    $scope.loading = false;
    $scope.blurScreen = false;
    $scope.patientNumberDiv = false;
    $scope.patientsList = [];
    $scope.doctorName = "";
    $scope.doctorSpecialization = "";
    $scope.cancelBook = {};
    $scope.doctorSelectedForHighlight = 0;
    $scope.cancelAppointmentsTable = false;
    $scope.doctorTimings = false;
    $scope.dateSelected = "";
    $scope.startEndTimeObj = {};
    $scope.addTime = {};
    $scope.modalSubmitButtonText = "Add Patient";
    $scope.patientData = {};
    $scope.nextForm = false;
    $scope.errorMsg = false;
    $scope.caseNumber = '---Case Number---';
    var caseNumberObject = { 'organizationCaseNo': '---Case Number---' };
    $scope.caseNumbersList = [];
    var activeCaseNo = '';
    $scope.trial = false;
    $scope.nextBtn = true;
    $scope.isActiveBook = true;
    $scope.isActiveBiodata = false;
    $scope.isActiveQueue = false;
    $scope.doctorsData = {};
    $scope.loginData = {};
    $scope.book = {};
    $scope.seconds = 0;
    $scope.dateSelectBox = false;
    $scope.sessionTypes = false;
    $scope.book.eventName = "SCHEDULE";
    $scope.book.state = "ACTIVE";
    $scope.doctorsList = [];
    $scope.patientsListForSelectedDoctor = [];
    $scope.patientDataSearch = {};
    $scope.patientDetails = false;
    $scope.patientAvailable = false;
    $scope.addPatientBtn = true;
    $scope.patientId = "";
    $scope.doctorId;
    $scope.dateSelectedForBooking = "";
    $scope.deleteTime = {};
    $scope.bookingsForCancelling = [];
    $scope.doctorSessionSelect = "MORNING";
    $scope.deleteTime.session = "MORNING";
    $scope.deleteDoctorSessionSelect = "MORNING";
    $scope.doctorSessions = ["MORNING", "AFTERNOON", "EVENING"];
    $scope.doctorTimings = false;
    $scope.morningTimings = false;
    $scope.afternoonTimings = false;
    $scope.eveningTimings = false;
    $scope.morningArray = [];
    $scope.afternoonArray = [];
    $scope.eveningArray = [];
    $scope.morningArrayLength = 0;
    $scope.afternoonArrayLength = 0;
    $scope.eveningArrayLength = 0;
    $scope.patientActive = {};
    $scope.morningTimingsPatientsCountArray = [];
    $scope.afternoonTimingsPatientsCountArray = [];
    $scope.eveningTimingsPatientsCountArray = [];
    $scope.patientsCount = 0;
    $scope.morningTime = true;
    $scope.afterNoonTime = false;
    $scope.blockedTimingsArray = [];
    $scope.eveningTime = false;
    $scope.session = "morning";
    $scope.startTimeOfThatDoctor = "";
    $scope.endTimeOfThatDoctor = "";
    $scope.timePerPatientOfSelectedDoctor = "";
    $scope.patientSearchWithNumber = true;
    $scope.viewDetailsLink = false;
    $scope.patientData.gender = "MALE";
    $scope.patientData.bloodGroup = "Blood Group";
    $scope.patientDataInNextDiv = {};
    $scope.patientEntryType = "WALK_IN";
    $scope.entryTypeSelected = {};
    $scope.patientsOfNumber = false;
    $scope.entryTypeSelected.value = "WALK_IN";
    $scope.patientsOfPhoneNumber = [];
    $scope.familyMemberLink = false;

    $scope.entryType = ["WALK_IN", "APPOINTMENT"];
    var organizationId = sessionStorage.getItem('orgId');

    $scope.loading = false;
    $scope.blurScreen = false;
    $scope.doctorsData = dboticaServices.doctorsOfAssistant();
    $scope.doctorsData.then(function(doctorresponse) {
        var errorCode = doctorresponse.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            $scope.doctorsList = JSON.parse(doctorresponse.data.response);
            if ($scope.doctorsList.length == 0) {
                $scope.loading = false;
                $scope.blurScreen = false;
                dboticaServices.noConnectivityError();
            } else {
                $scope.doctorName = $scope.doctorsList[0].firstName;
                $scope.doctorSpecialization = $scope.doctorsList[0].speciality;
                $scope.book.doctorId = $scope.doctorsList[0].id;
                $scope.startEndTimeObj.dayStartTime = $scope.doctorsList[0].dayStartTime;
                $scope.startEndTimeObj.dayEndTime = $scope.doctorsList[0].dayEndTime;
                $scope.startEndTimeObj.timePerPatient = $scope.doctorsList[0].timePerPatient;
                var patientsListOfDoctor = dboticaServices.getPatientsListOfDoctor($scope.book.doctorId);
                patientsListOfDoctor.then(function(response) {
                    var patientsList = JSON.parse(response.data.response);
                    $scope.patientsList = dboticaServices.getPatientsListOfDoctorSorted(patientsList);
                }, function(error) {
                    dboticaServices.noConnectivityError();
                });
            }
        }
        $scope.loading = false;
        $scope.blurScreen = false;
    }, function(error) {
        $scope.blurScreen = false;
        $scope.loading = false;
        dboticaServices.noConnectivityError();
        sessionStorage.clear();
        sessionStorage.setItem("isLoggedInAssistant", "false");
        $state.go('login');
    });

    $scope.cancelBookingsModal = function() {
        $scope.cancelBook = {};
        $scope.cancelAppointmentsTable = false;
    }

    $scope.viewDoctorsSection = function() {
        if ($scope.doctorTimings) {
            $scope.doctorTimings = false;
        } else {
            angular.element("#sessionDatepicker").datepicker("setDate", new Date());
            $scope.doctorTimings = true;
            $scope.dateSelected = angular.element("#sessionDatepicker").val();
            var dateArray = $scope.dateSelected.split('/');
            var date = dateArray[1] + '/' + dateArray[0] + '/' + dateArray[2];
            var dateInFormat = new Date(date);
            var milliSecsOfDate = dateInFormat.getTime();
            var startmillisecs = milliSecsOfDate + $scope.startEndTimeObj.dayStartTime;
            var endmillisecs = milliSecsOfDate + $scope.startEndTimeObj.dayEndTime;
            angular.element("#timepicker").timepicker('setTime', new Date(startmillisecs));
            angular.element("#timepickerEndTime").timepicker('setTime', new Date(endmillisecs));
            $scope.addTime.dayStartTime = angular.element("#timepicker").val();
            $scope.addTime.dayEndTime = angular.element("#timepickerEndTime").val();
            $scope.addTime.timePerPatient = ($scope.startEndTimeObj.timePerPatient / 1000) / 60;
        }
    }

    $scope.selectCaseNumber = function(selectedCase) {
        $scope.caseNumber = selectedCase.organizationCaseNo;
        if (selectedCase.organizationCaseNo !== '---Case Number---') {
            activeCaseNo = selectedCase.organizationCaseNo;
        } else {
            activeCaseNo = '';
        }
    }

    $scope.patientSearch = function() {
        angular.element("#modalSubmitBtn").removeAttr("data-dismiss");
        $scope.modalSubmitButtonText = "Add Patient";
        $scope.patientData = {};
        $scope.patientNumberDiv = false;
        $scope.nextForm = false;
        $scope.patientAvailable = false;
        $scope.nextBtn = true;
        $scope.addPatientBtn = true;
        $scope.viewDetailsLink = false;
        var phoneNumberForSearch = $scope.patientDataSearch.phoneNumberSearch;
        if (phoneNumberForSearch === undefined || phoneNumberForSearch === "") {
            dboticaServices.phoneNumberErrorSwal();
        } else {
            $scope.loading = true;
            var promise = dboticaServices.getPatientDetailsOfThatNumber(phoneNumberForSearch);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    $scope.patientAvailable = true;
                    $scope.nextForm = false;
                    $scope.addPatientBtn = false;
                    $scope.patientsOfPhoneNumber = angular.fromJson(response.data.response);
                    if (response.data.success === true && response.data.response.length > 2) {
                        var patientData = JSON.parse(response.data.response);
                        var casePromise = dboticaServices.getCaseHistory(patientData[0].id);
                        casePromise.then(function(caseSuccessResponse) {
                            var errorCode = caseSuccessResponse.data.errorCode;
                            if (errorCode) {
                                dboticaServices.logoutFromThePage(errorCode);
                            } else {
                                var caseResponse = angular.fromJson(caseSuccessResponse.data.response);
                                if (errorCode == null && caseSuccessResponse.data.success) {
                                    angular.copy(caseResponse, $scope.caseNumbersList);
                                    $scope.caseNumbersList.unshift(caseNumberObject);
                                }
                            }
                        }, function(caseErrorResponse) {
                            dboticaServices.noConnectivityError();
                        });
                        $scope.patientsOfNumber = true;
                        $scope.familyMemberLink = true;
                        $scope.patientActive = patientData[0];
                        $scope.radio0 = true;
                        $scope.patientData.gender = patientData[0].gender;
                        $scope.patientData.bloodGroup = patientData[0].bloodGroup;
                        $scope.patientData.drugAllergy = patientData[0].bloodAllergy;
                        $scope.patientData.firstName = patientData[0].firstName;
                        $scope.patientData.lastName = patientData[0].lastName;
                        $scope.patientData.emailId = patientData[0].emailId;
                        $scope.patientData.phoneNumber = patientData[0].phoneNumber;
                        $scope.patientData.age = patientData[0].age;
                        $scope.patientData.drugAllergy = patientData[0].drugAllergy;
                        $scope.patientId = patientData[0].id;
                    } else {
                        $scope.patientData = {};
                        $scope.familyMemberLink = false;
                        $scope.patientNumberDiv = true;
                        $scope.patientData.gender = 'MALE';
                        $scope.patientData.bloodGroup = 'O_POSITIVE';
                        $scope.patientData.patientType = 'OUT_PATIENT';
                        $scope.patientData.phoneNumber = phoneNumberForSearch;
                    }
                }
                $scope.loading = false;
            }, function(errorResponse) {
                $scope.loading = false;
                dboticaServices.noConnectivityError();
            });
        }
        $scope.patientDataSearch.phoneNumberSearch = "";
    }

    $scope.cancelBookings = function() {
        $scope.bookingsForCancelling = [];
        $scope.cancelAppointmentsTable = true;
        var patientPhoneNumberForCancelling = $scope.cancelBook.phoneNumber;
        var doctorId = $scope.book.doctorId;
        $scope.loading = true;
        var promise = dboticaServices.futureAppointmentListOfNumber(patientPhoneNumberForCancelling, doctorId);
        promise.then(function(response) {
            var errorCode = response.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var objectsList = JSON.parse(response.data.response);
                for (var i = 0, l = objectsList.length; i < l; i++) {
                    if (objectsList[i].state === "INACTIVE") {
                        continue;
                    } else {
                        $scope.bookingsForCancelling.push(objectsList[i]);
                    }
                }
            }
            $scope.loading = false;
        }, function(errorResponse) {
            $scope.loading = false;
            dboticaServices.noConnectivityError();
        });
    }

    $scope.cancelAppointmentBookingOfFutureDays = function(appointment, index) {
        var cancelBook = {};
        cancelBook.calendarStatus = appointment.calendarStatus;
        cancelBook.doctorId = appointment.doctorId;
        cancelBook.eventName = appointment.eventName;
        cancelBook.label = appointment.label;
        cancelBook.patientId = appointment.patientId;
        cancelBook.startTime = appointment.startTime;
        cancelBook.id = appointment.id;
        cancelBook.state = "INACTIVE";
        $scope.loading = true;
        var promise = dboticaServices.cancelAppointmentOfADateOrUpdateDoctorEvent(cancelBook);
        promise.then(function(response) {
            var errorCode = response.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                $scope.bookingsForCancelling.splice(index, 1);
            }
            $scope.loading = false;
        }, function(errorResponse) {
            $scope.loading = false;
            dboticaServices.noConnectivityError();
        });

    }

    $scope.addTimingsBtn = function() {
        var addTimeObj = {};
        addTimeObj.doctorId = $scope.book.doctorId;
        var dateSelected = $scope.dateSelected;
        var dateArray = dateSelected.split('/');
        var date = dateArray[1] + '/' + dateArray[0] + '/' + dateArray[2];
        var dateInFormat = new Date(date);
        var milliSecsOfDate = dateInFormat.getTime();
        var secondsOfStartTime = timeConverter($scope.addTime.dayStartTime);
        var milliSecondsOfStartTime = secondsOfStartTime * 1000;
        var secondsOfEndTime = timeConverter($scope.addTime.dayEndTime);
        var milliSecondsOfEndTime = secondsOfEndTime * 1000;
        addTimeObj.dayStartTime = milliSecondsOfStartTime;
        addTimeObj.dayEndTime = milliSecondsOfEndTime;
        var timePerPatientOfThatDoctor = $scope.addTime.timePerPatient * 60 * 1000;
        addTimeObj.timePerPatient = $scope.addTime.timePerPatient * 60 * 1000;
        $scope.loading = true;
        var promise = dboticaServices.updateDoctorTimings(addTimeObj);
        promise.then(function(response) {
            var errorCode = response.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                $scope.startEndTimeObj.dayStartTime = milliSecondsOfStartTime;
                $scope.startEndTimeObj.dayEndTime = milliSecondsOfEndTime;
                $scope.startEndTimeObj.timePerPatient = timePerPatientOfThatDoctor;
            }
            $scope.loading = false;
        }, function(errorResponse) {
            $scope.loading = false;
            dboticaServices.noConnectivityError();
        });
        $scope.doctorTimings = false;
    }

    var timeConverter = function(time) {
        $scope.seconds = 0;
        var seconds = 0;
        var session = time.slice(-2);
        if (time.length == 11) {
            time = time.slice(0, -3);
        }
        var hoursAndMins = time.split(":");
        var mins = hoursAndMins[1];
        var hours = hoursAndMins[0];
        hours = parseInt(hours);
        mins = parseInt(mins);
        switch (session) {
            case 'AM':
                seconds = (hours * 60 * 60) + (mins * 60);
                break;
            case 'PM':
                if (hours === parseInt(12)) {
                    seconds = (12 * 60 * 60) + (mins * 60);
                } else {
                    seconds = (12 * 60 * 60) + (hours * 60 * 60) + (mins * 60);
                }
                break;
            default:
        }
        return seconds;
    }

    $scope.editDetailsOfPatient = function(patientId) {
        angular.element("#modalSubmitBtn").attr("data-dismiss", "modal");
        $scope.viewDetailsLink = false;
        $scope.patientAvailable = true;
        $scope.modalSubmitButtonText = "Update Details";
        $scope.addPatientBtn = false;
        $scope.patientSearchWithNumber = false;
        $scope.nextForm = false;
        $scope.nextBtn = true;
        $scope.loading = true;
        var promise = dboticaServices.getPatientDetailsOfThatNumber(patientId);
        promise.then(function(response) {
            var errorCode = response.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                if (response.data.success) {
                    var patientData = JSON.parse(response.data.response);
                    if (patientData.length > 0) {
                        $scope.patientData.gender = patientData[0].gender;
                        $scope.patientData.bloodGroup = patientData[0].bloodGroup;
                        $scope.patientData.drugAllergy = patientData[0].bloodAllergy;
                        $scope.patientData.firstName = patientData[0].firstName;
                        $scope.patientData.emailId = patientData[0].emailId;
                        $scope.patientData.phoneNumber = patientData[0].phoneNumber;
                        $scope.patientData.age = patientData[0].age;
                        $scope.patientData.drugAllergy = patientData[0].drugAllergy;
                    }
                } else {
                    $scope.patientData = {};
                }
            }
            $scope.loading = false;
        }, function(errorResponse) {
            $scope.loading = false;
            dboticaServices.noConnectivityError();
        });
    }

    $scope.cancelAppointment = function(cancelPatientAppointment, index) {
        var cancelBook = {};
        cancelBook.calendarStatus = cancelPatientAppointment.calendarStatus;
        cancelBook.doctorId = cancelPatientAppointment.doctorId;
        cancelBook.eventName = cancelPatientAppointment.eventName;
        cancelBook.label = cancelPatientAppointment.label;
        cancelBook.patientId = cancelPatientAppointment.patientId;
        cancelBook.startTime = cancelPatientAppointment.startTime;
        cancelBook.id = cancelPatientAppointment.id;
        cancelBook.state = "INACTIVE";
        swal({
            title: "Are you sure?",
            text: "Appointment will be permanently cancelled!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, function() {
            $scope.loading = true;
            var promise = dboticaServices.cancelAppointmentOfADateOrUpdateDoctorEvent(cancelBook);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    $scope.patientsList.splice(index, 1);
                }
                $scope.loading = false;
            }, function(errorResponse) {
                $scope.loading = false;
                dboticaServices.noConnectivityError();
            });
            swal("Cancelled!", "Appointment has been successfully cancelled", "success");
        });

    }

    $scope.viewDetails = function() {
        if ($scope.patientAvailable) {
            $scope.patientAvailable = false;
        } else {
            $scope.patientAvailable = true;
        }
    }

    $scope.selectOption = function(option) {
        $scope.patientEntryType = option;
        if ($scope.patientEntryType === "WALK_IN") {
            $scope.dateSelectBox = false;
            $scope.sessionTypes = false;
            $scope.morningTimings = false;
            $scope.afternoonTimings = false;
            $scope.eveningTimings = false;
        } else {
            $scope.dateSelectBox = true;
            $scope.sessionTypes = true;
            angular.element("#morningLabel").addClass("active");
            angular.element("#afternoonLabel").removeClass("active");
            angular.element("#eveningLabel").removeClass("active");
            $scope.morningTimings = true;
            $scope.afternoonTimings = false;
            $scope.eveningTimings = false;
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;

            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd
            }
            if (mm < 10) {
                mm = '0' + mm
            }
            var todayToDisplay = dd + '/' + mm + '/' + yyyy;
            var today = mm + '/' + dd + '/' + yyyy;
            $scope.dateSelectedForBooking = todayToDisplay;
            $scope.dateTimings(today);
        }
    }

    $scope.doctorSelected = function(doctor, index) {
        angular.element('#doctorLi' + $scope.doctorSelectedForHighlight).removeClass('activeLi');
        angular.element('#doctorLi' + index).addClass('activeLi');
        $scope.doctorSelectedForHighlight = index;
        $scope.doctorTimings = false;
        $scope.addTime = {};
        $scope.addTime.doctorId = doctor.id;
        $scope.doctorName = doctor.firstName;
        $scope.doctorSpecialization = doctor.speciality;
        $scope.patientAvailable = false;
        $scope.addPatientBtn = true;
        $scope.patientDataSearch.phoneNumberSearch = "";
        $scope.startEndTimeObj.id = doctor.id;
        $scope.startEndTimeObj.dayStartTime = doctor.dayStartTime;
        $scope.startEndTimeObj.dayEndTime = doctor.dayEndTime;
        $scope.startEndTimeObj.timePerPatient = doctor.timePerPatient;
        $scope.book.doctorId = doctor.id;
        var doctorId = doctor.id;
        $scope.loading = true;
        var patientsListOfDoctor = dboticaServices.getPatientsListOfDoctor(doctorId);
        patientsListOfDoctor.then(function(response) {
            var errorCode = response.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var patientsList = JSON.parse(response.data.response);
                $scope.patientsList = dboticaServices.getPatientsListOfDoctorSorted(patientsList);
            }
            $scope.loading = false;
        }, function(error) {
            $scope.loading = false;
            dboticaServices.noConnectivityError();
        });

    }

    $scope.dateTimings = function(dateSelectedToBook) {
        angular.element("#morningLabel").addClass("active");
        angular.element("#afternoonLabel").removeClass("active");
        angular.element("#eveningLabel").removeClass("active");
        $scope.morningTimings = true;
        $scope.afternoonTimings = false;
        $scope.eveningTimings = false;
        $scope.morningArray = [];
        $scope.afternoonArray = [];
        $scope.eveningArray = [];
        var dateSelected = $scope.dateSelectedForBooking;
        var dateArray = dateSelected.split('/');
        var date = dateArray[1] + '/' + dateArray[0] + '/' + dateArray[2];
        if (dateSelectedToBook === undefined) {
            var dateInFormat = new Date(date);
        } else {
            var dateInFormat = new Date(dateSelectedToBook);
        }
        var milliSecsOfDate = dateInFormat.getTime();
        var morningStartTime = milliSecsOfDate + 6 * 60 * 60 * 1000;
        var morningEndTime = milliSecsOfDate + 12 * 60 * 60 * 1000;
        var afternoonEndTime = milliSecsOfDate + 16 * 60 * 60 * 1000;
        var eveningEndTime = milliSecsOfDate + 23 * 60 * 60 * 1000;
        var dayStartTimeOfDoctor = 0;
        var dayEndTimeOfDoctor = 0;
        var timePerPatientForThatDoctor = 0;
        for (var i = 0, l = $scope.doctorsList.length; i < l; i++) {
            if ($scope.book.doctorId == $scope.doctorsList[i].id) {
                dayStartTimeOfDoctor = $scope.startEndTimeObj.dayStartTime + milliSecsOfDate;
                dayEndTimeOfDoctor = $scope.startEndTimeObj.dayEndTime + milliSecsOfDate;
                timePerPatientForThatDoctor = $scope.startEndTimeObj.timePerPatient;
            }
        }
        if (dayStartTimeOfDoctor === 0) {
            dayStartTimeOfDoctor = morningStartTime;
        }
        if (dayEndTimeOfDoctor === 0) {
            dayEndTimeOfDoctor = eveningEndTime;
        }
        var dateStartTimeObject = {};
        dateStartTimeObject.time = dayStartTimeOfDoctor;
        dateStartTimeObject.count = 0;
        $scope.morningArray.push(dateStartTimeObject);
        var displayTime = 0;
        displayTime = dayStartTimeOfDoctor + timePerPatientForThatDoctor;
        var currentTime = new Date();
        var currentTimeMilliSecs = currentTime.getTime();
        while (displayTime < dayEndTimeOfDoctor) {
            if (displayTime > morningStartTime && displayTime <= morningEndTime) {
                var timeObject = {};
                timeObject.time = displayTime;
                timeObject.count = 0;
                $scope.morningArray.push(timeObject);
            }
            if (displayTime > morningEndTime && displayTime <= afternoonEndTime) {
                var timeObject = {};
                timeObject.time = displayTime;
                timeObject.count = 0;
                $scope.afternoonArray.push(timeObject);
            }
            if (displayTime > afternoonEndTime && displayTime <= eveningEndTime) {
                var timeObject = {};
                timeObject.time = displayTime;
                timeObject.count = 0;
                $scope.eveningArray.push(timeObject);
            }
            displayTime = displayTime + timePerPatientForThatDoctor;
        }
        $scope.loading = true;
        var promise = dboticaServices.getDoctorEventsOfDocOnADate($scope.book.doctorId, milliSecsOfDate);
        promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var doctorResponseAfterDateSelect = JSON.parse(response.data.response);
                    $scope.morningArrayLength = $scope.morningArray.length;
                    $scope.afternoonArrayLength = $scope.afternoonArray.length;
                    $scope.eveningArrayLength = $scope.eveningArray.length;
                    if (doctorResponseAfterDateSelect !== null && doctorResponseAfterDateSelect.length > 0) {
                        for (var i = 0; i < doctorResponseAfterDateSelect.length; i++) {
                            if ((doctorResponseAfterDateSelect[i].label !== null) && (doctorResponseAfterDateSelect[i].label.toLowerCase() == "blocked")) {
                                var startTime = doctorResponseAfterDateSelect[i].startTime;
                                startTime = startTime - startTime % timePerPatientForThatDoctor;
                                for (var j = startTime; j < doctorResponseAfterDateSelect[i].endTime; j = j + timePerPatientForThatDoctor) {
                                    if ($scope.blockedTimingsArray.indexOf(j) === -1) {
                                        $scope.blockedTimingsArray.push(j);
                                    }
                                }
                            }
                            var state = null;
                            try {
                                state = doctorResponseAfterDateSelect[i].state;
                            } catch (e) {
                                console.log(e);
                            }
                            if (!!state && state === "ACTIVE") {
                                for (var k = 0; k < $scope.morningArrayLength; k++) {
                                    if ($scope.morningArray[k].time === doctorResponseAfterDateSelect[i].startTime) {
                                        $scope.morningArray[k].count++;
                                    }
                                }

                                for (var k = 0; k < $scope.afternoonArrayLength; k++) {
                                    if ($scope.afternoonArray[k].time === doctorResponseAfterDateSelect[i].startTime) {
                                        $scope.afternoonArray[k].count++;
                                    }
                                }
                                for (var k = 0; k < $scope.eveningArrayLength; k++) {
                                    if ($scope.eveningArray[k].time === doctorResponseAfterDateSelect[i].startTime) {
                                        $scope.eveningArray[k].count++;
                                    }
                                }
                            } else {
                                continue;
                            }
                        }
                    }
                    for (var i = 0; i < $scope.blockedTimingsArray.length; i++) {
                        for (var j = 0, k = $scope.morningArray.length; j < k; j++) {
                            if ($scope.blockedTimingsArray[i] === $scope.morningArray[j].time) {
                                $scope.morningArray.splice(j, 1);
                            }
                        }
                        for (var j = 0, k = $scope.afternoonArray.length; j < k; j++) {
                            if ($scope.blockedTimingsArray[i] === $scope.afternoonArray[j].time) {
                                $scope.afternoonArray.splice(j, 1);
                            }
                        }
                        for (var j = 0, k = $scope.eveningArray.length; j < k; j++) {
                            if ($scope.blockedTimingsArray[i] === $scope.eveningArray[j].time) {
                                $scope.eveningArray.splice(j, 1);
                            }
                        }
                    }
                }
                $scope.loading = false;
            },
            function(errorResponse) {
                $scope.loading = true;
            });
        for (var mrngArrayIndex = 0; mrngArrayIndex < $scope.morningArray.length; mrngArrayIndex++) {
            $scope['morningArrayBtnDisabled' + mrngArrayIndex] = false;
            if ($scope.morningArray[mrngArrayIndex].time < currentTimeMilliSecs) {
                var id = '#morningArrayBtn' + mrngArrayIndex;
                $scope['morningArrayBtnDisabled' + mrngArrayIndex] = true;
                $scope['morning' + mrngArrayIndex] = true;
            }
        }
        for (var aftrnoonArrayIndex = 0; aftrnoonArrayIndex < $scope.afternoonArray.length; aftrnoonArrayIndex++) {
            $scope['afternoonArrayBtnDisabled' + aftrnoonArrayIndex] = false;
            if ($scope.afternoonArray[aftrnoonArrayIndex].time < currentTimeMilliSecs) {
                var id = '#afternoonArrayBtn' + aftrnoonArrayIndex;
                $scope['afternoonArrayBtnDisabled' + aftrnoonArrayIndex] = true;
            }
        }
        for (var eveningArrayIndex = 0; eveningArrayIndex < $scope.eveningArray.length; eveningArrayIndex++) {
            $scope['eveningArrayBtnDisabled' + eveningArrayIndex] = false;
            if ($scope.eveningArray[eveningArrayIndex].time < currentTimeMilliSecs) {
                var id = '#eveningArrayBtn' + eveningArrayIndex;
                $scope['eveningArrayBtnDisabled' + eveningArrayIndex] = true;
            }
        }
    }

    $scope.addPatient = function() {
        $scope.patientEntryType = "WALK_IN";
        $scope.sessionTypes = false;
        $scope.dateSelectBox = false;
        $scope.morningTimings = false;
        $scope.afternoonTimings = false;
        $scope.eveningTimings = false;
        $scope.patientDetails = true;
        var indexOfBookedPatient;
        var firstName = $scope.patientData.firstName;
        var phoneNumber = $scope.patientData.phoneNumber;
        var emailId = $scope.patientData.emailId;
        var patientNumber = $scope.patientData.patientNumber;
        var newPatientData = {};
        newPatientData.gender = $scope.patientData.gender;
        newPatientData.bloodGroup = $scope.patientData.bloodGroup;
        newPatientData.drugAllergy = $scope.patientData.drugAllergy;
        newPatientData.firstName = $scope.patientData.firstName;
        newPatientData.lastName = $scope.patientData.lastName;
        newPatientData.emailId = $scope.patientData.emailId;
        newPatientData.phoneNumber = $scope.patientData.phoneNumber;
        newPatientData.age = $scope.patientData.age;
        if (_.isEmpty($scope.patientActive)) {
            if ($scope.familyMemberLink) {
                newPatientData.primaryPatient = false;
            } else {
                newPatientData.primaryPatient = true;
            }
        } else {
            newPatientData.primaryPatient = $scope.patientActive.primaryPatient;
        }
        if ($scope.patientId !== undefined && $scope.patientId !== "" && !_.isEmpty($scope.patientActive)) {
            newPatientData.id = $scope.patientId;
        }
        var newPatientDetails = JSON.stringify(newPatientData);
        if (firstName != undefined && firstName !== '' && phoneNumber !== undefined && phoneNumber !== '') {
            $scope.loading = true;
            var promise = dboticaServices.addNewPatient(newPatientDetails);
            promise.then(function(response) {
                var errorCode = response.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var addPatientResponse = JSON.parse(response.data.response);
                    if (!$scope.patientNumberDiv) {
                        $scope.nextForm = true;
                        $scope.nextBtn = false;
                        $scope.familyMemberLink = false;
                        $scope.patientsOfNumber = false;
                        $scope.patientAvailable = false;
                        $scope.viewDetailsLink = true;
                        $scope.addPatientBtn = true;
                    }
                    if (!_.isEmpty($scope.patientId)) {
                        indexOfBookedPatient = _.findLastIndex(addPatientResponse, function(entity) {
                            return entity.id == $scope.patientId;
                        });
                    } else {
                        indexOfBookedPatient = 0;
                    }
                    $scope.patientDataInNextDiv.name = addPatientResponse[indexOfBookedPatient].firstName;
                    $scope.book.label = addPatientResponse[indexOfBookedPatient].firstName;
                    $scope.book.patientId = addPatientResponse[indexOfBookedPatient].id;
                    if (!_.isEmpty($scope.book.patientId)) {
                        if (firstName !== undefined && firstName !== '' && phoneNumber !== undefined && phoneNumber !== '') {
                            var registerPatientRequest = {};
                            registerPatientRequest.organizationId = organizationId;
                            registerPatientRequest.patientId = $scope.book.patientId;
                            registerPatientRequest.phoneNumber = phoneNumber;
                            registerPatientRequest.activeCaseNumber = activeCaseNo;
                            // registerPatientRequest.organizationPatientNo = patientNumber;
                            registerPatientRequest.patientType = 'OUT_PATIENT';
                            registerPatientRequest.patientState = 'CHECK_IN';
                            var registerPatientPromise = dboticaServices.registerPatient(registerPatientRequest);
                            registerPatientPromise.then(function(registerPatientSuccess) {
                                var errorCode = registerPatientSuccess.data.errorCode;
                                if (errorCode) {
                                    dboticaServices.logoutFromThePage(errorCode);
                                } else {
                                    var registerPatientResponse = angular.fromJson(registerPatientSuccess.data.response);
                                    $scope.nextForm = true;
                                    $scope.nextBtn = false;
                                    $scope.familyMemberLink = false;
                                    $scope.patientsOfNumber = false;
                                    $scope.patientAvailable = false;
                                    $scope.viewDetailsLink = true;
                                    $scope.addPatientBtn = true;
                                }
                            }, function(registerPatientError) {
                                dboticaServices.noConnectivityError();
                            });
                        } else {
                            displayForm();
                            dboticaServices.mandatoryFieldsMissingSwal();
                        }
                    }
                }
                $scope.loading = false;
            }, function() {
                $scope.loading = false;
                dboticaServices.noConnectivityError();
            });
        } else {
            dboticaServices.mandatoryFieldsMissingSwal();
        }

    }

    $scope.viewTime = function(timing) {
        switch (timing) {
            case 'morning':
                angular.element(".morningTimingsArray").removeClass("activeButton");
                $scope.morningTimings = true;
                $scope.afternoonTimings = false;
                $scope.eveningTimings = false;
                break;

            case 'afternoon':
                $scope.morningTimings = false;
                $scope.afternoonTimings = true;
                $scope.eveningTimings = false;
                angular.element(".afternoonTimingsArray").removeClass("activeButton");
                break;

            case 'evening':
                $scope.morningTimings = false;
                $scope.afternoonTimings = false;
                $scope.eveningTimings = true;
                angular.element(".eveningTimingsArray").removeClass("activeButton");
                break;
            default:
        }
    }

    $scope.selectButton = function(time, index) {
        if ($scope['morningArrayBtnDisabled' + index] === false) {
            $scope.activeBtn = index;
            var date = new Date(time);
            var datedSorted = moment(date).format("DD/MM/YYYY,hh:mm:ss A");
            var timeArray = datedSorted.split(",");
            $scope.seconds = timeConverter(timeArray[1]);
        }
    }

    $scope.selectAfternoonButton = function(time, index) {
        if ($scope['afternoonArrayBtnDisabled' + index] === false) {
            $scope.activeBtnAfternoon = index;
            var dateValue = new Date(time);
            var datedSorted = moment(dateValue).format("DD/MM/YYYY,hh:mm:ss A");
            var timeArray = datedSorted.split(",");
            $scope.seconds = timeConverter(timeArray[1]);
        }
    }

    $scope.selectEveningButton = function(time, index) {
        if ($scope['eveningArrayBtnDisabled' + index] === false) {
            $scope.activeBtnEvening = index;
            var date = new Date(time);
            var datedSorted = moment(date).format("DD/MM/YYYY,hh:mm:ss A");
            var timeArray = datedSorted.split(",");
            $scope.seconds = timeConverter(timeArray[1]);
        }
    }

    $scope.bookSlot = function() {
        var dateSelected = $scope.dateSelectedForBooking;
        var dateArray = dateSelected.split('/');
        var date = dateArray[1] + '/' + dateArray[0] + '/' + dateArray[2];
        var dateInFormat = new Date(date);
        var milliSecsOfDate = dateInFormat.getTime();
        $scope.book.state = "ACTIVE";
        $scope.book.startTime = milliSecsOfDate + $scope.seconds * 1000;
        $scope.book.calendarStatus = $scope.patientEntryType;
        $scope.loading = true;
        var promise = dboticaServices.cancelAppointmentOfADateOrUpdateDoctorEvent($scope.book);
        promise.then(function(response) {
            var errorCode = response.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                if (errorCode == null && response.data.success === true) {
                    $scope.loading = true;
                    var patientsListOfDoctor = dboticaServices.getPatientsListOfDoctor($scope.book.doctorId);
                    patientsListOfDoctor.then(function(response) {
                        var localPatientsList = JSON.parse(response.data.response);
                        $scope.patientsList = dboticaServices.getPatientsListOfDoctorSorted(localPatientsList);
                        $scope.loading = false;
                    }, function(error) {
                        $scope.loading = false;
                        dboticaServices.noConnectivityError();
                    });
                    dboticaServices.appointmentSuccessSwal();
                } else {
                    dboticaServices.bookAppointmentFailureSwal();
                }
            }
            $scope.loading = false;
        }, function(errorResponse) {
            $scope.loading = false;
            dboticaServices.noConnectivityError();
        });
    }

    $scope.selectActivePatient = function(patientEntity, index) {
        $scope.book.patientId = patientEntity.id;
        $scope.patientActive = patientEntity;
        $scope.patientId = patientEntity.id;
        angular.copy(patientEntity, $scope.patientData);
    }

    $scope.addNewMemberToPhoneNumber = function() {
        $scope.patientData = {};
        $scope.patientData.phoneNumber = $scope.patientActive.phoneNumber;
        $scope.patientActive = {};
        $scope.patientId = '';
        $scope.patientNumberDiv = true;
        $scope.patientData.patientNumber = '';
        $scope.patientData.patientType = 'OUT_PATIENT';
        $scope.patientData.gender = 'MALE';
        $scope.patientData.bloodGroup = 'O_POSITIVE';
    }

    var displayForm = function() {
        $scope.nextForm = false;
        $scope.patientAvailable = true;
        $scope.nextBtn = true;
        $scope.patientsOfNumber = false;
    }
};
