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
    operator.doctorName = '---Select Doctor---';
    var doctorObject = { 'firstName': '---Select Doctor---' };
    var hyphen = '-';
    var classDefault = 'default';
    var classSuccess = 'success';
    var timingsArray = [];
    var underscore = '_';
    var space = ' ';
    var comma = ',';
    var singleDay = 1 + ' Day';
    var singleUnit = 1 + ' unit';
    var totalDrugs = [];
    var daysDisplay = 'Days';
    var activeDrugId;
    operator.testsListInTable = [];
    operator.testsList = [];
    operator.drugsList = [];
    operator.fillPrescription = {};
    operator.fillPrescription.daysOrQuantity = 'Days';
    operator.fillPrescription.days = 1;
    operator.test = {};
    operator.test.testName = '';
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
                    activePatientIndex = 0;
                    operator.updatePatient = true;
                    operator.addMember = true;
                    operator.radio0 = true;
                } else {
                    angular.element('#newOrUpdatePatientModal').modal('show');
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
                            if (operator.patientsToBeDisplayedInRadios.length == 0) {
                                operator.patientsToBeDisplayedInRadios = addPatientResponse;
                                activePatient = addPatientResponse[0];
                                activePatientIndex = 0;
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
        drugEntity.drugSearch = operator.fillPrescription.drugSearch;
        if (operator.fillPrescription.drugType !== 'SYRUP') {
            if (operator.fillPrescription.perServing == 1) {
                drugEntity.perServing = singleUnit;
            } else {
                drugEntity.perServing = operator.fillPrescription.perServing + ' ' + operator.fillPrescription.perServingUnits;
            }
        }
        if (operator.fillPrescription.days === 1 && operator.fillPrescription.daysOrQuantity === daysDisplay) {
            drugEntity.amount = singleDay;
        } else {
            drugEntity.amount = operator.fillPrescription.days + ' ' + operator.fillPrescription.daysOrQuantity;
        }
        drugEntity.timings = _.join(timingsArray, comma);
        drugEntity.remarks = operator.fillPrescription.specialInstructions;
        operator.drugsList.push(drugEntity);
        operator.fillPrescription = {};
        operator.fillPrescription.drugType = '';
        operator.fillPrescription.daysOrQuantity = daysDisplay;
        operator.fillPrescription.days = 1;
        operator.Before_BreakFast = classDefault;
        operator.After_BreakFast = classDefault;
        operator.Before_Lunch = classDefault;
        operator.After_Lunch = classDefault;
        operator.Before_Dinner = classDefault;
        operator.After_Dinner = classDefault;
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
        $log.log('selected test is--', selectedTest);
        operator.dropdownActive = false;
        operator.test.testName = selectedTest.testName;
    }

    function addTest() {
        var testEntity = {};
        testEntity.testName = operator.test.testName;
        testEntity.remarks = operator.test.remarks;
        operator.testsListInTable.push(testEntity);
        operator.test.testName = '';
        operator.test.remarks = '';
    }

    function deleteTest(testIndex) {
        operator.testsListInTable.splice(testIndex, 1);
    }
};
