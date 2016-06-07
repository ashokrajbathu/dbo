angular.module('personalAssistant').controller('patientManagementCtrl', ['$scope', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {

    localStorage.setItem("currentState", "patientManagement");
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
    $scope.patientsList = [];
    $scope.doctorName = "";
    $scope.doctorSpecialization = "";
    $scope.cancelBook = {};
    $scope.cancelAppointmentsTable = false;
    $scope.doctorTimings = false;
    $scope.dateSelected = "";
    $scope.doctorObjectForChangingStartAndEndTime = {};
    $scope.addTime = {};
    $scope.modalSubmitButtonText = "Add Patient";
    $scope.patientData = {};
    $scope.nextForm = false;
    $scope.errorMsg = false;
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
    $scope.entryTypeSelected.value = "WALK_IN";
    $scope.entryType = ["WALK_IN", "APPOINTMENT"];

    $scope.doctorsData = dboticaServices.doctorsOfAssistant();
    console.log("doctorsData promise is----", $scope.doctorsData);
    $scope.doctorsData.then(function(doctorresponse) {
        $scope.loading = true;
        console.log("doctors response is-----", doctorresponse);
        var errorCode = doctorresponse.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            $scope.doctorsList = JSON.parse(doctorresponse.data.response);
            $scope.doctorName = $scope.doctorsList[0].firstName;
            $scope.doctorSpecialization = $scope.doctorsList[0].speciality;
            $scope.book.doctorId = $scope.doctorsList[0].id;
            $scope.doctorObjectForChangingStartAndEndTime.dayStartTime = $scope.doctorsList[0].dayStartTime;
            $scope.doctorObjectForChangingStartAndEndTime.dayEndTime = $scope.doctorsList[0].dayEndTime;
            $scope.doctorObjectForChangingStartAndEndTime.timePerPatient = $scope.doctorsList[0].timePerPatient;
            var patientsListOfDoctor = dboticaServices.getPatientsListOfDoctor($scope.book.doctorId);
            patientsListOfDoctor.then(function(response) {
                $scope.loading = true;
                var patientsList = JSON.parse(response.data.response);
                $scope.patientsList = dboticaServices.getPatientsListOfDoctorSorted(patientsList);
                $scope.loading = false;
            }, function(error) {
                $scope.loading = true;
                console.log("in patient controller patients error");
            });
        }
        $scope.loading = false;
    }, function(error) {
        $scope.loading = true;
        console.log("doctors error response", error);
        localStorage.clear();
        localStorage.setItem("isLoggedInAssistant", "false");
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
            var startmillisecs = milliSecsOfDate + $scope.doctorObjectForChangingStartAndEndTime.dayStartTime;
            var endmillisecs = milliSecsOfDate + $scope.doctorObjectForChangingStartAndEndTime.dayEndTime;
            angular.element("#timepicker").timepicker('setTime', new Date(startmillisecs));
            angular.element("#timepickerEndTime").timepicker('setTime', new Date(endmillisecs));
            $scope.addTime.dayStartTime = angular.element("#timepicker").val();
            $scope.addTime.dayEndTime = angular.element("#timepickerEndTime").val();
            $scope.addTime.timePerPatient = ($scope.doctorObjectForChangingStartAndEndTime.timePerPatient / 1000) / 60;
        }
    }

    $scope.patientSearch = function() {
        angular.element("#modalSubmitBtn").removeAttr("data-dismiss");
        $scope.modalSubmitButtonText = "Add Patient";
        $scope.patientData = {};
        $scope.nextForm = false;
        $scope.patientAvailable = false;
        $scope.nextBtn = true;
        $scope.addPatientBtn = true;
        $scope.viewDetailsLink = false;
        var phoneNumberForSearch = $scope.patientDataSearch.phoneNumberSearch;
        console.log("scope phone number is----" + $scope.patientDataSearch.phoneNumberSearch);
        console.log("phoneNumberForSearch is----" + phoneNumberForSearch);
        if (phoneNumberForSearch === undefined || phoneNumberForSearch === "") {
            swal({
                title: "Error",
                text: "Please enter phone number.",
                type: "error",
                confirmButtonText: "OK"
            }, function() {

            });

        } else {
            var promise = dboticaServices.getPatientDetailsOfThatNumber(phoneNumberForSearch);
            promise.then(function(response) {
                $scope.loading = true;
                $scope.patientAvailable = true;
                $scope.nextForm = false;
                $scope.addPatientBtn = false;
                console.log("patients length is---" + response.data.response.length);
                if (response.data.success === true && response.data.response.length > 2) {
                    console.log("inside if of patient search");
                    var patientData = JSON.parse(response.data.response);
                    console.log("patient data in patient search----", patientData);
                    $scope.patientData.gender = patientData[0].gender;
                    $scope.patientData.bloodGroup = patientData[0].bloodGroup;
                    $scope.patientData.drugAllergy = patientData[0].bloodAllergy;
                    $scope.patientData.firstName = patientData[0].firstName;
                    $scope.patientData.emailId = patientData[0].emailId;
                    $scope.patientData.phoneNumber = patientData[0].phoneNumber;
                    $scope.patientData.age = patientData[0].age;
                    $scope.patientData.drugAllergy = patientData[0].drugAllergy;
                    $scope.patientId = patientData[0].id;
                } else {
                    $scope.patientData = {};
                    $scope.patientData.phoneNumber = phoneNumberForSearch;
                    console.log("no details of the patient");
                }

                console.log("patient search details are----", response);
                $scope.loading = false;
            }, function(errorResponse) {
                $scope.loading = true;
                console.log("error response in the search is------", errorResponse);
                console.log("patient search is unsuccessful");
            });
        }
        $scope.patientDataSearch.phoneNumberSearch = "";
    }

    $scope.cancelBookings = function() {
        $scope.bookingsForCancelling = [];
        $scope.cancelAppointmentsTable = true;
        console.log("patient phone number for cancelling-----" + $scope.cancelBook.phoneNumber);
        var patientPhoneNumberForCancelling = $scope.cancelBook.phoneNumber;
        console.log("number is---" + patientPhoneNumberForCancelling);
        var doctorId = $scope.book.doctorId;
        console.log("cancelling doctor id----" + doctorId);
        var promise = dboticaServices.futureAppointmentListOfNumber(patientPhoneNumberForCancelling, doctorId);
        promise.then(function(response) {
            $scope.loading = true;
            console.log("cancelling response is-----", response);
            var objectsList = JSON.parse(response.data.response);
            console.log("bookings for cancelling----", objectsList);
            for (var i = 0, l = objectsList.length; i < l; i++) {
                if (objectsList[i].state === "INACTIVE") {
                    continue;
                } else {
                    $scope.bookingsForCancelling.push(objectsList[i]);
                }
            }
            $scope.loading = false;
        }, function(errorResponse) {
            $scope.loading = true;
            console.log("in error response of cancelling");
        });
    }

    $scope.cancelAppointmentBookingOfFutureDays = function(appointment, index) {
        console.log("in modal---", appointment);
        var cancelBook = {};
        cancelBook.calendarStatus = appointment.calendarStatus;
        cancelBook.doctorId = appointment.doctorId;
        cancelBook.eventName = appointment.eventName;
        cancelBook.label = appointment.label;
        cancelBook.patientId = appointment.patientId;
        cancelBook.startTime = appointment.startTime;
        cancelBook.id = appointment.id;
        cancelBook.state = "INACTIVE";
        console.log("cancel book object is----", cancelBook);
        var promise = dboticaServices.cancelAppointmentOfADateOrUpdateDoctorEvent(cancelBook);
        promise.then(function(response) {
            $scope.loading = true;
            console.log("after cancelling is----", response);
            $scope.bookingsForCancelling.splice(index, 1);
            $scope.loading = false;
        }, function(errorResponse) {
            $scope.loading = true;
        });
    }

    $scope.addTimingsBtn = function() {
        console.log("time object is----", $scope.addTime);
        var addTimeObj = {};
        addTimeObj.doctorId = $scope.book.doctorId;
        var dateSelected = $scope.dateSelected;
        var dateArray = dateSelected.split('/');
        var date = dateArray[1] + '/' + dateArray[0] + '/' + dateArray[2];
        var dateInFormat = new Date(date);
        var milliSecsOfDate = dateInFormat.getTime();
        var secondsOfStartTime = timeConverter($scope.addTime.dayStartTime);
        console.log("secs of startTime---" + secondsOfStartTime);
        var milliSecondsOfStartTime = secondsOfStartTime * 1000;
        var secondsOfEndTime = timeConverter($scope.addTime.dayEndTime);
        console.log("secs of end time---" + secondsOfEndTime);
        var milliSecondsOfEndTime = secondsOfEndTime * 1000;
        addTimeObj.dayStartTime = milliSecondsOfStartTime;
        addTimeObj.dayEndTime = milliSecondsOfEndTime;
        var timePerPatientOfThatDoctor = $scope.addTime.timePerPatient * 60 * 1000;
        addTimeObj.timePerPatient = $scope.addTime.timePerPatient * 60 * 1000;
        console.log("time object is----", addTimeObj);
        var promise = dboticaServices.updateDoctorTimings(addTimeObj);
        promise.then(function(response) {
            $scope.loading = true;
            console.log("update doctor timings response---", response);
            $scope.doctorObjectForChangingStartAndEndTime.dayStartTime = milliSecondsOfStartTime;
            $scope.doctorObjectForChangingStartAndEndTime.dayEndTime = milliSecondsOfEndTime;
            $scope.doctorObjectForChangingStartAndEndTime.timePerPatient = timePerPatientOfThatDoctor;
            $scope.loading = false;
        }, function(errorResponse) {
            $scope.loading = true;
        });
        $scope.doctorTimings = false;
    }

    var timeConverter = function(time) {
        $scope.seconds = 0;
        var seconds = 0;
        console.log("time in time converter---" + time);
        var session = time.slice(-2);
        if (time.length == 11) {
            time = time.slice(0, -3);
        }
        var hoursAndMins = time.split(":");
        var mins = hoursAndMins[1];
        var hours = hoursAndMins[0];
        console.log("hours value is--" + hours);
        console.log("mins value is----" + mins);
        console.log("session is--" + session);
        hours = parseInt(hours);
        mins = parseInt(mins);
        switch (session) {
            case 'AM':
                console.log("in AM section");
                seconds = (hours * 60 * 60) + (mins * 60);
                console.log("seconds in AM sec---" + seconds);
                break;

            case 'PM':
                console.log("in pm section");
                if (hours === parseInt(12)) {
                    console.log("in hours 12");
                    seconds = (12 * 60 * 60) + (mins * 60);
                    console.log("seconds for 12---" + seconds);

                } else {
                    console.log("in not 12 hrs");
                    console.log("hours in pm section---" + hours);
                    console.log("minutes in pm swction---" + mins);
                    seconds = (12 * 60 * 60) + (hours * 60 * 60) + (mins * 60);
                    console.log("seconds in pm section----" + seconds);
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
        var promise = dboticaServices.getPatientDetailsOfThatNumber(patientId);
        promise.then(function(response) {
            $scope.loading = true;
            if (response.data.success) {
                console.log("inside if of edit details patient search");
                var patientData = JSON.parse(response.data.response);
                console.log("patient data in edit details patient search----", patientData);
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
                console.log("in else response of edit details patient search--");
            }
            $scope.loading = false;
        }, function(errorResponse) {
            $scope.loading = true;
        });
        console.log("patient id value is---" + patientId);
    }

    $scope.cancelAppointment = function(cancelPatientAppointment, index) {
        console.log("index of the cancelling object is----" + index);
        console.log("patient for cancelling appointment is----", cancelPatientAppointment);
        var cancelBook = {};
        cancelBook.calendarStatus = cancelPatientAppointment.calendarStatus;
        cancelBook.doctorId = cancelPatientAppointment.doctorId;
        cancelBook.eventName = cancelPatientAppointment.eventName;
        cancelBook.label = cancelPatientAppointment.label;
        cancelBook.patientId = cancelPatientAppointment.patientId;
        cancelBook.startTime = cancelPatientAppointment.startTime;
        cancelBook.id = cancelPatientAppointment.id;
        cancelBook.state = "INACTIVE";
        console.log("cancel book object is----", cancelBook);
        swal({
            title: "Are you sure?",
            text: "Appointment will be permanently cancelled!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, function() {
            var promise = dboticaServices.cancelAppointmentOfADateOrUpdateDoctorEvent(cancelBook);
            promise.then(function(response) {
                $scope.loading = true;
                console.log("after cancelling is----", response);
                $scope.patientsList.splice(index, 1);
                $scope.loading = false;
            }, function(errorResponse) {
                $scope.loading = true;
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
        console.log("in option function");
        $scope.patientEntryType = option;
        if ($scope.patientEntryType === "WALK_IN") {
            $scope.dateSelectBox = false;
            $scope.sessionTypes = false;
            $scope.morningTimings = false;
            $scope.afternoonTimings = false;
            $scope.eveningTimings = false;
        } else {
            console.log("in appointment loop");
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
        console.log("option value is---" + $scope.patientEntryType);
    }

    $scope.doctorSelected = function(doctor) {
        console.log("doctor in doctor selected is----", doctor);
        $scope.doctorTimings = false;
        $scope.addTime = {};
        $scope.addTime.doctorId = doctor.id;
        $scope.doctorName = doctor.firstName;
        $scope.doctorSpecialization = doctor.speciality;
        $scope.patientAvailable = false;
        $scope.addPatientBtn = true;
        $scope.patientDataSearch.phoneNumberSearch = "";
        $scope.doctorObjectForChangingStartAndEndTime.id = doctor.id;
        $scope.doctorObjectForChangingStartAndEndTime.dayStartTime = doctor.dayStartTime;
        $scope.doctorObjectForChangingStartAndEndTime.dayEndTime = doctor.dayEndTime;
        $scope.doctorObjectForChangingStartAndEndTime.timePerPatient = doctor.timePerPatient;
        $scope.book.doctorId = doctor.id;
        var doctorId = doctor.id;
        var patientsListOfDoctor = dboticaServices.getPatientsListOfDoctor(doctorId);
        patientsListOfDoctor.then(function(response) {
            $scope.loading = true;
            console.log("in patients list of doctor selected");
            var patientsList = JSON.parse(response.data.response);
            $scope.patientsList = dboticaServices.getPatientsListOfDoctorSorted(patientsList);
            $scope.loading = false;
        }, function(error) {
            $scope.loading = true;
            console.log("in patient controller patients error");
        });
    }

    $scope.dateTimings = function(dateSelectedToBook) {
        console.log("date select to book checking----" + dateSelectedToBook);
        angular.element("#morningLabel").addClass("active");
        angular.element("#afternoonLabel").removeClass("active");
        angular.element("#eveningLabel").removeClass("active");
        $scope.morningTimings = true;
        $scope.afternoonTimings = false;
        $scope.eveningTimings = false;
        $scope.morningArray = [];
        $scope.afternoonArray = [];
        $scope.eveningArray = [];
        console.log("selected date in ng-change is-----" + $scope.dateSelectedForBooking);
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
        console.log("milliseconds of present date----" + milliSecsOfDate);
        console.log("doctor timings after selecting date---", $scope.doctorsList);
        for (var i = 0, l = $scope.doctorsList.length; i < l; i++) {
            if ($scope.book.doctorId == $scope.doctorsList[i].id) {
                dayStartTimeOfDoctor = $scope.doctorObjectForChangingStartAndEndTime.dayStartTime + milliSecsOfDate;
                dayEndTimeOfDoctor = $scope.doctorObjectForChangingStartAndEndTime.dayEndTime + milliSecsOfDate;
                timePerPatientForThatDoctor = $scope.doctorObjectForChangingStartAndEndTime.timePerPatient;
            }
        }
        console.log("day start time is----" + dayStartTimeOfDoctor);
        console.log("day end time is----" + dayEndTimeOfDoctor);
        console.log("time per patient----" + timePerPatientForThatDoctor);
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
                console.log("time object is----", timeObject);
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
        var promise = dboticaServices.getDoctorEventsOfDocOnADate($scope.book.doctorId, milliSecsOfDate);
        promise.then(function(response) {
                $scope.loading = true;
                console.log("response in ng-change is----", response);
                var doctorResponseAfterDateSelect = JSON.parse(response.data.response);
                console.log("response in ng-change----", doctorResponseAfterDateSelect);
                $scope.morningArrayLength = $scope.morningArray.length;
                $scope.afternoonArrayLength = $scope.afternoonArray.length;
                $scope.eveningArrayLength = $scope.eveningArray.length;
                console.log("selected doctor response----" + doctorResponseAfterDateSelect.length);
                console.log("scope and morning array length---" + $scope.morningArrayLength);
                if (doctorResponseAfterDateSelect !== null && doctorResponseAfterDateSelect.length > 0) {
                    for (var i = 0; i < doctorResponseAfterDateSelect.length; i++) {
                        if ((doctorResponseAfterDateSelect[i].label !== null) && (doctorResponseAfterDateSelect[i].label.toLowerCase() == "blocked")) {
                            var startTime = doctorResponseAfterDateSelect[i].startTime;
                            startTime = startTime - startTime % timePerPatientForThatDoctor;
                            console.log("start time after selec----" + startTime);
                            console.log("end time is after selec---" + doctorResponseAfterDateSelect[i].endTime);
                            for (var j = startTime; j < doctorResponseAfterDateSelect[i].endTime; j = j + timePerPatientForThatDoctor) {
                                console.log("j value--" + j);
                                if ($scope.blockedTimingsArray.indexOf(j) === -1) {
                                    $scope.blockedTimingsArray.push(j);
                                }
                            }
                        }
                        /*console.log("blocked array---", $scope.blockedTimingsArray);*/
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
                            console.log("state ", state);
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
                $scope.loading = false;
            },
            function(errorResponse) {
                $scope.loading = true;
                console.log("errorResponse ", errorResponse);
            });
        for (var mrngArrayIndex = 0; mrngArrayIndex < $scope.morningArray.length; mrngArrayIndex++) {
            $scope['morningArrayBtnDisabled' + mrngArrayIndex] = false;
            if ($scope.morningArray[mrngArrayIndex].time < currentTimeMilliSecs) {
                var id = '#morningArrayBtn' + mrngArrayIndex;
                $scope['morningArrayBtnDisabled' + mrngArrayIndex] = true;
                $scope['morning' + mrngArrayIndex] = true;
                /*angular.element(id).removeClass("activeButton");*/
            }
        }
        for (var aftrnoonArrayIndex = 0; aftrnoonArrayIndex < $scope.afternoonArray.length; aftrnoonArrayIndex++) {
            $scope['afternoonArrayBtnDisabled' + aftrnoonArrayIndex] = false;
            if ($scope.afternoonArray[aftrnoonArrayIndex].time < currentTimeMilliSecs) {
                var id = '#afternoonArrayBtn' + aftrnoonArrayIndex;
                $scope['afternoonArrayBtnDisabled' + aftrnoonArrayIndex] = true;
                /*$scope['morning' + aftrnoonArrayIndex] = true;*/
                /*angular.element(id).removeClass("activeButton");*/
            }
        }
        for (var eveningArrayIndex = 0; eveningArrayIndex < $scope.eveningArray.length; eveningArrayIndex++) {
            $scope['eveningArrayBtnDisabled' + eveningArrayIndex] = false;
            if ($scope.eveningArray[eveningArrayIndex].time < currentTimeMilliSecs) {
                var id = '#eveningArrayBtn' + eveningArrayIndex;
                $scope['eveningArrayBtnDisabled' + eveningArrayIndex] = true;
                /*$scope['morning' + aftrnoonArrayIndex] = true;*/
                /*angular.element(id).removeClass("activeButton");*/
            }
        }
        console.log("final morning array after selecting date----", $scope.morningArray);
    }

    $scope.addPatient = function() {
        $scope.patientEntryType = "WALK_IN";
        $scope.sessionTypes = false;
        $scope.dateSelectBox = false;
        $scope.morningTimings = false;
        $scope.afternoonTimings = false;
        $scope.eveningTimings = false;
        $scope.patientDetails = true;
        var firstName = $scope.patientData.firstName;
        var phoneNumber = $scope.patientData.phoneNumber;
        var emailId = $scope.patientData.emailId;
        var newPatientData = {};
        newPatientData.gender = $scope.patientData.gender;
        newPatientData.bloodGroup = $scope.patientData.bloodGroup;
        newPatientData.drugAllergy = $scope.patientData.drugAllergy;
        newPatientData.firstName = $scope.patientData.firstName;
        newPatientData.emailId = $scope.patientData.emailId;
        newPatientData.phoneNumber = $scope.patientData.phoneNumber;
        newPatientData.age = $scope.patientData.age;
        if ($scope.patientId !== "") {
            console.log("inside patient id loop---");
            newPatientData.id = $scope.patientId;
        } else {

        }
        var newPatientDetails = JSON.stringify(newPatientData);
        if (firstName != undefined && phoneNumber != undefined) {
            console.log("patient data is----", newPatientDetails);
            var promise = dboticaServices.addNewPatient(newPatientDetails);
            console.log("add patient response is---", promise);
            promise.then(function(response) {
                $scope.loading = true;
                console.log("add patient actual response is----", response.data.response);
                var addPatientResponse = JSON.parse(response.data.response);
                console.log("add patient response required is----", addPatientResponse);
                $scope.nextForm = true;
                $scope.nextBtn = false;
                $scope.patientAvailable = false;
                $scope.viewDetailsLink = true;
                $scope.patientDataInNextDiv.name = addPatientResponse[0].firstName;
                $scope.book.label = addPatientResponse[0].firstName;
                $scope.book.patientId = addPatientResponse[0].id;
                $scope.addPatientBtn = true;
                $scope.loading = false;
            }, function() {
                $scope.loading = true;
            });
        } else {
            swal({
                title: "Error",
                text: "Mandatory fields are missing Patient not added.",
                type: "error",
                confirmButtonText: "OK"
            }, function() {});
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
            var time = date.toLocaleString();
            var timeArray = time.split(",");
            $scope.seconds = timeConverter(timeArray[1]);
        } else {
            console.log("wrong time selected");
        }
    }

    $scope.selectAfternoonButton = function(time, index) {
        if ($scope['afternoonArrayBtnDisabled' + index] === false) {
            console.log("in right time selected");
            $scope.activeBtnAfternoon = index;
            var date = new Date(time);
            var time = date.toLocaleString();
            var timeArray = time.split(",");
            $scope.seconds = timeConverter(timeArray[1]);
            console.log("$scope.seconds in the afternoon is---" + $scope.seconds);
        } else {
            console.log("wrong time selected");
        }

    }

    $scope.selectEveningButton = function(time, index) {
        console.log("index value selected is----" + index);
        console.log("boolean value is----" + $scope['eveningArrayBtnDisabled' + index]);
        if ($scope['eveningArrayBtnDisabled' + index] === false) {
            console.log("in right time selected");
            $scope.activeBtnEvening = index;
            var date = new Date(time);
            var time = date.toLocaleString();
            var timeArray = time.split(",");
            $scope.seconds = timeConverter(timeArray[1]);
        } else {
            console.log("wrong time selected");
        }
    }

    $scope.bookSlot = function() {
        console.log("date selected---" + $scope.dateSelectedForBooking);
        var dateSelected = $scope.dateSelectedForBooking;
        var dateArray = dateSelected.split('/');
        var date = dateArray[1] + '/' + dateArray[0] + '/' + dateArray[2];
        var dateInFormat = new Date(date);
        var milliSecsOfDate = dateInFormat.getTime();
        console.log("date millisecs is-----" + milliSecsOfDate);
        $scope.book.state = "ACTIVE";
        console.log("seconds in book---" + $scope.seconds);
        $scope.book.startTime = milliSecsOfDate + $scope.seconds * 1000;
        $scope.book.calendarStatus = $scope.patientEntryType;
        console.log("book for-----", $scope.book);
        var promise = dboticaServices.cancelAppointmentOfADateOrUpdateDoctorEvent($scope.book);
        promise.then(function(response) {
            $scope.loading = true;
            console.log("in book---");
            console.log("book response is----", response);
            if (response.data.success === true) {
                var patientsListOfDoctor = dboticaServices.getPatientsListOfDoctor($scope.book.doctorId);
                patientsListOfDoctor.then(function(response) {
                    $scope.loading = true;
                    var patientsList = JSON.parse(response.data.response);
                    $scope.patientsList = dboticaServices.getPatientsListOfDoctorSorted(patientsList);
                    $scope.loading = false;
                }, function(error) {
                    $scope.loading = true;
                    console.log("in patient controller patients error");
                });
                swal({
                    title: "Success",
                    text: "Appointment successfully booked!!!",
                    type: "success",
                    confirmButtonText: "OK"
                }, function() {});
            } else {
                swal({
                    title: "Error",
                    text: "Book Appointment is Failed!",
                    type: "error",
                    confirmButtonText: "OK"
                });
            }
            $scope.loading = false;
        }, function(errorResponse) {
            $scope.loading = true;
            console.log("book error response is---", errorResponse);
        });
    }
}]);
