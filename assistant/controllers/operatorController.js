angular.module('personalAssistant').controller('operatorController', operatorController);
operatorController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function operatorController($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var operator = this;
    localStorage.setItem('currentState', 'operator');
    operator.blurScreen = false;
    operator.loading = false;
    operator.dropdownActive = false;
    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);
    var selectDoctor = '---Select Doctor---';
    operator.doctorName = '---Select Doctor---';
    var doctorObject = { 'firstName': '---Select Doctor---' };
    var hyphen = '-';
    var organizationPatientId = '';
    var classDefault = 'default';
    var classSuccess = 'success';
    var timingsArray = [];
    var emptyArray = [];
    var underscore = '_';
    var space = ' ';
    var comma = ',';
    operator.symptoms = '';
    operator.investigation = '';
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
    operator.testsListInTable = [];
    operator.testsList = [];
    operator.drugsList = [];
    operator.fillPrescription = {};
    operator.fillPrescription.daysOrQuantity = 'Days';
    operator.fillPrescription.days = 1;
    operator.fillPrescription.perServing = '';
    operator.test = {};
    operator.test.testName = '';
    operator.additionalComments = '';
    operator.doctorsListToBeDisplayed = [];
    operator.testsList = [];
    var drugObjectsShown = [];
    var activeDoctor = {};
    var activePatient = {};
    operator.patientData = {};
    var activePatientIndex;
    var selectedDrug;
    var selectedDrugId;
    var selectedDrugIndex;
    var selectedDrugType;
    var activeDrugType;
    var newPatientFlag = false;
    var updatePatientFlag = false;
    operator.PhoneNumberErrorMessage = false;
    operator.patientSearchBtnDisabled = true;
    operator.updatePatient = false;
    operator.addMember = false;
    operator.noPatientDetailsErrorMessage = false;
    operator.mandatoryFieldsErrorMessage = false;
    operator.Before_BreakFast = classDefault;
    operator.After_BreakFast = classDefault;
    operator.Before_Lunch = classDefault;
    operator.After_Lunch = classDefault;
    operator.Before_Dinner = classDefault;
    operator.After_Dinner = classDefault;
    operator.doctorSelect = doctorSelect;
    operator.referToDoctor = '';

    var date = new Date();
    var dateSorted = moment(date).format("DD/MM/YYYY,hh:mm A");
    var dateArray = dateSorted.split(comma);
    operator.revisitAfterDate = dateArray[0];
    var today = dateArray[0];

    operator.phoneNumberLengthValidation = phoneNumberLengthValidation;
    operator.patientSearchByOperator = patientSearchByOperator;
    operator.addOrUpdatePatient = addOrUpdatePatient;
    operator.addFamilyMember = addFamilyMember;
    operator.updatePatientDetails = updatePatientDetails;
    operator.selectActivePatient = selectActivePatient;
    operator.addSuccess = addSuccess;
    operator.daysIncrement = daysIncrement;
    operator.daysDecrement = daysDecrement;
    operator.addDrug = addDrug;
    operator.deleteDrug = deleteDrug;
    operator.testSearch = testSearch;
    operator.selectTestFromTheDropdown = selectTestFromTheDropdown;
    operator.addTest = addTest;
    operator.deleteTest = deleteTest;
    operator.daysChange = daysChange;
    operator.savePrescription = savePrescription;

    var doctorsListPromise = dboticaServices.doctorsOfAssistant();
    doctorsListPromise.then(function(doctorsListSuccess) {
        var errorCode = doctorsListSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            operator.doctorsListToBeDisplayed = angular.fromJson(doctorsListSuccess.data.response);
            operator.doctorsListToBeDisplayed.unshift(doctorObject);
        }
    }, function(doctorsListError) {
        dboticaServices.noConnectivityError();
    });

    var getAddressPromise = dboticaServices.getOrganizationAddress();
    getAddressPromise.then(function(getAddressSuccess) {
        var errorCode = getAddressSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            getAddressSuccessResponse = angular.fromJson(getAddressSuccess.data.response);
            localStorage.setItem('addressInTheBill', JSON.stringify(getAddressSuccessResponse));
        }
    }, function(getAddressError) {
        dboticaServices.noConnectivityError();
    });

    try {
        openDb();
    } catch (e) {
        console.log("Error in openDb");
    }

    function doctorSelect(doctorEntity) {
        activeDoctor = doctorEntity;
        operator.doctorName = doctorEntity.firstName;
    }

    function phoneNumberLengthValidation() {
        var phoneNumber = operator.phoneNumber;
        if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
            if (phoneNumber.length < 10) {
                operator.patientSearchBtnDisabled = true;
                if (phoneNumber.length == 0) {
                    operator.PhoneNumberErrorMessage = false;
                } else {
                    operator.PhoneNumberErrorMessage = true;
                }
            } else {
                if (phoneNumber.length == 10) {
                    operator.patientSearchBtnDisabled = false;
                    operator.PhoneNumberErrorMessage = false;
                } else {
                    operator.patientSearchBtnDisabled = true;
                    operator.PhoneNumberErrorMessage = true;
                }
            }
        } else {
            operator.PhoneNumberErrorMessage = false;
            operator.patientSearchBtnDisabled = true;
        }
    }

    function getOrganizationPatientId(id) {
        var organizationPatientPromise = dboticaServices.getOrganizationPatient(id);
        organizationPatientPromise.then(function(orgPatientSuccess) {
            var errorCode = orgPatientSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var orgPatientResponse = angular.fromJson(orgPatientSuccess.data.response);
                if (errorCode == null && orgPatientSuccess.data.success) {
                    if (orgPatientResponse[0].state == 'ACTIVE') {
                        organizationPatientId = orgPatientResponse[0].id;
                    }
                }
            }
        }, function(orgPatientError) {
            dboticaServices.noConnectivityError();
        });
    }

    function patientSearchByOperator() {
        var patientSearchPromise = dboticaServices.getPatientDetailsOfThatNumber(operator.phoneNumber);
        patientSearchPromise.then(function(patientSearchSuccess) {
            var errorCode = patientSearchSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                operator.patientsToBeDisplayedInRadios = angular.fromJson(patientSearchSuccess.data.response);
                if (operator.patientsToBeDisplayedInRadios.length > 0) {
                    newPatientFlag = false;
                    activePatient = operator.patientsToBeDisplayedInRadios[0];
                    getOrganizationPatientId(operator.patientsToBeDisplayedInRadios[0].id);
                    activePatientIndex = 0;
                    operator.updatePatient = true;
                    operator.addMember = true;
                    operator.radio0 = true;
                } else {
                    angular.element('#newOrUpdatePatientModal').modal('show');
                    operator.patientData = {};
                    operator.patientData.phoneNumber = operator.phoneNumber;
                    operator.updatePatient = false;
                    operator.addMember = false;
                    operator.noPatientDetailsErrorMessage = true;
                    operator.patientData.bloodGroup = 'O_POSITIVE';
                    operator.patientData.gender = 'MALE';
                    newPatientFlag = true;
                    activePatient = {};
                }
            }
        }, function(patientSearchError) {
            dboticaServices.noConnectivityError();
        });
    }

    function addOrUpdatePatient() {
        var addPatientRequestEntity = {};
        operator.noPatientDetailsErrorMessage = false;
        operator.mandatoryFieldsErrorMessage = false;
        var firstName = operator.patientData.firstName;
        var phoneNumber = operator.patientData.phoneNumber;
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
            operator.mandatoryFieldsErrorMessage = false;
            addPatientRequestEntity.firstName = firstName;
            addPatientRequestEntity.phoneNumber = phoneNumber;
            addPatientRequestEntity.gender = operator.patientData.gender;
            addPatientRequestEntity.bloodGroup = operator.patientData.bloodGroup;
            addPatientRequestEntity.drugAllergy = operator.patientData.drugAllergy;
            addPatientRequestEntity.emailId = operator.patientData.emailId;
            addPatientRequestEntity.age = operator.patientData.age;
            addPatientRequestEntity = JSON.stringify(addPatientRequestEntity);
            var addPatientPromise = dboticaServices.addNewPatient(addPatientRequestEntity);
            addPatientPromise.then(function(addpatientSuccess) {
                var errorCode = addpatientSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var addPatientResponse = angular.fromJson(addpatientSuccess.data.response);
                    if (errorCode == null && addpatientSuccess.data.success == true) {
                        angular.element('#newOrUpdatePatientModal').modal('hide');
                        dboticaServices.registerPatientSuccessSwal();
                        if (_.isEmpty(activePatient)) {
                            activePatient = addPatientResponse[0];
                            activePatientIndex = 0;
                            if (operator.patientsToBeDisplayedInRadios.length == 0) {
                                operator.patientsToBeDisplayedInRadios = addPatientResponse;
                                operator.updatePatient = true;
                                operator.addMember = true;
                                operator.radio0 = true;
                            } else {
                                operator.patientsToBeDisplayedInRadios.push(addPatientResponse[0]);
                            }
                        } else {
                            operator.patientsToBeDisplayedInRadios.splice(activePatientIndex, 1, addPatientResponse[0]);
                            operator['radio' + activePatientIndex] = true;
                        }
                    }
                }
            }, function(addpatientError) {
                dboticaServices.noConnectivityError();
            });
        } else {
            operator.mandatoryFieldsErrorMessage = true;
        }
    }

    function addFamilyMember() {
        operator.mandatoryFieldsErrorMessage = false;
        operator.noPatientDetailsErrorMessage = false;
        operator.patientData = {};
        operator.patientData.gender = 'MALE';
        operator.patientData.bloodGroup = 'O_POSITIVE';
        newPatientFlag = false;
        operator.patientData.phoneNumber = activePatient.phoneNumber;
        activePatient = {};
    }

    function updatePatientDetails() {
        operator.mandatoryFieldsErrorMessage = false;
        operator.noPatientDetailsErrorMessage = false;
        updatePatientFlag = true;
        operator.patientData = activePatient;
    }

    function selectActivePatient(patientActiveIs, index) {
        activePatient = patientActiveIs;
        activePatientIndex = index;
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
                        operator.fillPrescription.drugSearch = ui.item.value;
                    } else {
                        ui.item.value = '';
                        operator.fillPrescription.drugSearch = '';
                        operator.fillPrescription.drugType = '';
                        operator.fillPrescription.perServingUnits = '';
                        operator.fillPrescription.perServing = '';
                        operator.fillPrescription.daysOrQuantity = 'Days';
                        operator.fillPrescription.days = 1;
                        operator.fillPrescription.specialInstructions = '';
                        operator.Before_BreakFast = classDefault;
                        operator.After_BreakFast = classDefault;
                        operator.Before_Lunch = classDefault;
                        operator.After_Lunch = classDefault;
                        operator.Before_Dinner = classDefault;
                        operator.After_Dinner = classDefault;
                        operator.doctorSelect = doctorSelect;
                        dboticaServices.noActivePatientSwal();
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
                        operator.fillPrescription.drugSearch = '';
                        dboticaServices.nonAllergicDrugSwal();
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
        operator.fillPrescription.drugType = totalDrugs[drugIndex]['drugType'];
        var drugTypeOnSelect = totalDrugs[drugIndex]['drugType'];
        switch (drugTypeOnSelect.toUpperCase()) {
            case 'SYRUP':
                operator.fillPrescription.perServingUnits = "ml";
                break;
            default:
                operator.fillPrescription.perServingUnits = "units";
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
        if (operator[btnClass] == classDefault) {
            operator[btnClass] = classSuccess;
            btnClass = _.replace(btnClass, underscore, space);
            timingsArray.push(btnClass);
        } else {
            operator[btnClass] = classDefault;
            btnClass = _.replace(btnClass, underscore, space);
            var timingIndex = _.findLastIndex(timingsArray, function(entity) {
                return entity == btnClass;
            });
            timingsArray.splice(timingIndex, 1);
        }
    }

    function daysIncrement() {
        operator.fillPrescription.days = operator.fillPrescription.days + 1;
    }

    function daysDecrement() {
        if (operator.fillPrescription.days !== 1) {
            operator.fillPrescription.days = operator.fillPrescription.days - 1;
        } else {
            operator.fillPrescription.days = 1;
        }
    }

    function addDrug() {
        var drugEntity = {};
        var drugEntityToSave = {};
        drugEntity.drugId = activeDrugId;
        drugEntity.brandName = operator.fillPrescription.drugSearch;
        if (operator.fillPrescription.drugType !== 'SYRUP') {
            if (operator.fillPrescription.perServing == 1) {
                drugEntity.perServing = singleUnit;
            } else {
                if (operator.fillPrescription.perServing !== undefined && operator.fillPrescription.perServing !== '' && operator.fillPrescription.perServing !== 1) {
                    drugEntity.perServing = operator.fillPrescription.perServing + ' ' + operator.fillPrescription.perServingUnits;
                } else {
                    drugEntity.perServing = '1 unit';
                }
            }
        }
        if (operator.fillPrescription.days === 1 && operator.fillPrescription.daysOrQuantity == daysDisplay) {
            drugEntity.noOfDays = singleDay;
        } else {
            drugEntity.noOfDays = operator.fillPrescription.days + ' ' + operator.fillPrescription.daysOrQuantity;
        }
        var quantCount = timingsArray.length;
        if (quantCount == 0) {
            quantCount = 1;
        }
        drugEntity.usageDirection = _.join(timingsArray, comma);
        drugEntity.remarks = operator.fillPrescription.specialInstructions;
        operator.drugsList.push(drugEntity);
        angular.copy(drugEntity, drugEntityToSave);
        drugEntityToSave.drugType = activeDrugType;
        drugEntityToSave.perServing = operator.fillPrescription.perServing;
        var drugTypeFlag = _.findLastIndex(capsuleTypes, function(entity) {
            return entity == activeDrugType;
        });
        var perServing = operator.fillPrescription.perServing;
        if (perServing == undefined || perServing == '') {
            perServing = parseInt(1);
        }
        drugEntityToSave.noOfDays = operator.fillPrescription.days;
        if (drugTypeFlag !== -1) {
            if (operator.fillPrescription.daysOrQuantity == daysDisplay) {
                drugEntityToSave.quantity = parseInt(operator.fillPrescription.days) * quantCount * parseInt(perServing);
            } else {
                drugEntityToSave.quantity = operator.fillPrescription.days;
                drugEntityToSave.noOfDays = quantCount != 0 ? Math.ceil(parseInt(operator.fillPrescription.days) / (parseInt(perServing) * quantCount)) : 1;
            }
        } else {
            if (operator.fillPrescription.daysOrQuantity == daysDisplay) {
                drugEntityToSave.noOfDays = operator.fillPrescription.days;
                drugEntityToSave.quantity = 1;
            } else {
                drugEntityToSave.quantity = operator.fillPrescription.days;
                drugEntityToSave.noOfDays = 1;
            }
        }
        drugsListToSave.push(drugEntityToSave);
        operator.fillPrescription = {};
        operator.fillPrescription.drugType = '';
        operator.fillPrescription.daysOrQuantity = daysDisplay;
        operator.fillPrescription.days = 1;
        timingBtnsDefault();
        timingsArray = [];
    }

    function deleteDrug(drugIndex) {
        operator.drugsList.splice(drugIndex, 1);
    }

    function testSearch() {
        var testOnSearch = operator.test.testName;
        if (testOnSearch.length > 0) {
            var testsPromise = dboticaServices.getTests(testOnSearch);
            testsPromise.then(function(getTestsSuccess) {
                var errorCode = getTestsSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    operator.testsList = angular.fromJson(getTestsSuccess.data.response);
                    if (operator.testsList.length > 0) {
                        angular.element('#testsDropDown').css('display', 'block');
                        operator.dropdownActive = true;
                    } else {
                        operator.dropdownActive = false;
                    }
                }
            }, function(getTestsError) {
                dboticaServices.noConnectivityError();
            });
        } else {
            operator.dropdownActive = false;
        }
    }

    function selectTestFromTheDropdown(selectedTest) {
        activeTestId = '';
        operator.dropdownActive = false;
        activeTestId = selectedTest.id;
        operator.test.testName = selectedTest.diagnosisTest;
    }

    function addTest() {
        var testEntity = {};
        testEntity.testId = activeTestId;
        testEntity.testName = operator.test.testName;
        testEntity.remark = operator.test.remarks;
        operator.testsListInTable.push(testEntity);
        operator.test.testName = '';
        operator.test.remarks = '';
    }

    function deleteTest(testIndex) {
        operator.testsListInTable.splice(testIndex, 1);
    }

    function daysChange() {
        if (!isNaN(operator.revisitAfterDays)) {
            operator.revisitAfterDate = dboticaServices.daysToDate(operator.revisitAfterDays);
        }
    }

    function savePrescription() {
        $log.log('active doctor is------', activeDoctor);
        $log.log('active patient is------', activePatient);
        if (!_.isEmpty(activeDoctor) && !_.isEmpty(activePatient)) {
            var prescriptionRequest = {};
            prescriptionRequest.patientId = activePatient.id;
            prescriptionRequest.doctorId = activeDoctor.id;
            prescriptionRequest.height = emptyString;
            prescriptionRequest.weight = emptyString;
            prescriptionRequest.bloodPressure = emptyString;
            prescriptionRequest.temperature = emptyString;
            prescriptionRequest.bmi = emptyString;
            prescriptionRequest.saturation = emptyString;
            prescriptionRequest.pulse = emptyString;
            prescriptionRequest.investigation = operator.investigation;
            prescriptionRequest.references = operator.referToDoctor;
            prescriptionRequest.revisitDate = operator.revisitAfterDate;
            prescriptionRequest.symptoms = operator.symptoms;
            prescriptionRequest.remarks = operator.additionalComments;
            prescriptionRequest.age = activePatient.age;
            prescriptionRequest.gender = activePatient.gender;
            prescriptionRequest.drugDosage = drugsListToSave;
            prescriptionRequest.diagnosisTests = operator.testsListInTable;
            prescriptionRequest.organizationPatientId = organizationPatientId;
            $log.log('presc req is---', prescriptionRequest);
            var prescriptionPromise = dboticaServices.addPrescription(prescriptionRequest);
            $log.log('prescription promise is----', prescriptionPromise);
            prescriptionPromise.then(function(prescriptionSuccess) {
                var errorCode = prescriptionSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var prescriptionResponse = angular.fromJson(prescriptionSuccess.data.response);
                    if (errorCode == null && prescriptionSuccess.data.success == true) {
                        dboticaServices.addPrescriptionSuccessSwal();
                        printPrescription.patient = activePatient;
                        printPrescription.doctor = activeDoctor;
                        printPrescription.referDetails = prescriptionResponse;
                        printPrescription.prescription = operator.drugsList;
                        printPrescription.tests = operator.testsListInTable;
                        localStorage.setItem('activePrescription', JSON.stringify(printPrescription));
                        functionalitiesAfterAddingPresc();
                        timingBtnsDefault();
                    }
                }
            }, function(prescriptionError) {
                dboticaServices.noConnectivityError();
            });
        } else {
            dboticaServices.noPatientOrNoDoctorSwal();
        }
    }

    var functionalitiesAfterAddingPresc = function() {
        operator.testsListInTable = [];
        drugsListToSave = [];
        operator.drugsList = [];
        activePatient = {};
        activeDoctor = {};
        operator.symptoms = '';
        operator.investigation = '';
        operator.doctorName = selectDoctor;
        operator.fillPrescription = {};
        operator.fillPrescription.daysOrQuantity = daysDisplay;
        operator.fillPrescription.days = 1;
        operator.updatePatient = false;
        operator.addMember = false;
        operator.phoneNumber = emptyString;
        operator.patientsToBeDisplayedInRadios = [];
        operator.revisitAfterDays = emptyString;
        operator.revisitAfterDate = today;
        operator.referToDoctor = emptyString;
    }

    var timingBtnsDefault = function() {
        operator.Before_BreakFast = classDefault;
        operator.After_BreakFast = classDefault;
        operator.Before_Lunch = classDefault;
        operator.After_Lunch = classDefault;
        operator.Before_Dinner = classDefault;
        operator.After_Dinner = classDefault;
    }

    angular.element("#exampleInputRevisitDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0
    });

    $(document).on('click', function(e) {
        if ($(e.target).closest("#testSearchBox").length === 0) {
            $("#testsDropDown").hide();
            operator.dropdownActive = false;
        }
    });

    angular.element(window).resize(function() {
        $(".ui-autocomplete").css('display', 'none');
        $('#testsDropDown').css('display', 'none');
    });
};
