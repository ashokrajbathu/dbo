angular.module('personalAssistant').controller('progressNoteController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', '$timeout', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, $timeout, doctorServices, SweetAlert) {
    angular.element("#inputNoteDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true
    });

    var note = this;

    var organizationId = localStorage.getItem('orgId');

    note.addNoteInModal = addNoteInModal;
    note.getData = getData;
    note.timeChangeInTxtBox = timeChangeInTxtBox;
    note.removeNotesEntity = removeNotesEntity;

    var loggedInAss = localStorage.getItem('assistantCurrentlyLoggedIn');
    loggedInAss = angular.fromJson(loggedInAss);
    note.assistantName = loggedInAss.firstName;

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);


    note.newNote = {};
    note.newNote.notes = '';

    note.mytime = new Date();
    note.hstep = 1;
    note.mstep = 1;
    note.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };
    note.ismeridian = true;
    note.focusToolTip = false;
    note.dateToolTip = false;

    $scope.popupCloseDelay = 2000;

    $scope.placement = {
        options: [
            'top',
            'top-left',
            'top-right',
            'bottom',
            'bottom-left',
            'bottom-right',
            'left',
            'left-top',
            'left-bottom',
            'right',
            'right-top',
            'right-bottom'
        ],
        selected: 'top'
    };

    note.newNote = {};

    var notesListForSetter = [];
    note.patientsEventsList = [];

    var date = new Date();
    var dateSorted = moment(date).format("DD/MM/YYYY,hh:mm A");
    var timeArray = dateSorted.split(",");
    note.newNote.date = timeArray[0];
    note.newNote.time = timeArray[1];

    function getData() {
        note.patient = dboticaServices.getPatientDetailsFromService();
        note.patientEventsList = [];
        note.patientEventsList = dboticaServices.getProgressNotePatientEvents();
        if (note.patientEventsList !== notesListForSetter) {
            angular.copy(note.patientEventsList, notesListForSetter);
        }
        return true;
    }

    function timeChangeInTxtBox() {
        $scope.$watch('note.mytime', function() {
            note.newNote.time = moment(note.mytime).format("hh:mm A");
        });
    }

    function addNoteInModal() {
        if (!jQuery.isEmptyObject(note.patient)) {
            var addNoteRequestEntity = {};
            var noteDate = note.newNote.date;
            var noteTime = note.newNote.time;
            var noteFocus = note.newNote.focus;
            if (noteDate !== undefined && noteDate !== '' && noteFocus !== undefined && noteFocus !== '') {
                addNoteRequestEntity.organizationId = organizationId;
                addNoteRequestEntity.patientId = note.patient.id;
                addNoteRequestEntity.patientName = note.patient.firstName;
                addNoteRequestEntity.patientPhoneNumber = note.patient.phoneNumber;
                addNoteRequestEntity.patientEventType = 'PATIENT_DETAILS';
                var currentDate = new Date();
                addNoteRequestEntity.startTime = currentDate.getTime();
                addNoteRequestEntity.alertTime = '';
                addNoteRequestEntity.referenceId = '';
                var newNoteDetails = {};
                newNoteDetails.type = 'PROGRESS_NOTE';
                newNoteDetails.date = noteDate;
                newNoteDetails.time = noteTime;
                newNoteDetails.focus = noteFocus;
                newNoteDetails.notesInModal = note.newNote.notes;
                newNoteDetails = JSON.stringify(newNoteDetails);
                addNoteRequestEntity.referenceDetails = newNoteDetails;
                var addNewNotePromise = dboticaServices.patientEvent(addNoteRequestEntity);
                addNewNotePromise.then(function(addNoteSuccess) {
                    var errorCode = addNoteSuccess.data.errorCode;
                    if (errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        if (errorCode == null && addNoteSuccess.data.success == true) {
                            var addNoteResponse = angular.fromJson(addNoteSuccess.data.response);
                            addNoteResponse.referenceDetails = angular.fromJson(addNoteResponse.referenceDetails);
                            note.patientEventsList.unshift(addNoteResponse);
                            dboticaServices.setProgressNotePatientEvents(note.patientEventsList);
                            dboticaServices.saveNotesSuccessSwal();
                            angular.element('#progressNoteModal').modal('hide');
                        }
                    }
                }, function(addNoteError) {
                    dboticaServices.noConnectivityError();
                });
            } else {
                if (noteDate == undefined || noteDate == '') {
                    note.dateToolTip = true;
                    $timeout(function() {
                        note.dateToolTip = false;
                    }, 400);
                }
                if (noteFocus == undefined || noteFocus == '') {
                    note.focusToolTip = true;
                    $timeout(function() {
                        note.focusToolTip = false;
                    }, 400);
                }
            }
        } else {
            angular.element('#progressNoteModal').modal('hide');
            dboticaServices.pleaseSelectPatientSwal();
        }
    }

    function removeNotesEntity(noteElement, index) {
        var removeRequestEntity = {};
        angular.copy(noteElement, removeRequestEntity);
        removeRequestEntity.referenceDetails = JSON.stringify(removeRequestEntity.referenceDetails);
        removeRequestEntity.state = 'INACTIVE';
        var removeEventPromise = dboticaServices.patientEvent(removeRequestEntity);
        removeEventPromise.then(function(removeEventSuccess) {
            var errorCode = removeEventSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                if (errorCode == null && removeEventSuccess.data.success == true) {
                    var searchedIndex = dboticaServices.requiredIndexFromArray(notesListForSetter, noteElement.id);
                    notesListForSetter.splice(searchedIndex, 1);
                    dboticaServices.setProgressNotePatientEvents(notesListForSetter);
                    note.patientEventsList.splice(index, 1);
                    dboticaServices.noteDeleteSuccessSwal();
                }
            }
        }, function(removeEventError) {
            dboticaServices.noConnectivityError();
        });
    }

}]);
