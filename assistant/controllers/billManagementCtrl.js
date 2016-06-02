angular.module('personalAssistant').controller('billManagementCtrl', ['$scope', '$log', '$timeout', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, $timeout, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
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

    billElement.bill = {};

    billElement.patientSearch = {};
    billElement.patient = {};
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
    billElement.invoice = {};
    billElement.invoice.nextPaymentAmount = "";
    billElement.invoice.amount = 0;
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

    var organizationId = localStorage.getItem('orgId');
    billElement.bill.nextPaymentDate = getTodayString();
    billElement.finalBill.organizationId = organizationId;
    var currentActiveAssistant = $.parseJSON(localStorage.getItem('assistantCurrentlyLoggedIn'));
    billElement.finalBill.assistantId = currentActiveAssistant.id;

    currentActiveInvoice = dboticaServices.getInvoice();
    if (!jQuery.isEmptyObject(currentActiveInvoice)) {
        billElement.finalBill.patientId = currentActiveInvoice.patientId;
        billElement.finalBill.patientPhoneNumber = currentActiveInvoice.patientPhoneNumber;
        billElement.finalBill.state = currentActiveInvoice.state;
        billElement.finalBill.creationTime = currentActiveInvoice.creationTime;
        billElement.finalBill.id = currentActiveInvoice.id;
        fetchDoctorDetails = false;
        billElement.patientSearchDiv = false;
        billElement.patientBillGridNine = false;
        billElement.patientBillFullGrid = true;
        var getDetailsOfThePatient = dboticaServices.getPatientDetailsOfThatNumber(currentActiveInvoice.patientId);
        getDetailsOfThePatient.then(function(getDetailsSuccess) {
            var errorCode = getDetailsSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage();
            } else {
                var patientDetails = $.parseJSON(getDetailsSuccess.data.response);
                billElement.patient = patientDetails[0];
            }
        }, function(getDetailsError) {});
        billElement.bill.doctorActive = dboticaServices.getDoctorsDetailsArray(currentActiveInvoice.doctorId);
        setDoctorNameAndDoctorServices(billElement.bill.doctorActive);
        billElement.invoice.nextPaymentDate = dboticaServices.longDateToReadableDate(currentActiveInvoice.nextPaymentDate);
        billElement.invoice.nextPaymentAmount = currentActiveInvoice.nextPaymentAmount / 100;
        angular.copy(currentActiveInvoice.paymentEntries, billElement.addToBill);
        for (var paymentIndex in billElement.addToBill) {
            billElement.addToBill[paymentIndex].amountPaid = billElement.addToBill[paymentIndex].amountPaid / 100;
        }
        var paymentEntriesAndTotalAmount = dboticaServices.getPaymentEntriesToDisplay(currentActiveInvoice.paymentEntries);
        billElement.addPay = paymentEntriesAndTotalAmount[0];
        $log.log("bills in modal are---", billElement.addPay);
        var itemsToBeDisplayed = [];
        var totalAmountCharged = 0;
        angular.copy(currentActiveInvoice.items, itemsToBeDisplayed);
        for (itemIndex in itemsToBeDisplayed) {
            itemsToBeDisplayed[itemIndex].cost = itemsToBeDisplayed[itemIndex].cost / 100;
            itemsToBeDisplayed[itemIndex].amountCharged = itemsToBeDisplayed[itemIndex].amountCharged / 100;
            itemsToBeDisplayed[itemIndex].quantity = itemsToBeDisplayed[itemIndex].count;
            totalAmountCharged += itemsToBeDisplayed[itemIndex].amountCharged;
        }
        $log.log('total amount charged is---' + totalAmountCharged);
        billElement.invoice.amount = totalAmountCharged - paymentEntriesAndTotalAmount[1];
        angular.copy(itemsToBeDisplayed, billElement.bill.billsListing);
    }
    $log.log("listing bills is----", billElement.bill.billsListing);
    $log.log("current active invoice is----", currentActiveInvoice);
    var medicinesPromise = dboticaServices.getItemsOfTheTable(0, 100, 'All', 'Drug', organizationId);
    medicinesPromise.then(function(successResponse) {
        var errorCode = successResponse.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var medicinesSuccessResponse = $.parseJSON(successResponse.data.response);
            billElement.addMedicine = medicinesSuccessResponse.inventoryItems;
            dboticaServices.setMedicine(billElement.addMedicine);
            for (var medicineIndex in billElement.addMedicine) {
                billElement.addMedicineNames.push(billElement.addMedicine[medicineIndex].itemName);
            }
            dboticaServices.setMedicineNames(billElement.addMedicineNames);
        }
    }, function(errorResponse) {

    });

    function goToInvoicePage() {
        $state.go('home.invoiceHistory');
    }

    var testsPromise = dboticaServices.getTests();

    testsPromise.then(function(testsPromiseSuccessResponse) {
        var testsList = $.parseJSON(testsPromiseSuccessResponse.data.response);
        for (var testIndex in testsList) {
            if (testsList[testIndex].organizationId == organizationId) {
                if (testsList[testIndex].state == "ACTIVE") {
                    activeTestsList.push(testsList[testIndex]);
                    activeTestsNamesList.push(testsList[testIndex].testName);
                }
            }
        }
        dboticaServices.setTestsFromBillManagement(activeTestsList);
        dboticaServices.setTestsNamesFromBillManagement(activeTestsNamesList);
    }, function(testsPromiseErrorResponse) {
        $log.log("in error response of getting tests list----");
    });

    if (fetchDoctorDetails) {
        var doctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
        doctorsOfThatAssistant.then(function(successResponse) {
            $log.log("bill response is----", successResponse);
            var errorCode = successResponse.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                billElement.bill.doctorsListInBillManagement = $.parseJSON(successResponse.data.response);
                dboticaServices.setDoctorsDetailsArray(billElement.bill.doctorsListInBillManagement);
                $log.log("ele---", billElement.bill.doctorsListInBillManagement);
                billElement.bill.doctorActive = billElement.bill.doctorsListInBillManagement[0];
                setDoctorNameAndDoctorServices(billElement.bill.doctorActive);
            }
        }, function(errorResponse) {
            $log.log("in error response of getting doctors");
        });
    }

    function selectDoctorFromDropdown(doctor) {
        billElement.bill.doctorActive = doctor;
        billElement.finalBill.doctorId = doctor.id;
        if (doctor.hasOwnProperty('doctorPriceInfos')) {
            billElement.bill.doctorActiveService = doctor.doctorPriceInfos[0].billingName;
            billElement.bill.billTypes = doctor.doctorPriceInfos;
            billElement.bill.billCost = doctor.doctorPriceInfos[0].price / 100;
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
            showNoPhoneNumberSwal();
        } else {
            if (!billElement.enterDigits && !billElement.enterPhoneNumber) {
                var patientSearchPromise = dboticaServices.getPatientDetailsOfThatNumber(phoneNumber);
                patientSearchPromise.then(function(patientSearchSuccessResponse) {
                    var errorCode = patientSearchSuccessResponse.data.errorCode;
                    if (!!errorCode) {
                        dboticaServices.logoutFromThePage(errorCode);
                    } else {
                        var patientsList = $.parseJSON(patientSearchSuccessResponse.data.response);
                        if (patientsList.length > 0) {
                            $log.log("patientsList is----", patientsList);
                            billElement.finalBill.patientId = patientsList[0].id;
                            billElement.finalBill.patientPhoneNumber = phoneNumber;
                            billElement.bill.viewOrHide = true;
                            $scope.radio0 = true;
                            billElement.bill.patientSearchPatients = true;
                            billElement.bill.patientsListOfThatNumber = patientsList;
                            billElement.patient = patientsList[0];
                        }
                    }
                }, function(patientSearchErrorResponse) {});
            } else {
                validPhoneNumberSwal();
            }
        }
    }

    function updateBillForm(patient, index) {
        billElement.patient = patient;
        $scope.radio0 = false;
        $scope['radio' + index] = true;
        billElement.finalBill.patientId = patient.id;
    }

    function addConsultationOfDoctor() {
        if (billElement.finalBill.patientId == "") {
            showNoPatientSwal();
        } else {
            var newService = {};
            newService.itemName = billElement.bill.doctorActiveService;
            newService.cost = billElement.bill.billCost;
            newService.quantity = 1;
            newService.itemType = "DOCTOR_CHARGE";
            newService.discount = 0;
            newService.tax = 0;
            newService.amountCharged = billElement.bill.billCost;
            newService.dueDate = dboticaServices.getLongValueOfDate(billElement.bill.nextPaymentDate);
            billElement.invoice.amount += billElement.bill.billCost;
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

    function addMedicineToBill() {
        if (billElement.finalBill.patientId == "") {
            showNoPatientSwal();
        } else {
            var newMedicine = {};
            newMedicine.itemName = angular.element('#exampleInputMedicine').val();
            if (billElement.add.quantity == "") {
                newMedicine.quantity = 1;
            } else {
                newMedicine.quantity = billElement.add.quantity;
            }
            newMedicine.itemType = "MEDICINE";
            newMedicine.cost = angular.element('#exampleInputMedicineCost').val();
            newMedicine.discount = 0;
            newMedicine.tax = 0;
            newMedicine.amountCharged = newMedicine.cost * newMedicine.quantity;
            billElement.invoice.amount += newMedicine.amountCharged;
            newMedicine.paid = false;
            billElement.bill.billsListing.push(newMedicine);
            angular.element('#exampleInputMedicine').val("");
            angular.element('#exampleInputMedicineCost').val("");
            billElement.add.quantity = "";
        }
    }

    function addTestToFinalBill() {
        if (billElement.finalBill.patientId == "") {
            showNoPatientSwal();
        } else {
            var newTestObject = {}
            newTestObject.itemName = angular.element('#exampleInputTests').val();
            newTestObject.itemType = "TEST";
            newTestObject.cost = angular.element('#exampleInputTestsCost').val();
            newTestObject.discount = 0;
            newTestObject.tax = 0;
            newTestObject.quantity = 1;
            newTestObject.amountCharged = newTestObject.cost;
            billElement.invoice.amount += parseInt(newTestObject.amountCharged);
            newTestObject.paid = false;
            if (billElement.add.testDate == "") {
                $log.log("in empty date");
            } else {
                newTestObject.dueDate = dboticaServices.getLongValueOfDate(billElement.add.testDate);
            }
            billElement.bill.billsListing.push(newTestObject);
            angular.element('#exampleInputTests').val("");
            angular.element('#exampleInputTestsCost').val("");
            billElement.add.testDate = "";
        }
    }

    function billFinalSubmisssion() {
        if (billElement.finalBill.patientId == "") {
            showNoPatientSwal();
        } else {
            billElement.finalBill.items = [];
            billElement.finalBill.paymentEntries = [];
            billElement.finalBill.totalAmount = 0;
            billElement.finalBill.amountPaid = 0;
            if (billElement.invoice.nextPaymentDate !== "") {
                billElement.finalBill.nextPaymentDate = dboticaServices.getLongValueOfDate(billElement.invoice.nextPaymentDate);
            }
            billElement.finalBill.nextPaymentAmount = billElement.invoice.nextPaymentAmount * 100;
            angular.copy(billElement.bill.billsListing, billElement.finalBill.items);
            for (var itemsIndex in billElement.finalBill.items) {
                billElement.finalBill.totalAmount += billElement.finalBill.items[itemsIndex].amountCharged;
                if (billElement.finalBill.items[itemsIndex].hasOwnProperty('cost')) {
                    billElement.finalBill.items[itemsIndex].cost = billElement.finalBill.items[itemsIndex].cost * 100;
                }
                if (billElement.finalBill.items[itemsIndex].hasOwnProperty('amountCharged')) {
                    billElement.finalBill.items[itemsIndex].amountCharged = billElement.finalBill.items[itemsIndex].amountCharged * 100;
                }
            }
            billElement.finalBill.totalAmount = billElement.finalBill.totalAmount * 100;
            angular.copy(billElement.addToBill, billElement.finalBill.paymentEntries);
            for (var billIndex in billElement.finalBill.paymentEntries) {
                if (billElement.finalBill.paymentEntries[billIndex].hasOwnProperty('amountPaid')) {
                    billElement.finalBill.amountPaid += billElement.finalBill.paymentEntries[billIndex].amountPaid;
                    billElement.finalBill.paymentEntries[billIndex].amountPaid = billElement.finalBill.paymentEntries[billIndex].amountPaid * 100;
                }
            }
            billElement.finalBill.amountPaid = billElement.finalBill.amountPaid * 100;
            $log.log("final bill is----", billElement.finalBill);
            var invoiceUpdatePromise = dboticaServices.updateInvoice(billElement.finalBill);
            invoiceUpdatePromise.then(function(invoiceUpdateSuccessResponse) {
                var errorCode = invoiceUpdateSuccessResponse.data.errorCode;
                var success = invoiceUpdateSuccessResponse.data.success;
                var invoiceSuccessResponse = invoiceUpdateSuccessResponse.data.response;
                if (errorCode == null && success == true && invoiceSuccessResponse == null) {
                    billElement.bill.billsListing = [];
                    billElement.addToBill = [];
                    billElement.invoice.nextPaymentDate = "";
                    billElement.invoice.nextPaymentAmount = "";
                    billElement.invoice.amount = 0;
                    billElement.patient = {};
                    currentActiveInvoice = {};
                }
                $log.log("success response is---", invoiceUpdateSuccessResponse);
            }, function(invoiceUpdateErrorResponse) {});
        }
    }

    function addDueDateBill() {
        if (billElement.finalBill.patientId == "") {
            showNoPatientSwal();
        } else {
            var newDueDateBill = {};
            var newDueDateToFinalBill = {};
            newDueDateBill.amountPaid = billElement.dueDateBill.dueCost;
            newDueDateBill.updatedAt = billElement.dueDateBill.dueDate;
            billElement.addPay.push(newDueDateBill);
            billElement.invoice.amount -= billElement.dueDateBill.dueCost;
            newDueDateToFinalBill.updatedUserId = currentActiveAssistant.id;
            newDueDateToFinalBill.amountPaid = billElement.dueDateBill.dueCost;
            newDueDateToFinalBill.state = "ACTIVE";
            newDueDateToFinalBill.updatedAt = dboticaServices.getLongValueOfDate(billElement.dueDateBill.dueDate);
            billElement.addToBill.push(newDueDateToFinalBill);
            billElement.dueDateBill.dueCost = "";
            billElement.dueDateBill.dueDate = "";
        }
    }

    function setDoctorNameAndDoctorServices(doctor) {
        billElement.finalBill.doctorId = doctor.id;
        if (doctor.hasOwnProperty('doctorPriceInfos')) {
            billElement.bill.billTypes = doctor.doctorPriceInfos;
            for (var billTypeIndex in billElement.bill.billTypes) {
                if (billElement.bill.billTypes[billTypeIndex].billingName.toLowerCase() == consultation) {
                    billElement.bill.doctorActiveService = billElement.bill.billTypes[billTypeIndex].billingName;
                    billElement.bill.billCost = billElement.bill.billTypes[billTypeIndex].price / 100;
                }
            }

        }
        billElement.bill.doctorActiveName = doctor.firstName + ' ' + doctor.lastName;
    }

    function validPhoneNumber(phoneNumber) {
        var numbers = /^[0-9]+$/;
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

    function getTodayString() {
        var date = new Date();

        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        if (month < 10) month = "0" + month;
        if (day < 10) day = "0" + day;

        var today = day + "/" + month + "/" + year;

        return today;
    }

    function showNoPatientSwal() {
        swal({
            title: "Error",
            text: "Enter Patient Details Before Billing",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function showNoPhoneNumberSwal() {
        swal({
            title: "Error",
            text: "Please Enter Phone Number Before Search",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
    }

    function validPhoneNumberSwal() {
        swal({
            title: "Error",
            text: "Please Enter Valid Phone Number",
            type: "error",
            confirmButtonText: "OK",
            allowOutsideClick: true
        });
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

}]);

angular.module('personalAssistant').directive('autoComplete', function(dboticaServices, $timeout, $log) {
    return {
        restrict: 'A',
        bindToController: true,
        link: function(scope, elem) {
            scope.$watch(function() {
                elem.autocomplete({
                    source: dboticaServices.getMedicineNames(),
                    minLength: 2,
                    select: function(event, ui) {
                        var medicines = dboticaServices.getMedicine();
                        var medicineEntered = ui.item.value;
                        for (var medicineIndex = 0; medicineIndex < medicines.length - 1; medicineIndex++) {
                            if (medicineEntered.toLowerCase() == medicines[medicineIndex].itemName.toLowerCase()) {
                                angular.element('#exampleInputMedicineCost').val(medicines[medicineIndex].retailPrice);

                            }
                        }
                    }
                });
            });
        }
    };
});

angular.module('personalAssistant').directive('testSelection', function(dboticaServices, $timeout, $log) {
    return {
        restrict: 'A',
        controller: 'billManagementCtrl',
        controllerAs: 'billView',
        bindToController: true,
        scope: { max: '=' },
        link: function(scope, elem) {
            scope.$watch(function() {
                $timeout(function() {
                    elem.autocomplete({
                        source: dboticaServices.getTestsNamesList(),
                        minLength: 2,
                        select: function(event, ui) {
                            var tests = dboticaServices.getTestsFromService();
                            console.log("in directive----", tests);
                            var testEntered = ui.item.value;
                            for (var testIndex = 0; testIndex < tests.length; testIndex++) {
                                if (testEntered.toLowerCase() == tests[testIndex].testName.toLowerCase()) {
                                    angular.element('#exampleInputTestsCost').val(tests[testIndex].price / 100);
                                }
                            }
                        }
                    }, 5);
                });
            });
        }
    };
});

angular.module('personalAssistant').filter("longDateIntoReadableDate", function() {
    return function(input) {
        var result;
        if (input == undefined) {
            result = "";
        } else {
            result = new Date(input);
            result = result.toLocaleString();
            var resultArray = result.split(',');
            var resultArrayDate = resultArray[0];
            var resultArrayDateReadable = resultArrayDate.split('/');
            result = resultArrayDateReadable[1] + '/' + resultArrayDateReadable[0] + '/' + resultArrayDateReadable[2];
        }
        return result;
    };
});
