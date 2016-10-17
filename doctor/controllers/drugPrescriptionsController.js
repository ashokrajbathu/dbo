angular.module('doctor').controller('drugPrescriptionsController', drugPrescriptionsController);
drugPrescriptionsController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', '$timeout', 'SweetAlert'];

function drugPrescriptionsController($scope, $log, doctorServices, $state, $http, $parse, $timeout, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'drugPrescriptions');

    var prescriptionElement = this;
    prescriptionElement.blurScreen = false;
    prescriptionElement.loading = false;
    prescriptionElement.dropdownActive = false;
    prescriptionElement.drugTemplates = [];
    var selectDoctor = '---Select Doctor---';
    prescriptionElement.doctorName = '---Select Doctor---';
    var doctorObject = { 'firstName': '---Select Doctor---' };
    var hyphen = '-';
    var classDefault = 'default';
    var classSuccess = 'success';
    var timingsArray = [];
    var emptyArray = [];
    var underscore = '_';
    var space = ' ';
    var comma = ',';
    var activeTestId;
    var emptyString = '';
    var singleDay = 1 + ' Day';
    var singleUnit = 1 + ' unit';
    var totalDrugs = [];
    var drugsListToSave = [];
    var daysDisplay = 'Days';
    var activeDrugId;
    var printPrescription = {};
    var currentActivePatient = {};
    var capsuleTypes = ['TABLET', 'CAPSULE', 'INJECTION', 'SACHET', 'LOZENGES', 'SUPPOSITORY', 'RESPULES', 'PEN', 'APLICAPS', 'ENEMA', 'PATCH'];
    prescriptionElement.testsListInTable = [];
    prescriptionElement.testsList = [];
    prescriptionElement.drugsList = [];
    prescriptionElement.fillPrescription = {};
    prescriptionElement.fillPrescription.daysOrQuantity = 'Days';
    prescriptionElement.fillPrescription.days = 1;
    prescriptionElement.fillPrescription.perServing = '';
    prescriptionElement.test = {};
    prescriptionElement.test.testName = '';
    prescriptionElement.additionalComments = '';
    prescriptionElement.doctorsListToBeDisplayed = [];
    prescriptionElement.testsList = [];
    var drugObjectsShown = [];
    var activeDoctor = {};
    var prescriptionObject = {};
    prescriptionElement.prescriptionData = {};
    prescriptionElement.prescriptionData.firstName = '';
    prescriptionElement.prescriptionData.weight = '';
    prescriptionElement.prescriptionData.height = '';
    prescriptionElement.prescriptionData.temperature = '';
    prescriptionElement.prescriptionData.bloodPressure = '';
    prescriptionElement.prescriptionData.bmi = '';
    prescriptionElement.prescriptionData.saturation = '';
    prescriptionElement.prescriptionData.pulse = '';
    prescriptionElement.prescriptionData.drugAllergyInForm = '';
    var activePatient = {};
    prescriptionElement.patientPrescriptions = [];
    prescriptionElement.totalAppointmentsCount = 0;
    prescriptionElement.totalWalkinsCount = 0;
    prescriptionElement.itemsPerPage = 8;
    prescriptionElement.walkinItemsPerPage = 8;
    prescriptionElement.walkinsCurrentPage = 1;
    prescriptionElement.currentPage = 1;
    prescriptionElement.patientData = {};
    prescriptionElement.imagesList = [];
    prescriptionElement.addedImagesList = [];
    var activePatientIndex;
    var selectedDrug;
    var selectedDrugId;
    var selectedDrugIndex;
    var selectedDrugType;
    var activeDrugType;
    var newPatientFlag = false;
    var updatePatientFlag = false;
    prescriptionElement.PhoneNumberErrorMessage = false;
    prescriptionElement.patientSearchBtnDisabled = true;
    prescriptionElement.updatePatient = false;
    prescriptionElement.addMember = false;
    prescriptionElement.noPatientDetailsErrorMessage = false;
    prescriptionElement.mandatoryFieldsErrorMessage = false;
    prescriptionElement.Before_BreakFast = classDefault;
    prescriptionElement.After_BreakFast = classDefault;
    prescriptionElement.Before_Lunch = classDefault;
    prescriptionElement.After_Lunch = classDefault;
    prescriptionElement.Before_Dinner = classDefault;
    prescriptionElement.After_Dinner = classDefault;
    prescriptionElement.referToDoctor = '';
    var appointmentsArray = [];
    prescriptionElement.appointmentsListToBeDisplayed = [];
    prescriptionElement.walkinsListToBeDisplayed = [];
    var appointmentsListSorted = [];
    var walkinsListSorted = [];
    var appointmentsEntities = [];
    var walkinEntities = [];
    prescriptionElement.templatesList = [];
    var activeTemplates = [];
    prescriptionElement.patientCaseHistory = [];
    prescriptionElement.templatesListInTable = [];
    prescriptionElement.prescriptionsInModal = [];
    prescriptionElement.casesInModal = [];
    var activeCaseNumber = '';
    var organizationPatientId = '';
    var caseActive = {};
    var selectCaseObject = { organizationCaseNo: '---Select Case Number---' };
    prescriptionElement.activeCaseHighlight = false;
    prescriptionElement.displaySelectedCaseNumber = '---Select Case Number---';

    activeDoctor = localStorage.getItem('currentDoctor');
    activeDoctor = angular.fromJson(activeDoctor);

    if (_.isEmpty(activeDoctor)) {
        localStorage.clear();
        localStorage.setItem("isLoggedInDoctor", "false");
        $state.go('login');
    }

    var date = new Date();
    var dateSorted = moment(date).format("DD/MM/YYYY,hh:mm A");
    var dateArray = dateSorted.split(comma);
    prescriptionElement.revisitAfterDate = '';
    var today = dateArray[0];

    prescriptionElement.phoneNumberLengthValidation = phoneNumberLengthValidation;
    prescriptionElement.patientSearchByDoctor = patientSearchByDoctor;
    prescriptionElement.addOrUpdatePatient = addOrUpdatePatient;
    prescriptionElement.addFamilyMember = addFamilyMember;
    prescriptionElement.updatePatientDetails = updatePatientDetails;
    prescriptionElement.selectActivePatient = selectActivePatient;
    prescriptionElement.addSuccess = addSuccess;
    prescriptionElement.daysIncrement = daysIncrement;
    prescriptionElement.daysDecrement = daysDecrement;
    prescriptionElement.addDrug = addDrug;
    prescriptionElement.deleteDrug = deleteDrug;
    prescriptionElement.testSearch = testSearch;
    prescriptionElement.selectTestFromTheDropdown = selectTestFromTheDropdown;
    prescriptionElement.addTest = addTest;
    prescriptionElement.deleteTest = deleteTest;
    prescriptionElement.daysChange = daysChange;
    prescriptionElement.savePrescription = savePrescription;
    prescriptionElement.calculateBmi = calculateBmi;
    prescriptionElement.hideDropDown = hideDropDown;
    prescriptionElement.appointmentsList = appointmentsList;
    prescriptionElement.pageChanged = pageChanged;
    prescriptionElement.walkinsPageChanged = walkinsPageChanged;
    prescriptionElement.selectAppointmentOrWalkin = selectAppointmentOrWalkin;
    prescriptionElement.addDrugTemplate = addDrugTemplate;
    prescriptionElement.addDrugTemp = addDrugTemp;
    prescriptionElement.bookAppointment = bookAppointment;
    prescriptionElement.resetDrugPrescription = resetDrugPrescription;
    prescriptionElement.selectPrescription = selectPrescription;
    prescriptionElement.selectTemplate = selectTemplate;
    prescriptionElement.getPrescriptionsOfCaseNumber = getPrescriptionsOfCaseNumber;
    prescriptionElement.openNewCase = openNewCase;
    prescriptionElement.selectCaseNumberInModal = selectCaseNumberInModal;
    prescriptionElement.addImageToPrescription = addImageToPrescription;

    function addImageToPrescription(imageEntity) {
        var imageIndex = _.findLastIndex(prescriptionElement.addedImagesList, function(entity) {
            return entity.id == imageEntity.id;
        });
        if (imageIndex == -1) {
            prescriptionElement.addedImagesList.push(imageEntity);
        } else {
            prescriptionElement.addedImagesList.splice(imageIndex, 1);
        }
        $log.log('final images list-----', prescriptionElement.addedImagesList);
    }

    var getDrugTemplatesPromise = doctorServices.getDrugTemplates();
    getDrugTemplatesPromise.then(function(getDrugTemplatesSuccess) {
        var errorCode = getDrugTemplatesSuccess.data.errorCode;
        if (errorCode) {
            doctorServices.logoutFromThePage(errorCode);
        } else {
            var getDrugTemplatesResponse = angular.fromJson(getDrugTemplatesSuccess.data.response);
            prescriptionElement.drugTemplates = _.filter(getDrugTemplatesResponse, function(entity) {
                return entity.state == 'ACTIVE';
            });
            angular.forEach(prescriptionElement.drugTemplates, function(value, key) {
                prescriptionElement['checkbox' + key] = false;
            });
        }
    }, function(getDrugTemplatesError) {
        doctorServices.noConnectivityError();
    });

    var getDoctorTemplatesPromise = doctorServices.getDoctorTemplates(activeDoctor.organizationId);
    getDoctorTemplatesPromise.then(function(getTemplatesSuccess) {
        var errorCode = getTemplatesSuccess.data.errorCode;
        if (errorCode) {
            doctorServices.logoutFromThePage(errorCode);
        } else {
            var doctorTemplates = angular.fromJson(getTemplatesSuccess.data.response);
            activeTemplates = _.filter(doctorTemplates, function(templateEntity) {
                return templateEntity.state == 'ACTIVE';
            });
            angular.forEach(activeTemplates, function(activeTemplateEntity) {
                angular.forEach(activeTemplateEntity.templateFields, function(templateFieldEntity, key, value) {
                    if (templateFieldEntity.fieldState == 'INACTIVE') {
                        activeTemplateEntity.templateFields.splice(key, 1);
                    }
                });
                activeTemplateEntity.activeTemplateFields = {};
                activeTemplateEntity.activeTemplateFields = _.groupBy(activeTemplateEntity.templateFields, 'sectionName');
            });
            angular.copy(activeTemplates, prescriptionElement.templatesListInTable);
        }
    }, function(getTemplatesError) {
        doctorServices.noConnectivityError();
    });

    var getImagesPromise = doctorServices.getDoctorImages();
    getImagesPromise.then(function(getImageSuccess) {
        var errorCode = getImageSuccess.data.errorCode;
        if (errorCode) {
            doctorServices.logoutFromThePage(errorCode);
        } else {
            var imageSuccess = angular.fromJson(getImageSuccess.data.response);
            if (errorCode == null && getImageSuccess.data.success) {
                prescriptionElement.imagesList = _.filter(imageSuccess, function(imageEntity) {
                    return imageEntity.state == 'ACTIVE';
                });
            }
        }
    }, function(getImageError) {
        doctorServices.noConnectivityError();
    });


    $(document).on('click', function(e) {
        if ($(e.target).closest("#testsearchbox").length === 0) {
            $("#testDropdownDiv").hide();
            prescriptionElement.dropdownActive = false;
        }
    });

    function hideDropDown() {
        prescriptionElement.dropdownActive = false;
    }

    function selectCaseNumberInModal(caseEntity) {
        if (caseEntity.organizationCaseNo !== '---Select Case Number---') {
            prescriptionElement.displaySelectedCaseNumber = caseEntity.organizationCaseNo + '-' + doctorServices.longDateToReadableDate(caseEntity.lastUpdated);
            getPrescriptionsOfCaseNumber(caseEntity);
        } else {
            prescriptionElement.displaySelectedCaseNumber = '---Select Case Number---';
            prescriptionElement.casesInModal = [];
        }
    }

    function openNewCase() {
        if (!_.isEmpty(activePatient) && !_.isEmpty(caseActive)) {
            var activeCaseIndex = _.findLastIndex(prescriptionElement.patientCaseHistory, function(caseEntry) {
                return caseEntry.organizationCaseStatus == 'OPENED';
            });
            prescriptionElement.patientCaseHistory[activeCaseIndex].organizationCaseStatus = 'CLOSED';
            var closeCasePromise = doctorServices.closeCase(caseActive.id);
            closeCasePromise.then(function(closeCaseSuccess) {
                var errorCode = closeCaseSuccess.data.errorCode;
                if (errorCode) {
                    doctorServices.logoutFromThePage(errorCode);
                } else {
                    var closeCaseResponse = angular.fromJson(closeCaseSuccess.data.response);
                    if (errorCode == null && closeCaseSuccess.data.success) {
                        var newCaseObject = {};
                        newCaseObject.patientId = activePatient.id;
                        var openCasePromise = doctorServices.registerPatient(newCaseObject);
                        openCasePromise.then(function(openCaseSuccess) {
                            var errorCode = openCaseSuccess.data.errorCode;
                            if (errorCode) {
                                doctorServices.logoutFromThePage(errorCode);
                            } else {
                                var openCaseResponse = angular.fromJson(openCaseSuccess.data.response);
                                if (errorCode == null && openCaseSuccess.data.success) {
                                    prescriptionElement.casesInModal.push(openCaseResponse);
                                    prescriptionElement.patientCaseHistory = [];
                                    prescriptionElement.patientCaseHistory.push(openCaseResponse);
                                }
                            }
                        }, function(openCaseError) {
                            doctorServices.noConnectivityError();
                        });
                    }
                }
            }, function(closeCaseError) {
                doctorServices.noConnectivityError();
            });
        }
    }

    function selectTemplate(template) {
        var templateIndex = _.findLastIndex(prescriptionElement.templatesList, function(templateEntity) {
            return templateEntity.name == template.name;
        });
        if (templateIndex == -1) {
            prescriptionElement.templatesList.push(template);
        } else {
            prescriptionElement.templatesList.splice(templateIndex, 1);
        }
    }

    function phoneNumberLengthValidation() {
        var phoneNumber = prescriptionElement.phoneNumber;
        if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
            if (phoneNumber.length < 10) {
                prescriptionElement.patientSearchBtnDisabled = true;
                if (phoneNumber.length == 0) {
                    prescriptionElement.PhoneNumberErrorMessage = false;
                } else {
                    prescriptionElement.PhoneNumberErrorMessage = true;
                }
            } else {
                if (phoneNumber.length == 10) {
                    prescriptionElement.patientSearchBtnDisabled = false;
                    prescriptionElement.PhoneNumberErrorMessage = false;
                } else {
                    prescriptionElement.patientSearchBtnDisabled = true;
                    prescriptionElement.PhoneNumberErrorMessage = true;
                }
            }
        } else {
            prescriptionElement.PhoneNumberErrorMessage = false;
            prescriptionElement.patientSearchBtnDisabled = true;
        }
    }

    function patientSearchByDoctor() {
        prescriptionElement.patientData.phoneNumber = prescriptionElement.phoneNumber;
        var patientSearchPromise = doctorServices.getPatientDetailsOfThatNumber(prescriptionElement.phoneNumber);
        patientSearchPromise.then(function(patientSearchSuccess) {
            var errorCode = patientSearchSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                prescriptionElement.patientsToBeDisplayedInRadios = angular.fromJson(patientSearchSuccess.data.response);
                if (prescriptionElement.patientsToBeDisplayedInRadios.length > 0) {
                    newPatientFlag = false;
                    getOrganizationPatientId(prescriptionElement.patientsToBeDisplayedInRadios[0].id);
                    var casePromise = doctorServices.getPatientCaseHistory(prescriptionElement.patientsToBeDisplayedInRadios[0].id);
                    casePromise.then(function(caseSuccess) {
                        var errorCode = caseSuccess.data.errorCode;
                        if (errorCode) {
                            doctorServices.logoutFromThePage(errorCode);
                        } else {
                            var caseHistoryResponse = angular.fromJson(caseSuccess.data.response);
                            if (errorCode == null && caseSuccess.data.success) {
                                prescriptionElement.patientCaseHistory = _.filter(caseHistoryResponse, function(entity) {
                                    if (entity.organizationCaseStatus == 'OPENED') {
                                        caseActive = entity;
                                    }
                                    return entity.state == 'ACTIVE' && entity.organizationCaseStatus == 'OPENED';
                                });
                                //  angular.copy(prescriptionElement.patientCaseHistory, prescriptionElement.casesInModal);
                                prescriptionElement.casesInModal = _.filter(caseHistoryResponse, function(caseEntry) {
                                    return caseEntry.state == 'ACTIVE';
                                });
                            }
                        }
                    }, function(caseError) {
                        doctorServices.noConnectivityError();
                    });
                    activePatient = prescriptionElement.patientsToBeDisplayedInRadios[0];
                    angular.copy(activePatient, currentActivePatient);
                    localStorage.setItem('currentPatient', JSON.stringify(currentActivePatient));
                    prescriptionElement.prescriptionData.age = prescriptionElement.patientsToBeDisplayedInRadios[0].age;
                    prescriptionElement.prescriptionData.lastName = prescriptionElement.patientsToBeDisplayedInRadios[0].lastName;
                    prescriptionElement.prescriptionData.firstName = prescriptionElement.patientsToBeDisplayedInRadios[0].firstName;
                    prescriptionElement.prescriptionData.drugAllergyInForm = prescriptionElement.patientsToBeDisplayedInRadios[0].drugAllergy;
                    activePatientIndex = 0;
                    prescriptionElement.updatePatient = true;
                    prescriptionElement.addMember = true;
                    prescriptionElement.radio0 = true;
                    var getPatientPrescriptionsPromise = doctorServices.prescriptionsOfPatient(activePatient.id);
                    getPatientPrescriptionsPromise.then(function(getPrescriptionsSuccess) {
                        var errorCode = getPrescriptionsSuccess.data.errorCode;
                        if (errorCode) {
                            doctorServices.logoutFromThePage(errorCode);
                        } else {
                            prescriptionElement.patientPrescriptions = angular.fromJson(getPrescriptionsSuccess.data.response);
                        }
                    }, function(getPrescriptionsError) {
                        doctorServices.noConnectivityError();
                    });
                } else {
                    angular.element('#newOrUpdatePatientModal').modal('show');
                    prescriptionElement.noPatientDetailsErrorMessage = true;
                    prescriptionElement.patientData.bloodGroup = 'O_POSITIVE';
                    prescriptionElement.patientData.gender = 'MALE';
                    newPatientFlag = true;
                    activePatient = {};
                }
            }
        }, function(patientSearchError) {
            doctorServices.noConnectivityError();
        });
    }

    function getOrganizationPatientId(id) {
        var organizationPatientPromise = doctorServices.getOrgPatientDetails(id);
        organizationPatientPromise.then(function(orgPatientSuccess) {
            var errorCode = orgPatientSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                var orgPatientResponse = angular.fromJson(orgPatientSuccess.data.response);
                if (errorCode == null && orgPatientSuccess.data.success) {
                    if (orgPatientResponse[0].state == 'ACTIVE') {
                        organizationPatientId = orgPatientResponse[0].id;
                    }
                }
            }
        }, function(orgPatientError) {
            doctorServices.noConnectivityError();
        });
    }

    function getPrescriptionsOfCaseNumber(selectedCase) {
        var caseId = selectedCase.id;
        var localPrescriptions = [];
        var prescriptionsPromise = doctorServices.getPrescriptionsOfCase(caseId);
        prescriptionsPromise.then(function(casePrescriptionsSuccess) {
            var errorCode = casePrescriptionsSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                var prescriptionsResponse = angular.fromJson(casePrescriptionsSuccess.data.response);
                if (errorCode == null && casePrescriptionsSuccess.data.success) {
                    angular.forEach(prescriptionsResponse, function(entity) {
                        if (entity.prescription.state == 'ACTIVE') {
                            var localPrescription = {};
                            localPrescription.lastUpdated = entity.prescription.lastUpdated;
                            localPrescription.prescriptionEntities = [];
                            localPrescription.diagnosisTests = {};
                            localPrescription.drugDosage = {};
                            localPrescription.drugDosage.drugsList = [];
                            if (entity.organizationTemplateInstance.length > 0) {
                                angular.forEach(entity.organizationTemplateInstance, function(instanceEntity) {
                                    var localFieldValues = [];
                                    localFieldValues = angular.fromJson(instanceEntity.templateValues);
                                    angular.forEach(localFieldValues, function(fieldEntity) {
                                        var localObject = {};
                                        if (fieldEntity.description !== '' && fieldEntity.fieldType !== 'CHECK_BOX') {
                                            localObject.name = fieldEntity.name;
                                            localObject.value = fieldEntity.description;
                                            localPrescription.prescriptionEntities.push(localObject);
                                        }
                                        if (fieldEntity.fieldType == 'CHECK_BOX') {
                                            localObject.name = fieldEntity.name;
                                            var arr = [];
                                            angular.forEach(fieldEntity.restrictValues, function(restrictEntity) {
                                                if (restrictEntity.checkBoxValue) {
                                                    arr.push(restrictEntity.name);
                                                }
                                            });
                                            localObject.value = arr.join(',');
                                            localPrescription.prescriptionEntities.push(localObject);
                                        }

                                    });
                                });
                            }
                            if (_.has(entity.prescription, 'weight') && !_.isEmpty(entity.prescription.weight)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Weight', entity.prescription.weight));
                            }
                            if (_.has(entity.prescription, 'age') && !_.isEmpty(entity.prescription.age)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Age', entity.prescription.age));
                            }
                            if (_.has(entity.prescription, 'bloodPressure') && !_.isEmpty(entity.prescription.bloodPressure)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Blood Pressure', entity.prescription.bloodPressure));
                            }
                            if (_.has(entity.prescription, 'bmi') && !_.isEmpty(entity.prescription.bmi)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Body Mass Index', entity.prescription.bmi));
                            }
                            if (_.has(entity.prescription, 'height') && !_.isEmpty(entity.prescription.height)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Height', entity.prescription.height));
                            }
                            if (_.has(entity.prescription, 'investigation') && !_.isEmpty(entity.prescription.investigation)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Investigation', entity.prescription.investigation));
                            }
                            if (_.has(entity.prescription, 'organizationCaseNo') && !_.isEmpty(entity.prescription.organizationCaseNo)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Case Number', entity.prescription.organizationCaseNo));
                            }
                            if (_.has(entity.prescription, 'pulse') && !_.isEmpty(entity.prescription.pulse)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Pulse', entity.prescription.pulse));
                            }
                            if (_.has(entity.prescription, 'references') && !_.isEmpty(entity.prescription.references)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Reference Doctor', entity.prescription.references));
                            }
                            if (_.has(entity.prescription, 'remarks') && !_.isEmpty(entity.prescription.remarks)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Remarks', entity.prescription.remarks));
                            }
                            if (_.has(entity.prescription, 'revisitDate') && !_.isEmpty(entity.prescription.revisitDate)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Revisit Date', entity.prescription.revisitDate));
                            }
                            if (_.has(entity.prescription, 'saturation') && !_.isEmpty(entity.prescription.saturation)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Saturation', entity.prescription.saturation));
                            }
                            if (_.has(entity.prescription, 'symptoms') && !_.isEmpty(entity.prescription.symptoms)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Symptoms', entity.prescription.symptoms));
                            }
                            if (_.has(entity.prescription, 'temperature') && !_.isEmpty(entity.prescription.temperature)) {
                                localPrescription.prescriptionEntities.push(doctorServices.getLocalObject('Temperature', entity.prescription.temperature));
                            }
                            if (_.has(entity.prescription, 'diagnosisTests') && !_.isEmpty(entity.prescription.diagnosisTests)) {
                                localPrescription.diagnosisTests.name = 'Medical Tests';
                                localPrescription.diagnosisTests.tests = entity.prescription.diagnosisTests;
                            }
                            if (_.has(entity.prescription, 'drugDosage') && !_.isEmpty(entity.prescription.drugDosage)) {
                                localPrescription.drugDosage.name = 'Medicines';
                                angular.forEach(entity.prescription.drugDosage, function(drugEntry) {
                                    localPrescription.drugDosage.drugsList.push(doctorServices.getDrugList(drugEntry));
                                });
                            }
                            localPrescriptions.push(localPrescription);
                        }
                    });
                    angular.copy(localPrescriptions, prescriptionElement.prescriptionsInModal);
                }
            }
        }, function(prescriptionsError) {
            doctorServices.noConnectivityError();
        });
    }

    function addOrUpdatePatient() {
        var addPatientRequestEntity = {};
        prescriptionElement.noPatientDetailsErrorMessage = false;
        prescriptionElement.mandatoryFieldsErrorMessage = false;
        var firstName = prescriptionElement.patientData.firstName;
        var phoneNumber = prescriptionElement.patientData.phoneNumber;
        var lastName = prescriptionElement.patientData.lastName;
        if (_.isEmpty(activePatient)) {
            if (newPatientFlag) {
                addPatientRequestEntity.primaryPatient = true;
            } else {
                addPatientRequestEntity.primaryPatient = false;
            }
        } else {
            addPatientRequestEntity.id = activePatient.id;
        }
        if (firstName !== undefined && firstName !== '' && phoneNumber !== undefined && phoneNumber !== '') {
            prescriptionElement.mandatoryFieldsErrorMessage = false;
            addPatientRequestEntity.firstName = firstName;
            addPatientRequestEntity.phoneNumber = phoneNumber;
            addPatientRequestEntity.lastName = lastName;
            addPatientRequestEntity.gender = prescriptionElement.patientData.gender;
            addPatientRequestEntity.bloodGroup = prescriptionElement.patientData.bloodGroup;
            addPatientRequestEntity.drugAllergy = prescriptionElement.patientData.drugAllergy;
            addPatientRequestEntity.emailId = prescriptionElement.patientData.emailId;
            addPatientRequestEntity.age = prescriptionElement.patientData.age;
            addPatientRequestEntity = JSON.stringify(addPatientRequestEntity);
            var addPatientPromise = doctorServices.addNewPatient(addPatientRequestEntity);
            addPatientPromise.then(function(addpatientSuccess) {
                var errorCode = addpatientSuccess.data.errorCode;
                if (errorCode) {
                    doctorServices.logoutFromThePage(errorCode);
                } else {
                    var addPatientResponse = angular.fromJson(addpatientSuccess.data.response);
                    if (errorCode == null && addpatientSuccess.data.success == true) {
                        doctorServices.registerPatientSuccessSwal();
                        if (_.isEmpty(activePatient)) {
                            if (prescriptionElement.patientsToBeDisplayedInRadios.length == 0) {
                                prescriptionElement.patientsToBeDisplayedInRadios = addPatientResponse;
                                activePatient = addPatientResponse[0];
                                angular.copy(activePatient, currentActivePatient);
                                localStorage.setItem('currentPatient', JSON.stringify(currentActivePatient));
                                activePatientIndex = 0;
                                prescriptionElement.updatePatient = true;
                                prescriptionElement.addMember = true;
                                prescriptionElement.radio0 = true;
                                var registerPatientRequest = {};
                                prescriptionElement.prescriptionData.firstName = activePatient.firstName;
                                prescriptionElement.prescriptionData.drugAllergyInForm = activePatient.drugAllergy;
                                registerPatientRequest.organizationId = activeDoctor.organizationId;
                                registerPatientRequest.patientId = activePatient.id;
                                registerPatientRequest.phoneNumber = activePatient.phoneNumber;;
                                registerPatientRequest.activeCaseNumber = '';
                                registerPatientRequest.patientType = 'OUT_PATIENT';
                                registerPatientRequest.patientState = 'CHECK_IN';
                                var registerPatientPromise = doctorServices.registerPatient(registerPatientRequest);
                                registerPatientPromise.then(function(registerPatientSuccess) {
                                    var errorCode = registerPatientSuccess.data.errorCode;
                                    if (errorCode) {
                                        doctorServices.logoutFromThePage(errorCode);
                                    } else {
                                        var registerPatientResponse = angular.fromJson(registerPatientSuccess.data.response);
                                        if (errorCode == null && registerPatientSuccess.data.success) {
                                            if (registerPatientResponse.state == 'ACTIVE') {
                                                organizationPatientId = registerPatientResponse.id;
                                            }
                                        }
                                    }
                                }, function(registerPatientError) {
                                    doctorServices.noConnectivityError();
                                });
                            } else {
                                prescriptionElement.patientsToBeDisplayedInRadios.push(addPatientResponse[0]);
                            }
                        } else {
                            prescriptionElement.patientsToBeDisplayedInRadios.splice(activePatientIndex, 1, addPatientResponse[0]);
                            prescriptionElement['radio' + activePatientIndex] = true;
                            activePatient = addPatientResponse[0];
                            angular.copy(activePatient, currentActivePatient);
                            localStorage.setItem('currentPatient', JSON.stringify(currentActivePatient));
                        }
                        angular.element('#newOrUpdatePatientModal').modal('hide');
                    }
                }
            }, function(addpatientError) {
                doctorServices.noConnectivityError();
            });
        } else {
            prescriptionElement.mandatoryFieldsErrorMessage = true;
        }
    }

    function addFamilyMember() {
        prescriptionElement.mandatoryFieldsErrorMessage = false;
        prescriptionElement.noPatientDetailsErrorMessage = false;
        prescriptionElement.patientData = {};
        prescriptionElement.patientData.gender = 'MALE';
        prescriptionElement.patientData.bloodGroup = 'O_POSITIVE';
        newPatientFlag = false;
        prescriptionElement.patientData.phoneNumber = activePatient.phoneNumber;
        activePatient = {};
    }

    function updatePatientDetails() {
        prescriptionElement.mandatoryFieldsErrorMessage = false;
        prescriptionElement.noPatientDetailsErrorMessage = false;
        updatePatientFlag = true;
        prescriptionElement.patientData = activePatient;
    }

    function selectActivePatient(patientActiveIs, index) {
        activePatient = patientActiveIs;
        angular.copy(activePatient, currentActivePatient);
        localStorage.setItem('currentPatient', JSON.stringify(currentActivePatient));
        activePatientIndex = index;
        prescriptionElement.prescriptionData.firstName = patientActiveIs.firstName;
        prescriptionElement.prescriptionData.drugAllergyInForm = patientActiveIs.drugAllergy;
        getOrganizationPatientId(patientActiveIs.id);
    }

    angular.element('#drugSearchBox').autocomplete({
        source: function(request, callback) {
            var searchParam = request.term;
            prescriptionFormDrugCallback(searchParam, callback)
        },
        minLength: 2,
        open: function() {
            angular.element('ul.ui-menu').width($(this).innerWidth());
        },
        focus: function(event, ui) {
            event.preventDefault();
        },
        select: function(event, ui) {
            ui.item.value = ui.item.value.split('-')[0];
            angular.forEach(drugObjectsShown, function(entity) {
                if (entity.brandName == ui.item.value) {
                    selectedDrug = ui.item.value;
                    selectedDrugId = entity.id;
                    selectedDrugType = entity.drugType;
                    activeDrugType = entity.drugType;
                    selectedDrugIndex = _.findIndex(drugObjectsShown, entity);
                    if (!_.isEmpty(activePatient)) {
                        prescriptionElement.fillPrescription.drugSearch = ui.item.value;
                    } else {
                        ui.item.value = '';
                        prescriptionElement.fillPrescription.drugSearch = '';
                        prescriptionElement.fillPrescription.drugType = '';
                        prescriptionElement.fillPrescription.perServingUnits = '';
                        prescriptionElement.fillPrescription.perServing = '';
                        prescriptionElement.fillPrescription.daysOrQuantity = 'Days';
                        prescriptionElement.fillPrescription.days = 1;
                        prescriptionElement.fillPrescription.specialInstructions = '';
                        prescriptionElement.Before_BreakFast = classDefault;
                        prescriptionElement.After_BreakFast = classDefault;
                        prescriptionElement.Before_Lunch = classDefault;
                        prescriptionElement.After_Lunch = classDefault;
                        prescriptionElement.Before_Dinner = classDefault;
                        prescriptionElement.After_Dinner = classDefault;
                        doctorServices.noActivePatientSwal();
                    }
                }
            });
            selectDrugFromDropdown(selectedDrug, selectedDrugId, selectedDrugType, selectedDrugIndex);
        }
    });

    var selectDrugFromDropdown = function(drug, drugId, drugType, drugIndex) {
        if (!_.isEmpty(activePatient)) {
            if (drug !== undefined && drug !== '') {
                var drugAllergyTo = activePatient.drugAllergy;
                var drugAllergiesArray = [];
                if (drugAllergyTo) {
                    drugAllergiesArray = _.split(drugAllergyTo, comma);
                    var drugName = drug.split(" (")[0];
                    var allergyDrugIndex = _.findLastIndex(drugAllergiesArray, function(entity) {
                        entity = entity.toLowerCase();
                        return drugName == entity;
                    });
                    if (allergyDrugIndex !== -1) {
                        prescriptionElement.fillPrescription.drugSearch = '';
                        doctorServices.nonAllergicDrugSwal();
                    } else {
                        functionalitiesAfterSelectingDrug(drugId, drugIndex);
                    }
                } else {
                    functionalitiesAfterSelectingDrug(drugId, drugIndex);
                }
            }
        }
    }

    var functionalitiesAfterSelectingDrug = function(drugId, drugIndex) {
        activeDrugId = drugId;
        prescriptionElement.fillPrescription.drugType = totalDrugs[drugIndex]['drugType'];
        var drugTypeOnSelect = totalDrugs[drugIndex]['drugType'];
        switch (drugTypeOnSelect.toUpperCase()) {
            case 'SYRUP':
                prescriptionElement.fillPrescription.perServingUnits = "ml";
                break;
            default:
                prescriptionElement.fillPrescription.perServingUnits = "units";
                break;
        }
    }

    var prescriptionFormDrugCallback = function(brandName, callback) {
        autocompleteDrugIndexedDB(brandName, '#drugSearchBox', OnGetDrugsResponse, callback);
    }

    var OnGetDrugsResponse = function(data, callback) {
        var totalDrugObjects = [];
        if (data.length !== 0) {
            angular.copy(data, totalDrugs);
            angular.copy(data, drugObjectsShown);
            angular.forEach(data, function(entity) {
                var brandNameString = entity.brandName;
                if (entity.constituents) {
                    brandNameString += hyphen;
                    angular.forEach(entity.constituents, function(entity) {
                        brandNameString += entity.molecule + ':' + entity.weight + ',';
                    });
                    brandNameString = brandNameString.slice(0, -1);
                }
                totalDrugObjects.push(brandNameString);
            });
        }
        callback(totalDrugObjects);
    }

    angular.element(window).resize(function() {
        $(".ui-autocomplete").css('display', 'none');
        $('#testsDropDown').css('display', 'none');
    });

    function addSuccess(btnClass) {
        if (prescriptionElement[btnClass] == classDefault) {
            prescriptionElement[btnClass] = classSuccess;
            btnClass = _.replace(btnClass, underscore, space);
            timingsArray.push(btnClass);
        } else {
            prescriptionElement[btnClass] = classDefault;
            btnClass = _.replace(btnClass, underscore, space);
            var timingIndex = _.findLastIndex(timingsArray, function(entity) {
                return entity == btnClass;
            });
            timingsArray.splice(timingIndex, 1);
        }
    }

    function daysIncrement() {
        prescriptionElement.fillPrescription.days = prescriptionElement.fillPrescription.days + 1;
    }

    function daysDecrement() {
        if (prescriptionElement.fillPrescription.days !== 1) {
            prescriptionElement.fillPrescription.days = prescriptionElement.fillPrescription.days - 1;
        } else {
            prescriptionElement.fillPrescription.days = 1;
        }
    }

    function addDrug() {
        var drugEntity = {};
        var drugEntityToSave = {};
        drugEntity.drugId = activeDrugId;
        drugEntity.brandName = prescriptionElement.fillPrescription.drugSearch;
        if (prescriptionElement.fillPrescription.drugType !== 'SYRUP') {
            if (prescriptionElement.fillPrescription.perServing == 1) {
                drugEntity.perServing = singleUnit;
            } else {
                if (prescriptionElement.fillPrescription.perServing !== undefined && prescriptionElement.fillPrescription.perServing !== '' && prescriptionElement.fillPrescription.perServing !== 1) {
                    drugEntity.perServing = prescriptionElement.fillPrescription.perServing + ' ' + prescriptionElement.fillPrescription.perServingUnits;
                } else {
                    drugEntity.perServing = '1 unit';
                }
            }
        }
        if (prescriptionElement.fillPrescription.days === 1 && prescriptionElement.fillPrescription.daysOrQuantity == daysDisplay) {
            drugEntity.noOfDays = singleDay;
        } else {
            drugEntity.noOfDays = prescriptionElement.fillPrescription.days + ' ' + prescriptionElement.fillPrescription.daysOrQuantity;
        }
        var quantCount = timingsArray.length;
        if (quantCount == 0) {
            quantCount = 1;
        }
        drugEntity.usageDirection = _.join(timingsArray, comma);
        drugEntity.daysOrQuantity = prescriptionElement.fillPrescription.daysOrQuantity;
        drugEntity.remarks = prescriptionElement.fillPrescription.specialInstructions;
        if (_.isEmpty(drugEntity.remarks)) {
            drugEntity.remarks = '';
        }
        prescriptionElement.drugsList.push(drugEntity);
        angular.copy(drugEntity, drugEntityToSave);
        drugEntityToSave.drugType = activeDrugType;
        drugEntityToSave.perServing = prescriptionElement.fillPrescription.perServing;
        var drugTypeFlag = _.findLastIndex(capsuleTypes, function(entity) {
            return entity == activeDrugType;
        });
        var perServing = prescriptionElement.fillPrescription.perServing;
        if (perServing == undefined || perServing == '') {
            perServing = parseInt(1);
        }
        drugEntityToSave.noOfDays = prescriptionElement.fillPrescription.days;
        if (drugTypeFlag !== -1) {
            if (prescriptionElement.fillPrescription.daysOrQuantity == daysDisplay) {
                drugEntityToSave.quantity = parseInt(prescriptionElement.fillPrescription.days) * quantCount * parseInt(perServing);
            } else {
                drugEntityToSave.quantity = prescriptionElement.fillPrescription.days;
                drugEntityToSave.noOfDays = quantCount != 0 ? Math.ceil(parseInt(prescriptionElement.fillPrescription.days) / (parseInt(perServing) * quantCount)) : 1;
            }
        } else {
            if (prescriptionElement.fillPrescription.daysOrQuantity == daysDisplay) {
                drugEntityToSave.noOfDays = prescriptionElement.fillPrescription.days;
                drugEntityToSave.quantity = 1;
            } else {
                drugEntityToSave.quantity = prescriptionElement.fillPrescription.days;
                drugEntityToSave.noOfDays = 1;
            }
        }
        drugsListToSave.push(drugEntityToSave);
        emptyDrugElements();
        timingBtnsDefault();
    }

    function deleteDrug(drugIndex) {
        prescriptionElement.drugsList.splice(drugIndex, 1);
    }

    function testSearch() {
        var testOnSearch = prescriptionElement.test.testName;
        if (testOnSearch.length > 0) {
            var testsPromise = doctorServices.getTests(testOnSearch);
            testsPromise.then(function(getTestsSuccess) {
                var errorCode = getTestsSuccess.data.errorCode;
                if (errorCode) {
                    doctorServices.logoutFromThePage(errorCode);
                } else {
                    prescriptionElement.testsList = angular.fromJson(getTestsSuccess.data.response);
                    if (prescriptionElement.testsList.length > 0) {
                        $("#testDropdownDiv").show();
                        $('#testsDropDown').css('display', 'block');
                        prescriptionElement.dropdownActive = true;
                    } else {
                        prescriptionElement.dropdownActive = false;
                    }
                }
            }, function(getTestsError) {
                doctorServices.noConnectivityError();
            });
        } else {
            $("#testDropdownDiv").hide();
            prescriptionElement.dropdownActive = false;
        }
    }

    function selectTestFromTheDropdown(selectedTest) {
        activeTestId = '';
        prescriptionElement.dropdownActive = false;
        activeTestId = selectedTest.id;
        prescriptionElement.test.testName = selectedTest.diagnosisTest;
    }

    function addTest() {
        var testEntity = {};
        testEntity.testId = activeTestId;
        testEntity.diagnosisTest = prescriptionElement.test.testName;
        testEntity.remark = prescriptionElement.test.remarks;
        prescriptionElement.testsListInTable.push(testEntity);
        prescriptionElement.test.testName = '';
        prescriptionElement.test.remarks = '';
    }

    function deleteTest(testIndex) {
        prescriptionElement.testsListInTable.splice(testIndex, 1);
    }

    function daysChange() {
        if (!isNaN(prescriptionElement.revisitAfterDays)) {
            prescriptionElement.revisitAfterDate = doctorServices.daysToDate(prescriptionElement.revisitAfterDays);
        }
    }

    function calculateBmi() {
        if (prescriptionElement.prescriptionData.weight != '' && prescriptionElement.prescriptionData.height != '') {
            var bmi = (prescriptionElement.prescriptionData.weight * 10000) / (prescriptionElement.prescriptionData.height * prescriptionElement.prescriptionData.height);
            bmi = Math.round(bmi * 100) / 100;
            prescriptionElement.prescriptionData.bmi = bmi;
        }
    }

    function savePrescription() {
        if (!_.isEmpty(activeDoctor) && !_.isEmpty(activePatient) && organizationPatientId !== '') {
            var prescriptionRequest = {};
            var templateInstanceRequest = [];
            prescriptionRequest.patientId = activePatient.id;
            prescriptionRequest.doctorId = activeDoctor.id;
            prescriptionRequest.height = prescriptionElement.prescriptionData.height;
            prescriptionRequest.weight = prescriptionElement.prescriptionData.weight;
            prescriptionRequest.bloodPressure = prescriptionElement.prescriptionData.bloodPressure;
            prescriptionRequest.temperature = prescriptionElement.prescriptionData.temperature;
            prescriptionRequest.bmi = prescriptionElement.prescriptionData.bmi;
            prescriptionRequest.saturation = prescriptionElement.prescriptionData.saturation;
            prescriptionRequest.pulse = prescriptionElement.prescriptionData.pulse;
            prescriptionRequest.investigation = prescriptionElement.prescriptionData.investigation;
            prescriptionRequest.references = prescriptionElement.referToDoctor;
            prescriptionRequest.revisitDate = prescriptionElement.revisitAfterDate;
            prescriptionRequest.symptoms = prescriptionElement.prescriptionData.symptoms;
            prescriptionRequest.remarks = prescriptionElement.additionalComments;
            prescriptionRequest.age = activePatient.age;
            prescriptionRequest.gender = activePatient.gender;
            prescriptionRequest.drugDosage = drugsListToSave;
            prescriptionRequest.diagnosisTests = prescriptionElement.testsListInTable;
            prescriptionElement.loading = true;
            prescriptionElement.blurScreen = true;
            prescriptionRequest.organizationPatientId = organizationPatientId;
            var prescriptionPromise = doctorServices.addPrescription(prescriptionRequest);
            prescriptionPromise.then(function(prescriptionSuccess) {
                var errorCode = prescriptionSuccess.data.errorCode;
                if (errorCode) {
                    prescriptionElement.loading = false;
                    prescriptionElement.blurScreen = false;
                    doctorServices.logoutFromThePage(errorCode);
                } else {
                    var prescriptionResponse = angular.fromJson(prescriptionSuccess.data.response);
                    if (errorCode == null && prescriptionSuccess.data.success == true) {
                        doctorServices.addPrescriptionSuccessSwal();
                        angular.forEach(prescriptionElement.addedImagesList, function(imageEntity) {
                            var imageRequest = {};
                            imageRequest.keyName = imageEntity.id;
                            imageRequest.prescriptionId = prescriptionResponse.id;
                            imageRequest.description = imageEntity.imageName;
                            imageRequest.remark = '';
                            var addImagePromise = doctorServices.addImageToPrescription(imageRequest);
                            console.log('promise is---------', addImagePromise);
                            addImagePromise.then(function(addImageSuccess) {
                                var errorCode = addImageSuccess.data.errorCode;
                                console.log('error code is---', errorCode);
                                if (errorCode) {
                                    doctorServices.logoutFromThePage(errorCode);
                                } else {
                                    var addImageResponse = angular.fromJson(addImageSuccess.data.response);
                                    console.log('add image response-----', addImageResponse);
                                }
                            }, function(addImageError) {
                                console.log('image error is---', addImageError);
                                doctorServices.noConnectivityError();
                            });
                        });
                        angular.forEach(prescriptionElement.templatesList, function(templateInstanceEntity) {
                            var localInstance = {};
                            localInstance.templateId = templateInstanceEntity.id;
                            localInstance.templateName = templateInstanceEntity.name;
                            localInstance.templateValues = JSON.stringify(templateInstanceEntity.templateFields);
                            localInstance.patientId = activePatient.id;
                            localInstance.userId = activeDoctor.id;
                            localInstance.userRole = 'DOCTOR';
                            localInstance.organizationCaseNo = caseActive.organizationCaseNo;
                            localInstance.organizationCaseId = caseActive.organizationCaseId;
                            localInstance.organizationId = activeDoctor.organizationId;
                            localInstance.overridePermissions = activeDoctor.permissions;
                            localInstance.prescriptionId = prescriptionResponse.id;
                            templateInstanceRequest.push(localInstance);
                        });
                        var templateInstancePromise = doctorServices.saveTemplateInstance(templateInstanceRequest);
                        templateInstancePromise.then(function(templateInstanceSuccess) {
                            var errorCode = templateInstanceSuccess.data.errorCode;
                            if (errorCode) {
                                doctorServices.logoutFromThePage(errorCode);
                            } else {
                                templateInstanceResponse = angular.fromJson(templateInstanceSuccess.data.response);
                            }
                        }, function(templateInstanceError) {
                            doctorServices.noConnectivityError();
                        });
                        prescriptionObject.prescriptionToPrint = prescriptionResponse;
                        prescriptionObject.drugListToDisplay = prescriptionElement.drugsList;
                        prescriptionObject.testsListToDisplay = prescriptionElement.testsListInTable;
                        localStorage.setItem('activePrescriptionId', prescriptionResponse.id);
                        localStorage.setItem('prescriptionObjectToPrint', JSON.stringify(prescriptionObject));
                        $state.go('doctorHome.prescriptionReport');
                        printPrescription.patient = activePatient;
                        printPrescription.doctor = activeDoctor;
                        printPrescription.referDetails = prescriptionResponse;
                        printPrescription.prescription = prescriptionElement.drugsList;
                        printPrescription.tests = prescriptionElement.testsListInTable;
                        localStorage.setItem('activePrescription', JSON.stringify(printPrescription));
                        try {
                            addPrescriptionToIndexedDB(prescriptionResponse, activePatient, activeDoctor.id);
                        } catch (e) {}
                        functionalitiesAfterAddingPresc();
                        timingBtnsDefault();
                    }
                    prescriptionElement.blurScreen = false;
                    prescriptionElement.loading = false;
                }
            }, function(prescriptionError) {
                prescriptionElement.blurScreen = false;
                prescriptionElement.loading = false;
                doctorServices.noConnectivityError();
            });
            var addPatientRequest = {};
            addPatientRequest.patientId = activePatient.id;
            addPatientRequest.mobileNumber = activePatient.phoneNumber;
            var addPatientPromise = doctorServices.addPatientFromDrugController(addPatientRequest);
            addPatientPromise.then(function(addPatientSuccessResponse) {
                var errorCode = addPatientSuccessResponse.data.errorCode;
                if (errorCode) {
                    doctorServices.logoutFromThePage(errorCode);
                } else {
                    var addPatientResp = angular.fromJson(addPatientSuccessResponse.data.response);
                }
            }, function(addPatientErrorResponse) {
                doctorServices.noConnectivityError();
            });
        } else {
            doctorServices.noPatientOrNoDoctorSwal();
        }
    }

    var functionalitiesAfterAddingPresc = function() {
        prescriptionElement.testsListInTable = [];
        drugsListToSave = [];
        prescriptionElement.drugsList = [];
        activePatient = {};
        activeDoctor = {};
        prescriptionElement.patientCaseHistory = [];
        caseActive = {};
        prescriptionElement.doctorName = selectDoctor;
        prescriptionElement.fillPrescription = {};
        prescriptionElement.fillPrescription.daysOrQuantity = daysDisplay;
        prescriptionElement.fillPrescription.days = 1;
        prescriptionElement.updatePatient = false;
        prescriptionElement.addMember = false;
        prescriptionElement.phoneNumber = emptyString;
        prescriptionElement.patientsToBeDisplayedInRadios = [];
        prescriptionElement.revisitAfterDays = emptyString;
        prescriptionElement.revisitAfterDate = '';
        prescriptionElement.referToDoctor = emptyString;
    }

    var timingBtnsDefault = function() {
        prescriptionElement.Before_BreakFast = classDefault;
        prescriptionElement.After_BreakFast = classDefault;
        prescriptionElement.Before_Lunch = classDefault;
        prescriptionElement.After_Lunch = classDefault;
        prescriptionElement.Before_Dinner = classDefault;
        prescriptionElement.After_Dinner = classDefault;
    }

    angular.element("#exampleInputRevisitDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0
    });

    function appointmentsList() {
        angular.element('#appointmentsModals').modal('show');
        var doctorEventsPromise = doctorServices.getDoctorEvents(activeDoctor.id);
        doctorEventsPromise.then(function(doctorEventsSuccess) {
            var errorCode = doctorEventsSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                var doctorEventsResponse = angular.fromJson(doctorEventsSuccess.data.response);
                appointmentsArray = _.filter(doctorEventsResponse, function(entity) {
                    return entity.state == 'ACTIVE';
                });
                appointmentsListSorted = _.filter(appointmentsArray, function(entity) {
                    return entity.calendarStatus == 'APPOINTMENT';
                });
                prescriptionElement.totalAppointmentsCount = appointmentsListSorted.length;
                prescriptionElement.totalItems = appointmentsListSorted.length;
                appointmentsEntities = _.chunk(appointmentsListSorted, prescriptionElement.itemsPerPage);
                angular.copy(appointmentsEntities[0], prescriptionElement.appointmentsListToBeDisplayed);
                walkinsListSorted = _.filter(appointmentsArray, function(entity) {
                    return entity.calendarStatus == 'WALK_IN';
                });
                prescriptionElement.totalWalkinsCount = walkinsListSorted.length;
                prescriptionElement.walkinsTotalItems = walkinsListSorted.length;
                walkinEntities = _.chunk(walkinsListSorted, prescriptionElement.walkinItemsPerPage);
                angular.copy(walkinEntities[0], prescriptionElement.walkinsListToBeDisplayed);
            }
        }, function(doctorEventsError) {
            doctorServices.noConnectivityError();
        });
    }

    function pageChanged() {
        var requiredIndex = prescriptionElement.currentPage - 1;
        prescriptionElement.appointmentsListToBeDisplayed = [];
        angular.copy(appointmentsEntities[requiredIndex], prescriptionElement.appointmentsListToBeDisplayed);
    }

    function walkinsPageChanged() {
        var requiredIndex = prescriptionElement.walkinsCurrentPage - 1;
        prescriptionElement.walkinsListToBeDisplayed = [];
        angular.copy(walkinEntities[requiredIndex], prescriptionElement.walkinsListToBeDisplayed);
    }

    function selectAppointmentOrWalkin(patientEntity) {
        angular.element('#appointmentsModals').modal('hide');
        resetDrugPrescription();
        var getPatientDetailsPromise = doctorServices.getPatientDetailsOfThatNumber(patientEntity.patientId);
        getPatientDetailsPromise.then(function(getPatientSuccess) {
            var errorCode = getPatientSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                getPatientDetailsResponse = angular.fromJson(getPatientSuccess.data.response);
                activePatient = getPatientDetailsResponse[0];
                angular.copy(activePatient, currentActivePatient);
                localStorage.setItem('currentPatient', JSON.stringify(currentActivePatient));
                prescriptionElement.prescriptionData.firstName = activePatient.firstName;
                prescriptionElement.prescriptionData.drugAllergyInForm = activePatient.drugAllergy;
            }
        }, function(getPatientsError) {
            doctorServices.noConnectivityError();
        });
    }

    function addDrugTemplate(drugTemplateEntity, index) {
        var perservingId = '#perServing' + index;
        var unitsId = '#units' + index;
        drugTemplateEntity.drugDosage.perServing = angular.element(perservingId).val();
        if (drugTemplateEntity.drugDosage.daysOrQuantity == 'Days') {
            drugTemplateEntity.drugDosage.noOfDays = angular.element(unitsId).val();
        } else {
            drugTemplateEntity.drugDosage.quantity = angular.element(unitsId).val();
        }
        if (!prescriptionElement['checkbox' + index]) {
            prescriptionElement['checkbox' + index] = true;
            var templateEntity = {};
            var msrmnt = '';
            var templateEntityToSave = {};
            templateEntity.drugId = drugTemplateEntity.drugDosage.drugId;
            templateEntity.brandName = drugTemplateEntity.drugDosage.brandName;
            if (drugTemplateEntity.drugDosage.drugType !== 'SYRUP') {
                if (drugTemplateEntity.drugDosage.perServing == 1) {
                    templateEntity.perServing = singleUnit;
                } else {
                    switch (drugTemplateEntity.drugDosage.drugType.toUpperCase()) {
                        case 'SYRUP':
                            msrmnt = 'ml';
                            break;
                        default:
                            msrmnt = 'units';
                            break;
                    }
                    if (drugTemplateEntity.drugDosage.perServing !== undefined && drugTemplateEntity.drugDosage.perServing !== '' && drugTemplateEntity.drugDosage.perServing !== 1) {
                        templateEntity.perServing = drugTemplateEntity.drugDosage.perServing + ' ' + msrmnt;
                    } else {
                        templateEntity.perServing = '1 unit';
                    }
                }
            }
            if (drugTemplateEntity.drugDosage.noOfDays == 1 && drugTemplateEntity.drugDosage.daysOrQuantity == 'Days') {
                templateEntity.noOfDays = singleDay;
            } else {
                if (drugTemplateEntity.drugDosage.daysOrQuantity == 'Days') {
                    templateEntity.noOfDays = drugTemplateEntity.drugDosage.noOfDays + ' ' + drugTemplateEntity.drugDosage.daysOrQuantity;
                } else {
                    templateEntity.noOfDays = drugTemplateEntity.drugDosage.quantity + ' ' + drugTemplateEntity.drugDosage.daysOrQuantity;
                }
            }
            var usageArray = drugTemplateEntity.drugDosage.usageDirection.split(',');
            var quantCount = usageArray.length;
            if (quantCount == 0) {
                quantCount = 1;
            }
            templateEntity.usageDirection = drugTemplateEntity.drugDosage.usageDirection;
            templateEntity.remarks = drugTemplateEntity.drugDosage.remarks;
            prescriptionElement.drugsList.push(templateEntity);
            angular.copy(templateEntity, templateEntityToSave);
            templateEntityToSave.drugType = drugTemplateEntity.drugDosage.drugType;
            templateEntityToSave.perServing = drugTemplateEntity.drugDosage.perServing;
            var drugTypeFlag = _.findLastIndex(capsuleTypes, function(entity) {
                return entity == drugTemplateEntity.drugDosage.drugType;
            });
            var perServing = drugTemplateEntity.drugDosage.perServing;
            if (perServing == undefined || perServing == '') {
                perServing = parseInt(1);
            }
            templateEntityToSave.noOfDays = drugTemplateEntity.drugDosage.noOfDays;
            if (drugTypeFlag !== -1) {
                if (drugTemplateEntity.drugDosage.daysOrQuantity == 'Days') {
                    templateEntityToSave.quantity = parseInt(drugTemplateEntity.drugDosage.noOfDays) * quantCount * parseInt(perServing);
                } else {
                    templateEntityToSave.quantity = drugTemplateEntity.drugDosage.noOfDays;
                    templateEntityToSave.noOfDays = quantCount != 0 ? Math.ceil(parseInt(drugTemplateEntity.drugDosage.noOfDays) / (parseInt(perServing) * quantCount)) : 1;
                }
            } else {
                if (drugTemplateEntity.drugDosage.daysOrQuantity == 'Days') {
                    templateEntityToSave.noOfDays = drugTemplateEntity.drugDosage.noOfDays;
                    templateEntityToSave.quantity = 1;
                } else {
                    templateEntityToSave.quantity = drugTemplateEntity.drugDosage.noOfDays;
                    templateEntityToSave.noOfDays = 1;
                }
            }
            drugsListToSave.push(templateEntityToSave);
            emptyDrugElements();
            timingBtnsDefault();
        } else {
            prescriptionElement['checkbox' + index] = false;
            var requiredIndex = _.findLastIndex(prescriptionElement.drugsList, function(entity) {
                return entity.brandName == drugTemplateEntity.drugDosage.brandName;
            });
            prescriptionElement.drugsList.splice(requiredIndex, 1);
        }
    }

    function addDrugTemp() {
        if (!_.isEmpty(activePatient)) {
            angular.element('#savedDrugsModal').modal('show');
        } else {
            doctorServices.noPatientBeforeDrugTemplateSwal();
        }
    }

    function emptyDrugElements() {
        timingsArray = [];
        prescriptionElement.fillPrescription = {};
        prescriptionElement.fillPrescription.drugType = '';
        prescriptionElement.fillPrescription.daysOrQuantity = daysDisplay;
        prescriptionElement.fillPrescription.days = 1;
    }

    function bookAppointment() {
        if (!_.isEmpty(prescriptionElement.revisitAfterDate)) {
            var date = prescriptionElement.revisitAfterDate;
            date = new Date(date);
            date = date.getTime();
            var bookRequestEntity = {};
            if (!_.isEmpty(activePatient)) {
                bookRequestEntity.patientId = activePatient.id;
                bookRequestEntity.startTime = date + 36000000;
                bookRequestEntity.label = activePatient.firstName;
                var bookAppointmentPromise = doctorServices.bookAppointmentForPatient(bookRequestEntity);
                bookAppointmentPromise.then(function(bookAppointmentSuccess) {
                    var errorCode = bookAppointmentSuccess.data.errorCode;
                    if (errorCode) {
                        doctorServices.logoutFromThePage(errorCode);
                    } else {
                        bookAppointmentResponse = angular.fromJson(bookAppointmentSuccess.data.response);
                        if (errorCode == null && bookAppointmentSuccess.data.success) {
                            doctorServices.appointmentSuccessSwal();
                        } else {
                            doctorServices.appointmentBookFail();
                        }
                    }
                }, function(bookAppointmentError) {
                    doctorServices.noConnectivityError();
                });
            }
        } else {
            doctorServices.selectDateSwal();
        }
    }

    function resetDrugPrescription() {
        prescriptionElement.phoneNumber = '';
        prescriptionElement.updatePatient = false;
        prescriptionElement.addMember = false;
        prescriptionElement.PhoneNumberErrorMessage = false;
        prescriptionElement.patientsToBeDisplayedInRadios = [];
        prescriptionElement.prescriptionData = {};
        prescriptionElement.test = {};
        prescriptionElement.testsListInTable = [];
        activePatient = {};
        prescriptionElement.patientCaseHistory = [];
        caseActive = {};
        prescriptionElement.fillPrescription = {};
        prescriptionElement.fillPrescription.daysOrQuantity = 'Days';
        prescriptionElement.fillPrescription.days = 1;
        timingBtnsDefault();
        prescriptionElement.drugsList = [];
        prescriptionElement.patientPrescriptions = [];
        prescriptionElement.additionalComments = '';
        prescriptionElement.revisitAfterDays = emptyString;
        prescriptionElement.revisitAfterDate = '';
        prescriptionElement.referToDoctor = emptyString;
    }

    function selectPrescription(prescriptionActive, index) {
        if (_.has(prescriptionActive.prescription, 'weight') && !_.isEmpty(prescriptionActive.prescription.weight)) {
            prescriptionElement.prescriptionData.weight = prescriptionActive.prescription.weight;
        }
        if (_.has(prescriptionActive.prescription, 'height') && !_.isEmpty(prescriptionActive.prescription.height)) {
            prescriptionElement.prescriptionData.height = prescriptionActive.prescription.height;
        }
        if (_.has(prescriptionActive.prescription, 'bloodPressure') && !_.isEmpty(prescriptionActive.prescription.bloodPressure)) {
            prescriptionElement.prescriptionData.bloodPressure = prescriptionActive.prescription.bloodPressure;
        }
        if (_.has(prescriptionActive.prescription, 'pulse') && !_.isEmpty(prescriptionActive.prescription.pulse)) {
            prescriptionElement.prescriptionData.pulse = prescriptionActive.prescription.pulse;
        }
        if (_.has(prescriptionActive.prescription, 'bmi') && !_.isEmpty(prescriptionActive.prescription.bmi)) {
            prescriptionElement.prescriptionData.bmi = prescriptionActive.prescription.bmi;
        }
        if (_.has(prescriptionActive.prescription, 'saturation') && !_.isEmpty(prescriptionActive.prescription.saturation)) {
            prescriptionElement.prescriptionData.saturation = prescriptionActive.prescription.saturation;
        }
        if (_.has(prescriptionActive.prescription, 'revisitDate') && !_.isEmpty(prescriptionActive.prescription.revisitDate)) {
            prescriptionElement.revisitAfterDate = prescriptionActive.prescription.revisitDate;
        }
        if (_.has(prescriptionActive.prescription, 'references') && !_.isEmpty(prescriptionActive.prescription.references)) {
            prescriptionElement.referToDoctor = prescriptionActive.prescription.references;
        }
        if (_.has(prescriptionActive.prescription, 'remarks') && !_.isEmpty(prescriptionActive.prescription.remarks)) {
            prescriptionElement.additionalComments = prescriptionActive.prescription.remarks;
        }
        if (_.has(prescriptionActive.prescription, 'symptoms') && !_.isEmpty(prescriptionActive.prescription.symptoms)) {
            prescriptionElement.prescriptionData.symptoms = prescriptionActive.prescription.symptoms;
        }
        if (_.has(prescriptionActive.prescription, 'investigation') && !_.isEmpty(prescriptionActive.prescription.investigation)) {
            prescriptionElement.prescriptionData.investigation = prescriptionActive.prescription.investigation;
        }
        if (_.has(prescriptionActive.prescription, 'temperature') && !_.isEmpty(prescriptionActive.prescription.temperature)) {
            prescriptionElement.prescriptionData.temperature = prescriptionActive.prescription.temperature;
        }
        if (_.has(prescriptionActive.prescription, 'diagnosisTests') && !_.isEmpty(prescriptionActive.prescription.diagnosisTests)) {
            prescriptionElement.testsListInTable = [];
            angular.copy(prescriptionActive.prescription.diagnosisTests, prescriptionElement.testsListInTable);
        }
        if (_.has(prescriptionActive.prescription, 'drugDosage') && !_.isEmpty(prescriptionActive.prescription.drugDosage)) {
            prescriptionElement.drugsList = [];
            angular.forEach(prescriptionActive.prescription.drugDosage, function(drugEntity) {
                var localDrugObject = {};
                localDrugObject = doctorServices.getDrugList(drugEntity);
                prescriptionElement.drugsList.push(localDrugObject);
            });
        }
    }

    $timeout(function() {
        try {
            openDb();
        } catch (e) {}
    }, 3000);
};
