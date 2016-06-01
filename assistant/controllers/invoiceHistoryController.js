angular.module('personalAssistant').controller('invoiceHistoryController', ['$scope', '$log', '$timeout', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, $timeout, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var invoiceElement = this;

    localStorage.setItem("currentState", "invoiceHistory");

    invoiceElement.selectSearchType = selectSearchType;
    invoiceElement.searchRequestSubmit = searchRequestSubmit;
    invoiceElement.selectDoctorForSearch = selectDoctorForSearch;
    invoiceElement.viewAllInvoices = viewAllInvoices;
    invoiceElement.viewPendingInvoices = viewPendingInvoices;
    invoiceElement.editInvoice = editInvoice;

    angular.element("#date").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true

    });

    angular.element("#endDate").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true

    });

    invoiceElement.name = "Invoice History";
    invoiceElement.searchTypes = ['Phone Number', 'Bill Number', 'Date', 'Doctor', 'Next Due Date'];
    invoiceElement.searchBox = true;
    invoiceElement.searchBoxDate = false;
    invoiceElement.searchBoxEndDate = false;
    invoiceElement.searchSelected = "Phone Number";
    var organizationId = localStorage.getItem('orgId');
    invoiceElement.searchWarningMessage = false;
    invoiceElement.isAllRedActive = true;
    invoiceElement.isAllBlueActive = false;
    invoiceElement.isPendingRedActive = false;
    invoiceElement.isPendingBlueActive = true;
    invoiceElement.doctorsDropdown = false;
    var invoiceHistoryArray = [];
    invoiceElement.invoiceGlobal = {};
    invoiceElement.searchEntity = "";
    invoiceElement.invoiceGlobal.invoiceHistoryList = [];
    invoiceElement.doctorsList = [];
    var doctorActive = {};
    invoiceElement.searchDate = "";
    invoiceElement.searchEndDate = "";

    var doctorsOfThatAssistantForInvoices = dboticaServices.doctorsOfAssistant();

    doctorsOfThatAssistantForInvoices.then(function(doctorsSuccessResponse) {
        var errorCode = doctorsSuccessResponse.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage();
        } else {
            invoiceElement.doctorsList = $.parseJSON(doctorsSuccessResponse.data.response);
            doctorActiveId = invoiceElement.doctorsList[0].id;
        }
    }, function(doctorsErrorResponse) {

    });

    var invoiceHistoryPromise = dboticaServices.getInvoiceHistoryOnLoad(organizationId);
    invoiceHistoryPromise.then(function(invoiceSuccessResponse) {
        var errorCode = invoiceSuccessResponse.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            invoiceHistoryArray = $.parseJSON(invoiceSuccessResponse.data.response);
            angular.copy(invoiceHistoryArray, invoiceElement.invoiceGlobal.invoiceHistoryList);
            $log.log("invoice success response is----", invoiceHistoryArray);
            /*for (var invoiceIndex in invoiceHistoryArray) {
                var invoiceObject = {};
                invoiceObject.id = invoiceHistoryArray[invoiceIndex].id;
                invoiceObject.creationDate = invoiceHistoryArray[invoiceIndex].creationTime;
                invoiceObject.costDue = invoiceHistoryArray[invoiceIndex].totalAmount - invoiceHistoryArray[invoiceIndex].amountPaid;
                invoiceObject.costDue = invoiceObject.costDue / 100;
*/
            /*var firstName = "";
            var lastName = "";
            var getPatientPromise = dboticaServices.getPatientDetailsOfThatNumber(invoiceHistoryArray[invoiceIndex].patientId);
            getPatientPromise.then(function(getPatientSuccess) {
                var errorCode = getPatientSuccess.data.errorCode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var patientSuccess = $.parseJSON(getPatientSuccess.data.response);
                    $log.log("patient data is----", patientSuccess);
                    if (patientSuccess[0].hasOwnProperty('firstName')) {
                        firstName = patientSuccess[0].firstName;
                    }
                    if (patientSuccess[0].hasOwnProperty('lastName')) {
                        lastName = patientSuccess[0].lastName;
                    }
                    invoiceObject.patientName = firstName + ' ' + lastName;
                    $log.log("oatnam is----" + invoiceObject.patientName);
                }
            }, function(getPatientError) {});*/

            /* var docFirstName = "";
             var docLastName = "";
             var doctorsOfThatAssistant = dboticaServices.doctorsOfAssistant();
             doctorsOfThatAssistant.then(function(doctorsOfAssistantSuccess) {
                 var errorCode = doctorsOfAssistantSuccess.data.errorCode;
                 if (!!errorCode) {
                     dboticaServices.logoutFromThePage(errorCode);
                 } else {
                     var doctorsList = $.parseJSON(doctorsOfAssistantSuccess.data.response);
                     $log.log("doc data is----", doctorsList);
                     for (var docIndex in doctorsList) {
                         if (doctorsList[docIndex].id == invoiceHistoryArray[invoiceIndex].doctorId) {
                             if (doctorsList[docIndex].hasOwnProperty('firstName')) {
                                 docFirstName = doctorsList[docIndex].firstName;
                             }
                             if (doctorsList[docIndex].hasOwnProperty('lastName')) {
                                 docLastName = doctorsList[docIndex].lastName;
                             }
                         }
                     }
                     invoiceObject.doctorName = docFirstName + ' ' + docLastName;
                     $log.log("doctnam is----" + invoiceObject.doctorName);
                 }
             }, function(doctorsOfAssistantError) {});*/

            /* invoiceElement.invoiceGlobal.invoiceHistoryList.push(invoiceObject);
            }
            $log.log("invoice list to be displayed is-----", invoiceElement.invoiceGlobal.invoiceHistoryList);*/
        }
    }, function(invoiceErrorResponse) {
        $log.log("invoice error response");
    });



    function selectSearchType(search) {
        invoiceElement.searchSelected = search;
        switch (search) {
            case 'Date':
                invoiceElement.searchBoxDate = true;
                invoiceElement.searchBox = false;
                invoiceElement.searchBoxEndDate = true;
                invoiceElement.doctorsDropdown = false;
                clearAllTextBoxes();
                break;

            case 'Next Due Date':
                invoiceElement.searchBoxDate = true;
                invoiceElement.searchBox = false;
                invoiceElement.searchBoxEndDate = false;
                invoiceElement.doctorsDropdown = false;
                clearAllTextBoxes();
                break;

            case 'Doctor':
                invoiceElement.doctorsDropdown = true;
                invoiceElement.searchBoxDate = false;
                invoiceElement.searchBox = false;
                invoiceElement.searchBoxEndDate = false;
                invoiceElement.doctorSelected = getNameOfTheDoctor(invoiceElement.doctorsList[0]);
                clearAllTextBoxes();
                break;

            case 'Phone Number':
            case 'Bill Number':
                invoiceElement.searchBoxDate = false;
                invoiceElement.searchBox = true;
                invoiceElement.searchBoxEndDate = false;
                invoiceElement.doctorsDropdown = false;
                clearAllTextBoxes();
                break;
        }
    }

    function selectDoctorForSearch(docSelected) {
        invoiceElement.doctorSelected = getNameOfTheDoctor(docSelected);
        doctorActiveId = docSelected.id;
        $log.log("id of doc is----" + doctorActiveId);
    }

    function searchRequestSubmit() {
        var searchType = invoiceElement.searchSelected;
        var searchTypeValue = invoiceElement.searchEntity;
        var searchResultPromise;
        invoiceElement.isAllBlueActive = true;
        invoiceElement.isAllRedActive = false;
        invoiceElement.isPendingBlueActive = true;
        invoiceElement.isPendingRedActive = false;
        switch (searchType) {
            case 'Phone Number':
            case 'Bill Number':
                if (searchTypeValue == "") {
                    $log.log("in error");
                    invoiceElement.searchWarningMessage = true;
                } else {
                    invoiceElement.searchWarningMessage = false;
                    searchResultPromise = dboticaServices.searchResultOfInvoice(organizationId, searchType, searchTypeValue);
                }
                break;
            case 'Doctor':
                searchResultPromise = dboticaServices.searchResultOfInvoice(organizationId, searchType, doctorActiveId);
                break;
            case 'Date':
                if (invoiceElement.searchDate == "" && invoiceElement.searchEndDate == "") {
                    invoiceElement.searchWarningMessage = true;
                } else {
                    invoiceElement.searchWarningMessage = false;
                    searchResultPromise = dboticaServices.searchResultOfInvoice(organizationId, searchType, invoiceElement.searchDate, invoiceElement.searchEndDate);
                }
                break;
            case 'Next Due Date':
                if (invoiceElement.searchDate == "") {
                    invoiceElement.searchWarningMessage = true;
                } else {
                    invoiceElement.searchWarningMessage = false;
                    searchResultPromise = dboticaServices.searchResultOfInvoice(organizationId, searchType, invoiceElement.searchDate);
                }
                break;
        }
        searchResultPromise.then(function(searchInvoiceSuccess) {
            $log.log("search success invoice is----", searchInvoiceSuccess);
            var invoicesListOnSuccess = $.parseJSON(searchInvoiceSuccess.data.response);
            displayInvoicesInTheTable(invoicesListOnSuccess);
            $log.log("invoices list is-----", invoicesListOnSuccess);
        }, function(searchInvoiceError) {

        });
    }

    function viewAllInvoices() {
        if (invoiceElement.isAllBlueActive) {
            clearAllTextBoxes();
            invoiceElement.isAllBlueActive = false;
            invoiceElement.isAllRedActive = true;
            invoiceElement.isPendingRedActive = false;
            invoiceElement.isPendingBlueActive = true;
            var viewAllInvoicesPromise = dboticaServices.getInvoiceHistoryOnLoad(organizationId);
            viewAllInvoicesPromise.then(function(viewAllInvoicesSuccess) {
                var errorCode = viewAllInvoicesSuccess.data.errorCode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage();
                } else {
                    var viewAllInvoicesList = $.parseJSON(viewAllInvoicesSuccess.data.response);
                    displayInvoicesInTheTable(viewAllInvoicesList);
                }
            }, function(viewAllInvoicesError) {});
        }
    }

    function viewPendingInvoices() {
        if (invoiceElement.isPendingBlueActive) {
            clearAllTextBoxes();
            invoiceElement.isPendingBlueActive = false;
            invoiceElement.isPendingRedActive = true;
            invoiceElement.isAllRedActive = false;
            invoiceElement.isAllBlueActive = true;
            var viewPendingInvoicesPromise = dboticaServices.getPendingInvoices(organizationId);
            viewPendingInvoicesPromise.then(function(pendingInvoicesSuccess) {
                $log.log("penting success response is----", pendingInvoicesSuccess);
                var errorCode = pendingInvoicesSuccess.data.errorCode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage();
                } else {
                    var viewPendingInvoicesList = $.parseJSON(pendingInvoicesSuccess.data.response);
                    $log.log("pending list is-----", viewPendingInvoicesList);
                    displayInvoicesInTheTable(viewPendingInvoicesList);
                }
            }, function(pendingInvoicesError) {});
        }
    }

    function editInvoice(invoiceSelected) {
        $log.log("invoice selected is----", invoiceSelected);
        dboticaServices.setInvoice(invoiceSelected);
        $state.go('home.billManagement');
    }

    function clearAllTextBoxes() {
        invoiceElement.searchDate = "";
        invoiceElement.searchEndDate = "";
        invoiceElement.searchEntity = "";
    }

    function getNameOfTheDoctor(doctor) {
        var docFirstName = "";
        var docLastName = "";
        var doctorName = "";
        if (doctor.hasOwnProperty('firstName')) {
            docFirstName = doctor.firstName;
        }
        if (doctor.hasOwnProperty('lastName')) {
            docLastName = doctor.lastName;
        }
        doctorName = docFirstName + ' ' + docLastName;
        return doctorName;
    }

    function displayInvoicesInTheTable(invoicesArray) {
        invoiceElement.invoiceGlobal.invoiceHistoryList = [];
        for (var invoiceIndex in invoicesArray) {
            var invoiceObject = {};
            invoiceObject.id = invoicesArray[invoiceIndex].id;
            invoiceObject.creationDate = invoicesArray[invoiceIndex].creationTime;
            invoiceObject.costDue = invoicesArray[invoiceIndex].totalAmount - invoicesArray[invoiceIndex].amountPaid;
            invoiceObject.costDue = invoiceObject.costDue / 100;
            invoiceElement.invoiceGlobal.invoiceHistoryList.push(invoiceObject);

        }
    }




}]);
