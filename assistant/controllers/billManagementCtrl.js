angular.module('personalAssistant').controller('billManagementCtrl', ['$scope', '$log', '$timeout', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, $timeout, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "billManagement");

    var billElement = this;
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

    billElement.bill = {};
    billElement.patientSearch = {};
    billElement.patient = {};
    billElement.bill.viewOrHide = false;
    billElement.bill.patientSearchPatients = false;
    billElement.bill.doctorsListInBillManagement = [];
    billElement.bill.patientsListOfThatNumber = [];
    billElement.bill.billTypes = [];
    billElement.bill.billsListing = [];
    billElement.bill.doctorActiveName = "";
    billElement.bill.doctorActiveService = "No Bill Type";
    billElement.bill.paymentDueType = "Completed";
    billElement.invoice = {};
    billElement.invoice.amount = 0;
    billElement.add = {};
    billElement.addMedicine = [];
    billElement.finalBill = {};
    billElement.addPay = [];
    billElement.dueDateBill = {};
    billElement.addToBill = [];

    billElement.addMedicine.medicine = '';
    billElement.addMedicineNames = [];
    var organizationId = localStorage.getItem('orgId');
    billElement.bill.nextPaymentDate = getTodayString();
    billElement.finalBill.organizationId = organizationId;
    var currentActiveAssistant = $.parseJSON(localStorage.getItem('assistantCurrentlyLoggedIn'));
    billElement.finalBill.assistantId = currentActiveAssistant.id;

    $log.log("org id is----" + organizationId);
    var medicinesPromise = dboticaServices.getItemsOfTheTable(0, 100, 'All', 'Drug', organizationId);
    $log.log("medicine promise is----", medicinesPromise);
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
            $log.log("medicine names are----", billElement.addMedicineNames);
        }
    }, function(errorResponse) {

    });



    var doctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
    doctorsOfThatAssistant.then(function(successResponse) {
        $log.log("bill response is----", successResponse);
        var errorCode = successResponse.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            billElement.bill.doctorsListInBillManagement = $.parseJSON(successResponse.data.response);
            $log.log("ele---", billElement.bill.doctorsListInBillManagement);
            billElement.bill.doctorActive = billElement.bill.doctorsListInBillManagement[0];
            billElement.finalBill.doctorId = billElement.bill.doctorActive.id;
            if (billElement.bill.doctorActive.hasOwnProperty('doctorPriceInfos')) {
                billElement.bill.billTypes = billElement.bill.doctorActive.doctorPriceInfos;
                billElement.bill.doctorActiveService = billElement.bill.billTypes[0].billingName;
                billElement.bill.billCost = billElement.bill.billTypes[0].price / 100;
                $log.log("bill types are---", billElement.bill.billTypes);
            }
            billElement.bill.doctorActiveName = billElement.bill.doctorActive.firstName + ' ' + billElement.bill.doctorActive.lastName;
            $log.log("doctors list is---", billElement.bill.doctorsListInBillManagement);
        }
    }, function(errorResponse) {
        $log.log("in error response of getting doctors");
    });

    billElement.selectDoctorFromDropdown = function(doctor) {
        billElement.bill.doctorActive = doctor;
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

    billElement.selectBillFromDropdown = function(billing) {
        billElement.bill.doctorActiveService = billing.billingName;
        billElement.bill.billCost = billing.price / 100;
        /*billElement.bill.serviceId=billing.*/
    }

    billElement.patientSearchOftheNumber = function(phoneNumber) {
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
    }

    billElement.updateBillForm = function(patient, index) {
        billElement.patient = patient;
        $scope.radio0 = false;
        $scope['radio' + index] = true;
        billElement.finalBill.patientId = patient.id;
    }

    billElement.addConsultationOfDoctor = function() {
        var newService = {};
        newService.itemName = billElement.bill.doctorActiveService;
        newService.cost = billElement.bill.billCost;
        newService.quantity = 1;
        newService.itemType = "DOCTOR_CHARGE";
        newService.discount = 0;
        newService.tax = 0;
        newService.amountCharged = billElement.bill.billCost;
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
        newService.paid = true;
        $log.log("new Service is----", newService);
        billElement.bill.billsListing.push(newService);
    }

    billElement.updateAmount = function(billUnderEdit, index) {
        $log.log("bill under edit is----", billUnderEdit.discount);
        billElement.invoice.amount -= billUnderEdit.amountCharged;
        var amountOnWhichDisOrVat = billUnderEdit.cost * billUnderEdit.quantity;
        var discount = (100 - billUnderEdit.discount) / 100;
        $log.log("disc is----" + discount);
        var vat = (billUnderEdit.tax) / 100;
        $log.log("vat is-----" + vat);
        billUnderEdit.amountCharged = ((amountOnWhichDisOrVat * discount) + (amountOnWhichDisOrVat * vat));
        billElement.invoice.amount += billUnderEdit.amountCharged;
        $log.log('amount is---' + billUnderEdit.amountCharged);
    }

    billElement.deleteABill = function(billToBeRemoved, index) {
        billElement.invoice.amount -= billToBeRemoved.amountCharged;
        billElement.bill.billsListing.splice(index, 1);
    }

    billElement.addMedicineToBill = function() {
        var newMedicine = {};
        newMedicine.itemName = angular.element('#exampleInputMedicine').val();
        $log.log("medicine is----" + billElement.add.medicine);
        newMedicine.quantity = billElement.add.quantity;
        newMedicine.itemType = "MEDICINE";
        newMedicine.cost = angular.element('#exampleInputMedicineCost').val();
        newMedicine.discount = 0;
        newMedicine.tax = 0;
        newMedicine.amountCharged = newMedicine.cost * billElement.add.quantity;
        billElement.invoice.amount += newMedicine.amountCharged;
        newMedicine.paid = true;
        billElement.bill.billsListing.push(newMedicine);
    }

    billElement.billFinalSubmisssion = function() {
        billElement.finalBill.items = [];
        billElement.finalBill.paymentEntries = [];
        billElement.finalBill.items = billElement.bill.billsListing;
        billElement.finalBill.paymentEntries = billElement.addToBill;
        $log.log("final bill is----", billElement.finalBill);
    }

    billElement.addDueDateBill = function() {
        var newDueDateBill = {};
        var newDueDateToFinalBill = {};
        newDueDateBill.amountPaid = billElement.dueDateBill.dueCost;
        newDueDateBill.updatedAt = billElement.dueDateBill.dueDate;
        billElement.addPay.push(newDueDateBill);
        billElement.invoice.amount -= billElement.dueDateBill.dueCost;
        newDueDateToFinalBill.updatedUserId = currentActiveAssistant.id;
        newDueDateToFinalBill.amountPaid = billElement.dueDateBill.dueCost;
        newDueDateToFinalBill.state = "ACTIVE";
        var dateArray = billElement.dueDateBill.dueDate.split('/');
        var date = dateArray[1] + '/' + dateArray[0] + '/' + dateArray[2];
        date = new Date(date);
        date = date.getTime();
        newDueDateToFinalBill.updatedAt = date;
        billElement.addToBill.push(newDueDateToFinalBill);
        $log.log("add pay is----", billElement.addPay);
        billElement.dueDateBill.dueCost = "";
        billElement.dueDateBill.dueDate = "";
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

    billElement.formatDate = function(date) {
        var dateOut = new Date(date);
        return dateOut;
    }


}]);

angular.module('personalAssistant').directive('autoComplete', function(dboticaServices, $timeout, $log) {
    return {
        restrict: 'A',
        link: function(scope, elem) {
            scope.$watch(function() {
                $timeout(function() {
                    elem.autocomplete({
                        source: dboticaServices.getMedicineNames(),
                        minLength: 2,
                        select: function(event, ui) {
                            var medicines = dboticaServices.getMedicine();
                            var medicineEntered = ui.item.value;
                            for (var medicineIndex = 0; medicineIndex < medicines.length - 1; medicineIndex++) {
                                if (medicineEntered.toLowerCase() == medicines[medicineIndex].itemName.toLowerCase()) {
                                    angular.element('#exampleInputMedicineCost').val(medicines[medicineIndex].retailPrice);
                                    /*scope.add.cost = medicines[medicineIndex].retailPrice;
                                    scope.$apply;*/
                                }
                            }
                        }
                    }, 5);
                });
            });
        }

    };
});
