angular.module('personalAssistant').controller('nurseController', nurseController);
nurseController.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function nurseController($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    sessionStorage.setItem('currentState', 'nurseHome');

    var nurseHome = this;
    nurseHome.phoneNumberLengthValidation = phoneNumberLengthValidation;
    nurseHome.patientSearchWithPhoneNumber = patientSearchWithPhoneNumber;
    nurseHome.patientEventSelect = patientEventSelect;
    nurseHome.patientSelectFromTheList = patientSelectFromTheList;
    nurseHome.patientEventFromtemplates = patientEventFromtemplates;
    nurseHome.patientDetails = {};
    nurseHome.patientDetails.name = '';
    nurseHome.patientSearchBtnDisabled = true;
    nurseHome.PhoneNumberErrorMessage = false;
    nurseHome.patientsListToBeDisplayed = [];
    nurseHome.templatesList = [];
    nurseHome.patientEventName = 'Patient Medication';
    var organizationId = sessionStorage.getItem('orgId');
    $rootScope.patientMedication = false;
    $scope.templateFlag = false;
    $scope.activeTemplate = {};
    $scope.activeTemplateFields = [];

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);

    var getTemplatesPromise = dboticaServices.getAllTemplates(organizationId, '', true);
    getTemplatesPromise.then(function(getTemplatesSuccess) {
        var errorCode = getTemplatesSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var getTemplatesResponse = angular.fromJson(getTemplatesSuccess.data.response);
            $log.log('get response is------', getTemplatesResponse);
            if (errorCode == null && getTemplatesSuccess.data.success) {
                nurseHome.templatesList = _.filter(getTemplatesResponse, function(getEntity) {
                    return getEntity.state == 'ACTIVE';
                });
                $log.log('skjdskj ----', nurseHome.templatesList);
            }
        }
    }, function(getTemplatesError) {
        dboticaServices.noConnectivityError();
    });

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
                var totalInPatientsList = [];
                if (inpatientsListFromApi.length > 0) {
                    angular.forEach(inpatientsListFromApi, function(inpatientEntity) {
                        if (_.has(inpatientEntity, 'details') && inpatientEntity.patientState == 'ADMITTED') {
                            inpatientEntity.details = angular.fromJson(inpatientEntity.details);
                            totalInPatientsList.push(inpatientEntity);
                        }
                    });
                    angular.copy(totalInPatientsList, nurseHome.patientsListToBeDisplayed);
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
            case 'patientDetails':
                nurseHome.patientEventName = 'Patient Details';
                break;
        }
    }

    function patientEventFromtemplates(eventEntity) {
        nurseHome.patientEventName = eventEntity.name;
        $scope.activeTemplate = eventEntity;
        $scope.templateName = eventEntity.name;
        $scope.templateFlag = !$scope.templateFlag;
        elementWatcher();
    }

    function elementWatcher() {
        $scope.$watch('$scope.templateFlag', function() {
            $scope.activeTemplate = {};
            var localActiveObject = {};
            var activeTemplateIndex = _.findLastIndex(nurseHome.templatesList, function(templateEntity) {
                return templateEntity.name == $scope.templateName;
            });
            angular.copy(nurseHome.templatesList[activeTemplateIndex], localActiveObject);
            angular.forEach(localActiveObject.templateFields, function(activeEntity, key, value) {
                if (activeEntity.fieldState == 'INACTIVE') {
                    localActiveObject.templateFields.splice(key, 1);
                }
            });
            $scope.activeTemplateFields = _.groupBy(localActiveObject.templateFields, 'sectionName');
            angular.copy(localActiveObject, $scope.activeTemplate);
        });
    }

    function patientSelectFromTheList(patient) {
        $log.log('patient selected is------', patient);
        dboticaServices.setInpatient(patient);
        nurseHome.patientDetails.name = patient.details.inPatientName;
        nurseHome.patientDetails.inpatientNumberInBox = patient.organizationPatientNo;
        nurseHome.patientDetails.inpatientAdmitTime = moment(patient.details.admitTime).format("DD/MM/YYYY,hh:mm:ss A");
        nurseHome.patientDetails.inchargeDoctorInBox = patient.doctorDetails.doctorName;
        nurseHome.patientDetails.inchargeDepartmentInBox = patient.doctorDetails.doctorDepartment;
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
                var templatesEventsList = [];
                $log.log('events response is----', eventsResponseIs);
                angular.forEach(eventsResponseIs, function(patientEventEntity) {
                    patientEventEntity.referenceDetails = angular.fromJson(patientEventEntity.referenceDetails);
                    if (patient.id == patientEventEntity.patientId && patientEventEntity.state == 'ACTIVE' && patientEventEntity.patientEventType == 'MEDICINE_PROVIDED') {
                        eventsList.push(patientEventEntity);
                    }
                    if (patient.id == patientEventEntity.patientId && patientEventEntity.state == 'ACTIVE' && patientEventEntity.patientEventType == 'PATIENT_DETAILS' && patientEventEntity.referenceDetails.type == 'PROGRESS_NOTE') {
                        progressNoteEventsList.push(patientEventEntity);
                    }
                    if (patient.id == patientEventEntity.patientId && patientEventEntity.state == 'ACTIVE' && patientEventEntity.patientEventType == 'PATIENT_DETAILS' && patientEventEntity.referenceDetails.type == 'VITAL_SIGN') {
                        vitalSignEventsList.push(patientEventEntity);
                    }
                    if (patient.id == patientEventEntity.patientId && patientEventEntity.state == 'ACTIVE' && patientEventEntity.patientEventType == 'PATIENT_DETAILS' && patientEventEntity.referenceDetails.type == 'INTAKE_RECORD') {
                        intakeEventsList.push(patientEventEntity);
                    }
                    if (patient.id == patientEventEntity.patientId && patientEventEntity.state == 'ACTIVE' && patientEventEntity.patientEventType == 'PATIENT_DETAILS' && patientEventEntity.referenceDetails.type == 'OUTPUT_RECORD') {
                        outputEventsList.push(patientEventEntity);
                    }
                    if (patient.id == patientEventEntity.patientId && patientEventEntity.state == 'ACTIVE' && patientEventEntity.patientEventType == 'PATIENT_DETAILS' && patientEventEntity.referenceDetails.type == 'TEMPLATE_PATIENTDETAILS') {
                        templatesEventsList.push(patientEventEntity);
                    }
                    if (patient.id == patientEventEntity.patientId && patientEventEntity.state == 'ACTIVE' && patientEventEntity.patientEventType == 'ROOM_TRANSFERRED') {
                        if (_.has(patientEventEntity, 'referenceDetails.type')) {
                            patientEventEntity.roomTransferDate = patientEventEntity.creationTime;
                            transferEventsList.push(patientEventEntity);
                        }
                    }
                });
                dboticaServices.setPatientEvents(eventsList);
                dboticaServices.setProgressNotePatientEvents(progressNoteEventsList);
                dboticaServices.setVitalSignEvents(vitalSignEventsList);
                dboticaServices.setIntakeEvents(intakeEventsList);
                dboticaServices.setOutputEvents(outputEventsList);
                dboticaServices.setTransfersArray(transferEventsList);
                dboticaServices.setTemplatePatientDetails(templatesEventsList);
                $log.log('transfer events list is---', transferEventsList);
            }
        }, function(eventsError) {
            dboticaServices.noConnectivityError();
        });
    }
};
