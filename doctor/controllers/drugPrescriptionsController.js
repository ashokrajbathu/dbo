angular.module('doctor').controller('drugPrescriptionsController', drugPrescriptionsController);
drugPrescriptionsController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function drugPrescriptionsController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'drugPrescriptions');

    var prescriptionElement = this;
    prescriptionElement.blurScreen = false;
    prescriptionElement.loading = false;
    prescriptionElement.dropdownActive = false;
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
    prescriptionElement.patientData = {};
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
    prescriptionElement.revisitAfterDate = dateArray[0];
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

    try {
        openDb();
    } catch (e) {
        console.log("Error in openDb");
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
        var patientSearchPromise = doctorServices.getPatientDetailsOfThatNumber(prescriptionElement.phoneNumber);
        patientSearchPromise.then(function(patientSearchSuccess) {
            var errorCode = patientSearchSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                prescriptionElement.patientsToBeDisplayedInRadios = angular.fromJson(patientSearchSuccess.data.response);
                if (prescriptionElement.patientsToBeDisplayedInRadios.length > 0) {
                    newPatientFlag = false;
                    activePatient = prescriptionElement.patientsToBeDisplayedInRadios[0];
                    prescriptionElement.prescriptionData.firstName = prescriptionElement.patientsToBeDisplayedInRadios[0].firstName;
                    prescriptionElement.prescriptionData.drugAllergyInForm = prescriptionElement.patientsToBeDisplayedInRadios[0].drugAllergy;
                    activePatientIndex = 0;
                    prescriptionElement.updatePatient = true;
                    prescriptionElement.addMember = true;
                    prescriptionElement.radio0 = true;
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

    function addOrUpdatePatient() {
        var addPatientRequestEntity = {};
        prescriptionElement.noPatientDetailsErrorMessage = false;
        prescriptionElement.mandatoryFieldsErrorMessage = false;
        var firstName = prescriptionElement.patientData.firstName;
        var phoneNumber = prescriptionElement.patientData.phoneNumber;
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
                        angular.element('#newOrUpdatePatientModal').modal('hide');
                        doctorServices.registerPatientSuccessSwal();
                        if (_.isEmpty(activePatient)) {
                            if (prescriptionElement.patientsToBeDisplayedInRadios.length == 0) {
                                prescriptionElement.patientsToBeDisplayedInRadios = addPatientResponse;
                                activePatient = addPatientResponse[0];
                                activePatientIndex = 0;
                                prescriptionElement.updatePatient = true;
                                prescriptionElement.addMember = true;
                                prescriptionElement.radio0 = true;
                            } else {
                                prescriptionElement.patientsToBeDisplayedInRadios.push(addPatientResponse[0]);
                            }
                        } else {
                            prescriptionElement.patientsToBeDisplayedInRadios.splice(activePatientIndex, 1, addPatientResponse[0]);
                            prescriptionElement['radio' + activePatientIndex] = true;
                        }
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
        activePatientIndex = index;
        prescriptionElement.prescriptionData.firstName = patientActiveIs.firstName;
        prescriptionElement.prescriptionData.drugAllergyInForm = patientActiveIs.drugAllergy;
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
        drugEntity.remarks = prescriptionElement.fillPrescription.specialInstructions;
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
        prescriptionElement.fillPrescription = {};
        prescriptionElement.fillPrescription.drugType = '';
        prescriptionElement.fillPrescription.daysOrQuantity = daysDisplay;
        prescriptionElement.fillPrescription.days = 1;
        timingBtnsDefault();
        timingsArray = [];
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
                        prescriptionElement.dropdownActive = true;
                    } else {
                        prescriptionElement.dropdownActive = false;
                    }
                }
            }, function(getTestsError) {
                doctorServices.noConnectivityError();
            });
        } else {
            prescriptionElement.dropdownActive = false;
        }
    }

    function selectTestFromTheDropdown(selectedTest) {
        activeTestId = '';
        prescriptionElement.dropdownActive = false;
        activeTestId = selectedTest.id;
        prescriptionElement.test.testName = selectedTest.testName;
    }

    function addTest() {
        var testEntity = {};
        testEntity.testId = activeTestId;
        testEntity.testName = prescriptionElement.test.testName;
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
        if (!_.isEmpty(activeDoctor) && !_.isEmpty(activePatient)) {
            var prescriptionRequest = {};
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
            $log.log('presc req is---', prescriptionRequest);
            var prescriptionPromise = doctorServices.addPrescription(prescriptionRequest);
            prescriptionPromise.then(function(prescriptionSuccess) {
                $log.log('prescription promise is----', prescriptionPromise);
                var errorCode = prescriptionSuccess.data.errorCode;
                if (errorCode) {
                    doctorServices.logoutFromThePage(errorCode);
                } else {
                    var prescriptionResponse = angular.fromJson(prescriptionSuccess.data.response);
                    if (errorCode == null && prescriptionSuccess.data.success == true) {
                        doctorServices.addPrescriptionSuccessSwal();
                        prescriptionObject.prescriptionToPrint = prescriptionResponse;
                        prescriptionObject.drugListToDisplay = prescriptionElement.drugsList;
                        prescriptionObject.testsListToDisplay = prescriptionElement.testsListInTable;
                        localStorage.setItem('prescriptionObjectToPrint', JSON.stringify(prescriptionObject));
                        $state.go('doctorHome.prescriptionReport');
                        printPrescription.patient = activePatient;
                        printPrescription.doctor = activeDoctor;
                        printPrescription.referDetails = prescriptionResponse;
                        printPrescription.prescription = prescriptionElement.drugsList;
                        printPrescription.tests = prescriptionElement.testsListInTable;
                        localStorage.setItem('activePrescription', JSON.stringify(printPrescription));
                        functionalitiesAfterAddingPresc();
                        timingBtnsDefault();
                    }
                }
            }, function(prescriptionError) {
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
        prescriptionElement.doctorName = selectDoctor;
        prescriptionElement.fillPrescription = {};
        prescriptionElement.fillPrescription.daysOrQuantity = daysDisplay;
        prescriptionElement.fillPrescription.days = 1;
        prescriptionElement.updatePatient = false;
        prescriptionElement.addMember = false;
        prescriptionElement.phoneNumber = emptyString;
        prescriptionElement.patientsToBeDisplayedInRadios = [];
        prescriptionElement.revisitAfterDays = emptyString;
        prescriptionElement.revisitAfterDate = today;
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
};
