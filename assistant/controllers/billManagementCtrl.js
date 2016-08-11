angular.module('personalAssistant').controller('billManagementCtrl', billManagementCtrl);
billManagementCtrl.$inject = ['$scope', '$log', '$timeout', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function billManagementCtrl($scope, $log, $timeout, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "billManagement");

    var billElement = this;

    billElement.selectDoctorFromDropdown = selectDoctorFromDropdown;
    billElement.selectBillFromDropdown = selectBillFromDropdown;
    billElement.patientSearchOftheNumber = patientSearchOftheNumber;
    billElement.updateBillForm = updateBillForm;
    billElement.addConsultationOfDoctor = addConsultationOfDoctor;
    billElement.updateAmount = updateAmount;
    billElement.deleteABill = deleteABill;
    billElement.addMedicineToBill = addMedicineToBill;
    billElement.billFinalSubmisssion = billFinalSubmisssion;
    billElement.addDueDateBill = addDueDateBill;
    billElement.addTestToFinalBill = addTestToFinalBill;
    billElement.goToInvoicePage = goToInvoicePage;
    billElement.validPhoneNumber = validPhoneNumber;
    billElement.newBill = newBill;
    billElement.paidAndDueCheck = paidAndDueCheck;
    billElement.nextDueCheck = nextDueCheck;
    billElement.selectDrugInModal = selectDrugInModal;

    billElement.loading = false;
    billElement.checkbox = 'checkBoxInModal';
    billElement.blurScreen = false;
    billElement.prescriptionsArray = [];
    billElement.prescriptionOfPatient = false;
    billElement.bill = {};
    billElement.patientSearch = {};
    billElement.patient = {};
    billElement.nextDueErrorMsg = false;
    billElement.enterDigits = false;
    billElement.enterPhoneNumber = false;
    billElement.patientBillFullGrid = false;
    billElement.patientBillGridNine = true;
    billElement.patientSearchDiv = true;
    billElement.bill.viewOrHide = false;
    billElement.bill.patientSearchPatients = false;
    var fetchDoctorDetails = true;
    billElement.bill.doctorsListInBillManagement = [];
    billElement.bill.patientsListOfThatNumber = [];
    billElement.bill.billTypes = [];
    billElement.bill.billsListing = [];
    billElement.bill.doctorActiveName = "";
    billElement.bill.doctorActiveService = "No Bill Type";
    billElement.bill.paymentDueType = "Completed";
    billElement.checkPaidAndDue = false;
    billElement.invoice = {};
    billElement.add = {};

    billElement.invoice.nextPaymentAmount = "";
    billElement.invoice.amount = parseInt(0);
    billElement.add = {};
    billElement.add.testDate = "";
    billElement.addMedicine = [];
    billElement.finalBill = {};
    billElement.addPay = [];
    billElement.dueDateBill = {};
    billElement.addToBill = [];
    var consultation = "consultation";
    var currentActiveInvoice = {};
    billElement.invoice.nextPaymentDate = "";
    billElement.addMedicine.medicine = '';
    billElement.addMedicineNames = [];
    var activeTestsList = [];
    var activeTestsNamesList = [];
    billElement.finalBill.patientId = "";
    billElement.add.quantity = parseInt(1);
    var organizationId = localStorage.getItem('orgId');
    billElement.bill.nextPaymentDate = getTodayString();
    billElement.finalBill.organizationId = organizationId;
    var currentActiveAssistant = $.parseJSON(localStorage.getItem('assistantCurrentlyLoggedIn'));
    if (currentActiveAssistant == null) {
        dboticaServices.noConnectivityError();
    } else {
        billElement.finalBill.assistantId = currentActiveAssistant.id;
        currentActiveInvoice = dboticaServices.getInvoice();
        if (!jQuery.isEmptyObject(currentActiveInvoice)) {
            billElement.finalBill.patientId = currentActiveInvoice.patientId;
            billElement.finalBill.patientPhoneNumber = currentActiveInvoice.patientPhoneNumber;
            billElement.finalBill.invoiceState = currentActiveInvoice.invoiceState;
            billElement.finalBill.creationTime = currentActiveInvoice.creationTime;
            billElement.finalBill.id = currentActiveInvoice.id;
            fetchDoctorDetails = false;
            billElement.patientSearchDiv = false;
            billElement.patientBillGridNine = false;
            billElement.patientBillFullGrid = true;
            billElement.loading = true;
            billElement.blurScreen = true;
            var getDetailsOfThePatient = dboticaServices.getPatientDetailsOfThatNumber(currentActiveInvoice.patientId);
            getDetailsOfThePatient.then(function(getDetailsSuccess) {
                var errorCode = getDetailsSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var patientDetails = angular.fromJson(getDetailsSuccess.data.response);
                    billElement.patient = patientDetails[0];
                }
                billElement.loading = false;
                billElement.blurScreen = false;
            }, function(getDetailsError) {
                billElement.blurScreen = false;
                billElement.loading = false;
                dboticaServices.noConnectivityError();
            });
            billElement.bill.doctorActive = dboticaServices.getDoctorsDetailsArray(currentActiveInvoice.doctorId);
            setDoctorNameAndDoctorServices(billElement.bill.doctorActive);
            billElement.invoice.nextPaymentDate = dboticaServices.longDateToReadableDate(currentActiveInvoice.nextPaymentDate);
            billElement.invoice.nextPaymentAmount = currentActiveInvoice.nextPaymentAmount / 100;
            angular.copy(currentActiveInvoice.paymentEntries, billElement.addToBill);
            angular.forEach(billElement.addToBill, function(billEntity) {
                billEntity.amountPaid = billEntity.amountPaid / 100;
            });
            var paymentEntriesAndTotalAmount = dboticaServices.getPaymentEntriesToDisplay(currentActiveInvoice.paymentEntries);
            billElement.addPay = paymentEntriesAndTotalAmount[0];
            var itemsToBeDisplayed = [];
            var totalAmountCharged = 0;
            angular.copy(currentActiveInvoice.items, itemsToBeDisplayed);
            angular.forEach(itemsToBeDisplayed, function(itemsToBeDisplayedEntity) {
                itemsToBeDisplayedEntity.cost = itemsToBeDisplayedEntity.cost / 100;
                itemsToBeDisplayedEntity.amountCharged = itemsToBeDisplayedEntity.amountCharged / 100;
                itemsToBeDisplayedEntity.quantity = itemsToBeDisplayedEntity.count;
                totalAmountCharged += itemsToBeDisplayedEntity.amountCharged;
            });
            billElement.invoice.amount = totalAmountCharged - paymentEntriesAndTotalAmount[1];
            angular.copy(itemsToBeDisplayed, billElement.bill.billsListing);
        }
        billElement.loading = true;
        billElement.blurScreen = true;
        var medicinesPromise = dboticaServices.getItemsOfTheTable(0, 100, 'All', 'Drug', organizationId);
        $log.log('medicines promise is-----', medicinesPromise);
        medicinesPromise.then(function(successResponse) {
            var errorCode = successResponse.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var medicinesSuccessResponse = angular.fromJson(successResponse.data.response);
                $log.log('medicines success response is-------', medicinesSuccessResponse);
                billElement.addMedicine = [];
                angular.forEach(medicinesSuccessResponse.inventoryItems, function(entity) {
                    if (entity.availableStock > parseInt(0)) {
                        billElement.addMedicine.push(entity);
                    }
                });
                $log.log('set medicine is-----', billElement.addMedicine);
                dboticaServices.setMedicine(billElement.addMedicine);
                angular.forEach(billElement.addMedicine, function(medicineName) {
                    billElement.addMedicineNames.push(medicineName.itemName);
                });
                dboticaServices.setMedicineNames(billElement.addMedicineNames);
            }
            billElement.loading = false;
            billElement.blurScreen = false;
        }, function(errorResponse) {
            billElement.blurScreen = false;
            billElement.loading = false;
            dboticaServices.noConnectivityError();
        });
    }

    function goToInvoicePage() {
        $state.go('home.invoiceHistory');
    }
    billElement.loading = true;
    billElement.blurScreen = true;
    var testsPromise = dboticaServices.getTestsByAdmin();
    testsPromise.then(function(testsPromiseSuccessResponse) {
            var errorCode = testsPromiseSuccessResponse.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var testsList = angular.fromJson(testsPromiseSuccessResponse.data.response);
                angular.forEach(testsList, function(testsListEntity) {
                    if (testsListEntity.organizationId == organizationId) {
                        if (testsListEntity.state == "ACTIVE") {
                            activeTestsList.push(testsListEntity);
                            activeTestsNamesList.push(testsListEntity.diagnosisTest);
                        }
                    }
                });
                dboticaServices.setTestsFromBillManagement(activeTestsList);
                dboticaServices.setTestsNamesFromBillManagement(activeTestsNamesList);
            }
            billElement.loading = false;
            billElement.blurScreen = false;
        },
        function(testsPromiseErrorResponse) {
            billElement.blurScreen = false;
            billElement.loading = false;
            dboticaServices.noConnectivityError();
        });

    if (fetchDoctorDetails) {
        billElement.loading = true;
        billElement.blurScreen = true;
        var doctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
        doctorsOfThatAssistant.then(function(successResponse) {
            var errorCode = successResponse.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                billElement.bill.doctorsListInBillManagement = angular.fromJson(successResponse.data.response);
                dboticaServices.setDoctorsDetailsArray(billElement.bill.doctorsListInBillManagement);
                billElement.bill.doctorActive = billElement.bill.doctorsListInBillManagement[0];
                setDoctorNameAndDoctorServices(billElement.bill.doctorActive);
            }
            billElement.loading = false;
            billElement.blurScreen = false;
        }, function(errorResponse) {
            billElement.blurScreen = false;
            billElement.loading = false;
            dboticaServices.noConnectivityError();
        });
    }

    function selectDoctorFromDropdown(doctor) {
        billElement.bill.doctorActive = doctor;
        billElement.finalBill.doctorId = doctor.id;
        if (doctor.hasOwnProperty('doctorPriceInfos')) {
            for (var serviceIndex in doctor.doctorPriceInfos) {
                if (doctor.doctorPriceInfos[serviceIndex].billingName.toLowerCase() == "consultation") {
                    billElement.bill.doctorActiveService = doctor.doctorPriceInfos[serviceIndex].billingName;
                    billElement.bill.billCost = doctor.doctorPriceInfos[serviceIndex].price / 100;
                    break;
                } else {
                    billElement.bill.doctorActiveService = doctor.doctorPriceInfos[0].billingName;
                    billElement.bill.billCost = doctor.doctorPriceInfos[0].price / 100;
                }
            }
            billElement.bill.billTypes = doctor.doctorPriceInfos;

        } else {
            billElement.bill.doctorActiveService = "No Service";
            billElement.bill.billTypes = [];
        }
        billElement.bill.doctorActiveName = doctor.firstName + ' ' + doctor.lastName;
    }

    function selectBillFromDropdown(billing) {
        billElement.bill.doctorActiveService = billing.billingName;
        billElement.bill.billCost = billing.price / 100;
    }

    function patientSearchOftheNumber(phoneNumber) {
        if (phoneNumber === undefined) {
            dboticaServices.showNoPhoneNumberSwal();
        } else {
            if (!billElement.enterDigits && !billElement.enterPhoneNumber) {
                billElement.loading = true;
                var patientSearchPromise = dboticaServices.getPatientDetailsOfThatNumber(phoneNumber);
                patientSearchPromise.then(function(patientSearchSuccessResponse) {
                    var errorCode = patientSearchSuccessResponse.data.errorCode;
                    if (errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        var patientsList = angular.fromJson(patientSearchSuccessResponse.data.response);
                        if (patientsList.length > 0) {
                            $log.log('patient details are----', patientsList[0]);
                            billElement.prescriptionOfPatient = true;
                            billElement.finalBill.patientId = patientsList[0].id;
                            billElement.finalBill.patientPhoneNumber = phoneNumber;
                            billElement.bill.viewOrHide = true;
                            $scope.radio0 = true;
                            billElement.bill.patientSearchPatients = true;
                            billElement.bill.patientsListOfThatNumber = patientsList;
                            billElement.patient = patientsList[0];
                            var patientPrescriptionsPromise = dboticaServices.getPrescriptionsOfThePatient(patientsList[0].id);
                            patientPrescriptionsPromise.then(function(getPrescriptionSuccess) {
                                var patientPrescriptions = angular.fromJson(getPrescriptionSuccess.data.response);
                                if (patientPrescriptions.length > 0) {
                                    billElement.prescriptionsArray = patientPrescriptions;
                                } else {
                                    billElement.prescriptionsArray = [];
                                }
                            }, function(getPrescriptionError) {});
                        }
                    }
                    billElement.loading = false;
                }, function(patientSearchErrorResponse) {
                    billElement.loading = false;
                    dboticaServices.noConnectivityError();
                });
            } else {
                dboticaServices.validPhoneNumberSwal();
            }
        }
    }

    function updateBillForm(patient, index) {
        billElement.patient = patient;
        $scope.radio0 = false;
        $scope['radio' + index] = true;
        billElement.finalBill.patientId = patient.id;
        var patientPrescriptionPromise = dboticaServices.getPrescriptionsOfThePatient(patient.id);
        patientPrescriptionPromise.then(function(selectedRadioPatientSuccess) {
            var errorCode = selectedRadioPatientSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var prescriptionSuccess = angular.fromJson(selectedRadioPatientSuccess.data.response);
                if (prescriptionSuccess.length > 0) {
                    billElement.prescriptionsArray = prescriptionSuccess;
                } else {
                    billElement.prescriptionsArray = [];
                }
            }
        }, function(selectedPatientRadioError) {
            dboticaServices.noConnectivityError();
        });
    }

    function addConsultationOfDoctor() {
        if (billElement.finalBill.patientId == "") {
            dboticaServices.showNoPatientSwal();
        } else {
            var newService = {};
            newService.itemName = billElement.bill.doctorActiveService;
            if (billElement.bill.billCost == undefined || billElement.bill.billCost == "") {
                dboticaServices.noConsultationCostSwal();
            } else {
                newService.cost = billElement.bill.billCost;
                newService.quantity = 1;
                newService.itemType = "DOCTOR_CHARGE";
                newService.discount = 0;
                newService.tax = 0;
                newService.amountCharged = billElement.bill.billCost;
                newService.dueDate = dboticaServices.getLongValueOfDate(billElement.bill.nextPaymentDate);
                billElement.invoice.amount += parseInt(billElement.bill.billCost);
                switch (billElement.bill.paymentDueType) {
                    case 'Completed':
                        newService.paymentDueType = "COMPLETED";
                        break;
                    case 'In Future-Must':
                        newService.paymentDueType = "FUTURE_MUST";
                        break;
                    case 'In Future-Tentative':
                        newService.paymentDueType = "FUTURE_TENTITIVE";
                        break;
                }
                newService.paid = false;
                billElement.bill.billsListing.push(newService);
            }
        }
    }

    function updateAmount(billUnderEdit, index) {
        billElement.invoice.amount -= billUnderEdit.amountCharged;
        var amountOnWhichDisOrVat = billUnderEdit.cost * billUnderEdit.quantity;
        var discount = (100 - billUnderEdit.discount) / 100;
        var vat = (billUnderEdit.tax) / 100;
        billUnderEdit.amountCharged = ((amountOnWhichDisOrVat * discount) + (amountOnWhichDisOrVat * vat));
        billElement.invoice.amount += billUnderEdit.amountCharged;
    }

    function deleteABill(billToBeRemoved, index) {
        billElement.invoice.amount -= billToBeRemoved.amountCharged;
        billElement.bill.billsListing.splice(index, 1);
    }


    function addTestToFinalBill() {
        if (billElement.finalBill.patientId == "") {
            dboticaServices.showNoPatientSwal();
        } else {
            var newTestObject = {}
            var testName = angular.element('#exampleInputTests').val();
            if (testName == undefined || testName == "") {
                dboticaServices.noTestNameSwal();
            } else {
                newTestObject.itemName = testName;
                newTestObject.itemType = "TEST";
                var testCost = angular.element('#exampleInputTestsCost').val();
                if (testCost == undefined || testCost == "") {
                    dboticaServices.noTestCostSwal();
                } else {
                    newTestObject.cost = angular.element('#exampleInputTestsCost').val();
                    newTestObject.discount = 0;
                    newTestObject.tax = 0;
                    newTestObject.quantity = 1;
                    newTestObject.amountCharged = newTestObject.cost;
                    billElement.invoice.amount += parseInt(newTestObject.amountCharged);
                    newTestObject.paid = false;
                    if (billElement.add.testDate == "") {} else {
                        newTestObject.dueDate = dboticaServices.getLongValueOfDate(billElement.add.testDate);
                    }
                    billElement.bill.billsListing.push(newTestObject);
                    angular.element('#exampleInputTests').val("");
                    angular.element('#exampleInputTestsCost').val("");
                    billElement.add.testDate = "";
                }
            }
        }
    }

    function billFinalSubmisssion() {
        $log.log('in function-----');
        localStorage.setItem('billActiveToPrint', '');
        localStorage.setItem('patientNameInBillActive', '');
        localStorage.setItem('patientNumberInBillActive', '');
        if (billElement.finalBill.patientId == "") {
            dboticaServices.showNoPatientSwal();
        } else {
            billElement.finalBill.items = [];
            billElement.finalBill.paymentEntries = [];
            billElement.finalBill.totalAmount = parseInt(0);
            billElement.finalBill.amountPaid = parseInt(0);
            billElement.finalBill.patientName = dboticaServices.getPatientOrDoctorName(billElement.patient);
            billElement.finalBill.doctorName = dboticaServices.getPatientOrDoctorName(billElement.bill.doctorActive);
            if (billElement.invoice.nextPaymentDate !== undefined && billElement.invoice.nextPaymentDate !== null && billElement.invoice.nextPaymentDate !== "") {
                billElement.finalBill.nextPaymentDate = dboticaServices.getLongValueOfDate(billElement.invoice.nextPaymentDate);
            }
            billElement.finalBill.nextPaymentAmount = parseInt(billElement.invoice.nextPaymentAmount) * 100;
            angular.copy(billElement.bill.billsListing, billElement.finalBill.items);
            angular.forEach(billElement.finalBill.items, function(billItemEntity) {
                billElement.finalBill.totalAmount += parseInt(billItemEntity.amountCharged);
                if (billItemEntity.hasOwnProperty('cost')) {
                    billItemEntity.cost = parseInt(billItemEntity.cost) * 100;
                }
                if (billItemEntity.hasOwnProperty('amountCharged')) {
                    billItemEntity.amountCharged = parseInt(billItemEntity.amountCharged) * 100;
                }
            });
            billElement.finalBill.totalAmount = parseInt(billElement.finalBill.totalAmount) * 100;
            angular.copy(billElement.addToBill, billElement.finalBill.paymentEntries);
            angular.forEach(billElement.finalBill.paymentEntries, function(paymentEntryEntity) {
                if (paymentEntryEntity.hasOwnProperty('amountPaid')) {
                    billElement.finalBill.amountPaid += parseInt(paymentEntryEntity.amountPaid);
                    paymentEntryEntity.amountPaid = parseInt(paymentEntryEntity.amountPaid) * 100;
                }
            });
            billElement.finalBill.amountPaid = billElement.finalBill.amountPaid * 100;
            if (!billElement.nextDueErrorMsg) {
                billElement.loading = true;
                billElement.finalBill.modeOfPayment = 'DIRECT_PAY';
                billElement.finalBill.patientInsuranceId = '393495';
                var invoiceUpdatePromise = dboticaServices.updateInvoice(billElement.finalBill);
                $log.log('invoice promise is-------', invoiceUpdatePromise);
                invoiceUpdatePromise.then(function(invoiceUpdateSuccessResponse) {
                    var errorCode = invoiceUpdateSuccessResponse.data.errorCode;
                    if (errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        var success = invoiceUpdateSuccessResponse.data.success;
                        var invoiceSuccessResponse = invoiceUpdateSuccessResponse.data.response;
                        if (errorCode == null && success == true && invoiceSuccessResponse == null) {
                            var billActiveForPrint = angular.fromJson(invoiceUpdateSuccessResponse.config.data);
                            $log.log('bill active for print is-----', billActiveForPrint);
                            if (_.has(billActiveForPrint, 'items')) {
                                angular.forEach(billActiveForPrint.items, function(entity) {
                                    if (entity.itemType == 'MEDICINE') {
                                        var localDrugObjectIndex = _.findLastIndex(billElement.addMedicine, function(medicineEntity) {
                                            return medicineEntity.itemName == entity.itemName;
                                        });
                                        if (localDrugObjectIndex !== undefined && localDrugObjectIndex !== parseInt(-1)) {
                                            var drugItemUpdateObject = {};
                                            angular.copy(billElement.addMedicine[localDrugObjectIndex], drugItemUpdateObject);
                                            drugItemUpdateObject.billingConsumedStock += entity.quantity;
                                            $log.log('drug update object is------', drugItemUpdateObject);
                                            var drugItemCountUpdatePromise = dboticaServices.addItemIntoStock(drugItemUpdateObject);
                                            $log.log('drug update promise is-----', drugItemCountUpdatePromise);
                                            drugItemCountUpdatePromise.then(function(drugUpdateSuccess) {
                                                var errorCode = drugUpdateSuccess.data.errorCode;
                                                if (errorCode) {
                                                    dboticaServices.logoutFromThePage(errorCode);
                                                } else {
                                                    var drugItemCountResponse = angular.fromJson(drugUpdateSuccess.data.response);
                                                    $log.log('drug item count response is----', drugItemCountResponse);
                                                }
                                            }, function(drugUpdateError) {
                                                dboticaServices.noConnectivityError();
                                            });
                                        }
                                    }
                                });
                            }
                            localStorage.setItem('billActiveToPrint', JSON.stringify(billActiveForPrint));
                            localStorage.setItem('patientNameInBillActive', billElement.patient.firstName);
                            localStorage.setItem('patientNumberInBillActive', billElement.patient.phoneNumber);
                            newBill();
                        }
                    }
                    billElement.loading = false;
                }, function(invoiceUpdateErrorResponse) {
                    billElement.loading = false;
                    dboticaServices.noConnectivityError();
                });
            } else {
                dboticaServices.nextDueErrorSwal();
            }
        }
    }

    function addDueDateBill() {
        if (billElement.finalBill.patientId == "") {
            dboticaServices.showNoPatientSwal();
        } else {
            var newDueDateBill = {};
            var newDueDateToFinalBill = {};
            var dueCost = billElement.dueDateBill.dueCost;
            if (dueCost !== undefined && dueCost !== "" && !billElement.checkPaidAndDue) {
                newDueDateBill.amountPaid = billElement.dueDateBill.dueCost;
                newDueDateBill.updatedAt = billElement.dueDateBill.dueDate;
                billElement.addPay.push(newDueDateBill);
                billElement.invoice.amount -= parseInt(billElement.dueDateBill.dueCost);
                if (!jQuery.isEmptyObject(currentActiveInvoice)) {
                    if (billElement.invoice.nextPaymentAmount !== undefined && billElement.invoice.nextPaymentAmount !== "" && billElement.invoice.nextPaymentAmount !== 0) {

                        if (parseInt(billElement.dueDateBill.dueCost) <= parseInt(billElement.invoice.nextPaymentAmount)) {

                            billElement.invoice.nextPaymentAmount -= parseInt(billElement.dueDateBill.dueCost);
                        } else {
                            billElement.invoice.nextPaymentDate = "";
                            billElement.invoice.nextPaymentAmount = parseInt(0);
                        }
                    }
                }
                newDueDateToFinalBill.updatedUserId = currentActiveAssistant.id;
                newDueDateToFinalBill.amountPaid = billElement.dueDateBill.dueCost;
                newDueDateToFinalBill.state = "ACTIVE";
                if (billElement.dueDateBill.dueDate == undefined || billElement.dueDateBill.dueDate == "") {} else {
                    newDueDateToFinalBill.updatedAt = dboticaServices.getLongValueOfDate(billElement.dueDateBill.dueDate);
                }
                billElement.addToBill.push(newDueDateToFinalBill);
                if (billElement.invoice.nextPaymentAmount !== "") {
                    if (billElement.invoice.nextPaymentAmount > billElement.invoice.amount) {
                        billElement.nextDueErrorMsg = true;
                    } else {
                        billElement.nextDueErrorMsg = false;
                    }
                }
                billElement.dueDateBill.dueCost = "";
                billElement.dueDateBill.dueDate = "";
            }
        }
    }

    function setDoctorNameAndDoctorServices(doctor) {
        billElement.finalBill.doctorId = doctor.id;
        if (doctor.hasOwnProperty('doctorPriceInfos')) {
            billElement.bill.billTypes = doctor.doctorPriceInfos;
            angular.forEach(billElement.bill.billTypes, function(billTypeEntity) {
                if (billTypeEntity.billingName.toLowerCase() == consultation) {
                    billElement.bill.doctorActiveService = billTypeEntity.billingName;
                    billElement.bill.billCost = billTypeEntity.price / 100;
                }
            });
        }
        billElement.bill.doctorActiveName = doctor.firstName + ' ' + doctor.lastName;
    }

    function selectDrugInModal(drugInModal, index) {
        var drugNameSelected = drugInModal.brandName;
        var medicineToBeDisplayed = {};
        angular.forEach(billElement.addMedicine, function(medicineEntity) {
            if (drugNameSelected.toLowerCase() == medicineEntity.itemName.toLowerCase()) {
                medicineToBeDisplayed.itemName = drugNameSelected;
                if (drugInModal.quantity !== null && drugInModal.quantity !== undefined && drugInModal !== '') {
                    medicineToBeDisplayed.quantity = parseInt(drugInModal.quantity);
                } else {
                    medicineToBeDisplayed.quantity = parseInt(1);
                }
                medicineToBeDisplayed.itemType = "MEDICINE";
                medicineToBeDisplayed.cost = medicineEntity.retailPrice;
                medicineToBeDisplayed.discount = parseInt(0);
                medicineToBeDisplayed.tax = parseInt(0);
                medicineToBeDisplayed.amountCharged = parseInt(medicineToBeDisplayed.cost) * medicineToBeDisplayed.quantity;
                billElement.invoice.amount += parseInt(medicineToBeDisplayed.amountCharged);
                billElement.bill.billsListing.push(medicineToBeDisplayed);
            }
        });
    }

    function addMedicineToBill() {
        if (billElement.finalBill.patientId == "") {
            dboticaServices.showNoPatientSwal();
        } else {
            var newMedicine = {};
            medicineName = angular.element('#exampleInputMedicine').val();
            if (medicineName == undefined || medicineName == "") {
                dboticaServices.noMedicineNameSwal();
            } else {
                newMedicine.itemName = medicineName;
                if (billElement.add.quantity == undefined || billElement.add.quantity == "") {
                    newMedicine.quantity = parseInt(1);
                } else {
                    newMedicine.quantity = parseInt(billElement.add.quantity);
                }
                newMedicine.itemType = "MEDICINE";
                var medicineCost = angular.element('#exampleInputMedicineCost').val();
                if (medicineCost == undefined || medicineCost == "") {
                    dboticaServices.noMedicineCostSwal();
                } else {
                    newMedicine.cost = medicineCost;
                    newMedicine.discount = parseInt(0);
                    newMedicine.tax = parseInt(0);
                    newMedicine.amountCharged = parseInt(newMedicine.cost) * newMedicine.quantity;
                    billElement.invoice.amount += parseInt(newMedicine.amountCharged);
                    newMedicine.paid = false;
                    billElement.bill.billsListing.push(newMedicine);
                    angular.element('#exampleInputMedicine').val("");
                    angular.element('#exampleInputMedicineCost').val("");
                    billElement.add.quantity = parseInt(1);
                }
            }
        }
    }

    function validPhoneNumber(phoneNumber) {
        var numbers = /^[0-9]+$/;
        if (phoneNumber !== undefined && phoneNumber !== '') {
            if (phoneNumber.match(numbers)) {
                billElement.enterDigits = false;
                if (phoneNumber.length == 10) {
                    billElement.enterPhoneNumber = false;
                } else {
                    billElement.enterPhoneNumber = true;
                }
            } else {
                billElement.enterDigits = true;
            }
        }
    }

    function nextDueCheck(nextDueAmount) {
        if (nextDueAmount <= billElement.invoice.amount) {
            billElement.nextDueErrorMsg = false;
        } else {
            billElement.nextDueErrorMsg = true;
        }
    }

    function getTodayString() {
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        if (day < 10) day = "0" + day;
        var today = day + "/" + month + "/" + year;
        return today;
    }

    function paidAndDueCheck(amountInTextBox) {
        if (amountInTextBox <= billElement.invoice.amount) {
            billElement.checkPaidAndDue = false;
        } else {
            billElement.checkPaidAndDue = true;
        }
    }

    function newBill() {
        $state.go('home.billManagement');
        billElement.patientSearchDiv = true;
        billElement.patientBillFullGrid = false;
        billElement.patientBillGridNine = true;
        currentActiveInvoice = {};
        billElement.patient = {};
        billElement.bill.patientsListOfThatNumber = [];
        billElement.patientSearch.phoneNumber = "";
        billElement.bill.patientSearchPatients = false;
        billElement.bill.viewOrHide = false;
        billElement.add = {};
        billElement.invoice = {};
        billElement.bill.billsListing = [];
        billElement.invoice.amount = parseInt(0);
        billElement.dueDateBill = {};
        billElement.addPay = [];
        billElement.finalBill = {};
        billElement.finalBill.patientId = "";
        billElement.prescriptionOfPatient = false;
    }

    angular.element("#sessionDatepickerCost").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0
    });

    angular.element("#exampleDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0
    });

    angular.element("#exampleInputTestDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0
    });

    angular.element("#exampleInputnextDueDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0
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

    var getPatientAndOrganizationPatientPromise = dboticaServices.getPatientAndOrganizationPatient('8885552221');
    $log.log('patient details promise is-------', getPatientAndOrganizationPatientPromise);
    getPatientAndOrganizationPatientPromise.then(function(getPatientDetailsSuccess) {
        var errorCode = getPatientDetailsSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var getPatientDetailsResponse = angular.fromJson(getPatientDetailsSuccess.data.response);
            $log.log('patient details response is------', getPatientDetailsResponse);
        }
    }, function(getPatientDetailsError) {
        dboticaServices.noConnectivityError();
    });

};

angular.module('personalAssistant').filter("longDateIntoReadableDate", function() {
    return function(input) {
        var result;
        if (input == undefined) {
            result = "";
        } else {
            result = new Date(input);
            result = moment(result).format('DD/MM/YYYY,hh:mm:ss A');
            var timeArray = result.split(",");
            result = timeArray[0];
        }
        return result;
    };
});
