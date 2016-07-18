angular.module('personalAssistant').controller('nurseController', ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem('currentState', 'nurseHome');

    var nurseHome = this;
    nurseHome.phoneNumberLengthValidation = phoneNumberLengthValidation;
    nurseHome.patientSearchWithPhoneNumber = patientSearchWithPhoneNumber;
    nurseHome.patientEventSelect = patientEventSelect;
    nurseHome.patientSelectFromTheList = patientSelectFromTheList;
    nurseHome.patientDetails = {};
    nurseHome.patientDetails.name = '';
    nurseHome.patientSearchBtnDisabled = true;
    nurseHome.PhoneNumberErrorMessage = false;
    nurseHome.patientsListToBeDisplayed = [];
    nurseHome.patientEventName = 'Patient Medication';
    var organizationId = localStorage.getItem('orgId');
    $rootScope.patientMedication = false;

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);


    function phoneNumberLengthValidation() {
        var phoneNumber = nurseHome.number;
        if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
            if (phoneNumber.length < 10) {
                nurseHome.patientSearchBtnDisabled = true;
                if (phoneNumber.length == 0) {
                    nurseHome.PhoneNumberErrorMessage = false;
                } else {
                    nurseHome.PhoneNumberErrorMessage = true;
                }
            } else {
                if (phoneNumber.length == 10) {
                    nurseHome.patientSearchBtnDisabled = false;
                    nurseHome.PhoneNumberErrorMessage = false;
                } else {
                    nurseHome.patientSearchBtnDisabled = true;
                    nurseHome.PhoneNumberErrorMessage = true;
                }
            }
        } else {
            nurseHome.PhoneNumberErrorMessage = false;
            nurseHome.patientSearchBtnDisabled = true;
        }
    }

    function patientSearchWithPhoneNumber() {
        var patientsListPromise = dboticaServices.getInPatientsWithPhoneNumber(nurseHome.number);
        $log.log('patients list promise is---', patientsListPromise);
        patientsListPromise.then(function(patientsListSuccess) {
            $log.log('promise for new number is---', patientsListPromise);
            var errorCode = patientsListSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
                if (patientsListSuccess.data.response == "no patient found") {
                    angular.element('#patientsListModal').modal('hide');
                    dboticaServices.noAdmittedPatientSwal();
                    var emptyPatientsArray = [];
                    var emptyPatient = {};
                    dboticaServices.setPatientEvents(emptyPatientsArray);
                    dboticaServices.setProgressNotePatientEvents(emptyPatientsArray);
                    dboticaServices.setVitalSignEvents(emptyPatientsArray);
                    dboticaServices.setIntakeEvents(emptyPatientsArray);
                    dboticaServices.setOutputEvents(emptyPatientsArray);
                    dboticaServices.setTransfersArray(emptyPatientsArray);
                    nurseHome.patientDetails.name = '';
                    nurseHome.patientDetails.inpatientNumberInBox = '';
                    nurseHome.patientDetails.inpatientAdmitTime = '';
                    nurseHome.patientDetails.inchargeDoctorInBox = '';
                    nurseHome.patientDetails.inchargeDepartmentInBox = '';
                    nurseHome.patientDetails.inPatientRoomInBox = '';
                    nurseHome.patientDetails.bedNumberInBox = '';
                    dboticaServices.setInpatient(emptyPatient);
                    nurseHome.patientsListToBeDisplayed = [];
                    dboticaServices.setPatientDetailsInService(emptyPatient);
                }
            } else {
                var inpatientsListFromApi = [];
                nurseHome.patientsListToBeDisplayed = [];
                inpatientsListFromApi = angular.fromJson(patientsListSuccess.data.response);
                $log.log('inpatientsListFromApiis---', inpatientsListFromApi);
                if (inpatientsListFromApi.length > 0) {
                    angular.forEach(inpatientsListFromApi, function(inpatientEntity) {
                        inpatientEntity.details = angular.fromJson(inpatientEntity.details);
                    });
                    angular.copy(inpatientsListFromApi, nurseHome.patientsListToBeDisplayed);
                }
            }
        }, function(patientsListError) {
            dboticaServices.noConnectivityError();
        });
    }

    function patientEventSelect(patientEvent) {
        switch (patientEvent) {
            case 'patientMedication':
                nurseHome.patientEventName = 'Patient Medication';
                break;
            case 'intakeOutput':
                nurseHome.patientEventName = 'Intake/Output Record';
                break;
            case 'progressNote':
                nurseHome.patientEventName = 'Nurse Progress Note';
                break;
            case 'vitalSign':
                nurseHome.patientEventName = 'Vital Sign';
                break;
            case 'bedSideProcedure':
                nurseHome.patientEventName = 'Bed Side Procedure';
                break;
            case 'ipRoomTransfer':
                nurseHome.patientEventName = 'IP Room Transfer';
                break;
            case 'patientHistory':
                nurseHome.patientEventName = 'Patient History';
                break;
            case 'dischargeSummary':
                nurseHome.patientEventName = 'Discharge Summary';
                break;
        }
    }

    function patientSelectFromTheList(patient) {
        dboticaServices.setInpatient(patient);
        nurseHome.patientDetails.name = patient.details.inPatientName;
        nurseHome.patientDetails.inpatientNumberInBox = patient.organizationPatientNo;
        nurseHome.patientDetails.inpatientAdmitTime = moment(patient.details.admitTime).format("DD/MM/YYYY,hh:mm:ss A");
        nurseHome.patientDetails.inchargeDoctorInBox = patient.doctorDetail.doctorName;
        nurseHome.patientDetails.inchargeDepartmentInBox = patient.doctorDetail.doctorDepartment;
        nurseHome.patientDetails.inPatientRoomInBox = patient.details.roomNumber;
        nurseHome.patientDetails.bedNumberInBox = patient.details.bedNumber;
        dboticaServices.setPatientDetailsInService(patient);
        $rootScope.patientMedication = true;
        var eventsPromise = dboticaServices.getPatientEvents(organizationId);
        eventsPromise.then(function(eventsSuccess) {
            var errorCode = eventsSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var eventsResponseIs = angular.fromJson(eventsSuccess.data.response);
                var eventsList = [];
                var progressNoteEventsList = [];
                var vitalSignEventsList = [];
                var intakeEventsList = [];
                var outputEventsList = [];
                var transferEventsList = [];
                $log.log('events response is----', eventsResponseIs);
                angular.forEach(eventsResponseIs, function(pateintEventEntity) {
                    pateintEventEntity.referenceDetails = angular.fromJson(pateintEventEntity.referenceDetails);
                    if (patient.id == pateintEventEntity.patientId && pateintEventEntity.state == 'ACTIVE' && pateintEventEntity.patientEventType == 'MEDICINE_PROVIDED') {
                        eventsList.push(pateintEventEntity);
                    }
                    if (patient.id == pateintEventEntity.patientId && pateintEventEntity.state == 'ACTIVE' && pateintEventEntity.patientEventType == 'PATIENT_DETAILS' && pateintEventEntity.referenceDetails.type == 'PROGRESS_NOTE') {
                        progressNoteEventsList.push(pateintEventEntity);
                    }
                    if (patient.id == pateintEventEntity.patientId && pateintEventEntity.state == 'ACTIVE' && pateintEventEntity.patientEventType == 'PATIENT_DETAILS' && pateintEventEntity.referenceDetails.type == 'VITAL_SIGN') {
                        vitalSignEventsList.push(pateintEventEntity);
                    }
                    if (patient.id == pateintEventEntity.patientId && pateintEventEntity.state == 'ACTIVE' && pateintEventEntity.patientEventType == 'PATIENT_DETAILS' && pateintEventEntity.referenceDetails.type == 'INTAKE_RECORD') {
                        intakeEventsList.push(pateintEventEntity);
                    }
                    if (patient.id == pateintEventEntity.patientId && pateintEventEntity.state == 'ACTIVE' && pateintEventEntity.patientEventType == 'PATIENT_DETAILS' && pateintEventEntity.referenceDetails.type == 'OUTPUT_RECORD') {
                        outputEventsList.push(pateintEventEntity);
                    }
                    if (patient.id == pateintEventEntity.patientId && pateintEventEntity.state == 'ACTIVE' && pateintEventEntity.patientEventType == 'ROOM_TRANSFERRED') {
                        pateintEventEntity.roomTransferDate = pateintEventEntity.creationTime;
                        transferEventsList.push(pateintEventEntity);
                    }
                });
                dboticaServices.setPatientEvents(eventsList);
                dboticaServices.setProgressNotePatientEvents(progressNoteEventsList);
                dboticaServices.setVitalSignEvents(vitalSignEventsList);
                dboticaServices.setIntakeEvents(intakeEventsList);
                dboticaServices.setOutputEvents(outputEventsList);
                dboticaServices.setTransfersArray(transferEventsList);
                $log.log('transfer events list is---', transferEventsList);
            }
        }, function(eventsError) {
            dboticaServices.noConnectivityError();
        });
    }
}]);
