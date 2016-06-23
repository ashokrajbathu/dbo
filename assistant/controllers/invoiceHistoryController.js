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
    invoiceElement.blurScreen = false;
    invoiceElement.loading = false;
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
    var invoiceActive = {};
    invoiceElement.searchDate = "";
    invoiceElement.searchEndDate = "";

    invoiceElement.loading = true;
    invoiceElement.blurScreen = true;
    var doctorsOfThatAssistantForInvoices = dboticaServices.doctorsOfAssistant();
    dboticaServices.setInvoice(invoiceActive);
    doctorsOfThatAssistantForInvoices.then(function(doctorsSuccessResponse) {
        var errorCode = doctorsSuccessResponse.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            invoiceElement.doctorsList = angular.fromJson(doctorsSuccessResponse.data.response);
            doctorActiveId = invoiceElement.doctorsList[0].id;
        }
        invoiceElement.loading = false;
        invoiceElement.blurScreen = false;
    }, function(doctorsErrorResponse) {
        invoiceElement.blurScreen = false;
        invoiceElement.loading = false;
        dboticaServices.noConnectivityError();
    });

    invoiceElement.loading = true;
    invoiceElement.blurScreen = true;
    var invoiceHistoryPromise = dboticaServices.getInvoiceHistoryOnLoad(organizationId);
    invoiceHistoryPromise.then(function(invoiceSuccessResponse) {
        var errorCode = invoiceSuccessResponse.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            invoiceHistoryArray = angular.fromJson(invoiceSuccessResponse.data.response);
            angular.copy(invoiceHistoryArray, invoiceElement.invoiceGlobal.invoiceHistoryList);
            $log.log("invoice success response is----", invoiceHistoryArray);
        }
        invoiceElement.loading = false;
        invoiceElement.blurScreen = false;
    }, function(invoiceErrorResponse) {
        invoiceElement.blurScreen = false;
        invoiceElement.loading = false;
        dboticaServices.noConnectivityError();
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
                    invoiceElement.loading = true;
                    searchResultPromise = dboticaServices.searchResultOfInvoice(organizationId, searchType, invoiceElement.searchDate);
                }
                break;
        }
        searchResultPromise.then(function(searchInvoiceSuccess) {
            $log.log("search success invoice is----", searchInvoiceSuccess);
            var errorCode = searchInvoiceSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var invoicesListOnSuccess = angular.fromJson(searchInvoiceSuccess.data.response);
                displayInvoicesInTheTable(invoicesListOnSuccess);
                $log.log("invoices list is-----", invoicesListOnSuccess);
            }
            invoiceElement.loading = false;
        }, function(searchInvoiceError) {
            invoiceElement.blurScreen = false;
            invoiceElement.loading = false;
            dboticaServices.noConnectivityError();
        });
    }

    function viewAllInvoices() {
        if (invoiceElement.isAllBlueActive) {
            clearAllTextBoxes();
            invoiceElement.isAllBlueActive = false;
            invoiceElement.isAllRedActive = true;
            invoiceElement.isPendingRedActive = false;
            invoiceElement.isPendingBlueActive = true;
            invoiceElement.loading = true;
            var viewAllInvoicesPromise = dboticaServices.getInvoiceHistoryOnLoad(organizationId);
            $log.log("view all invoices is----", viewAllInvoicesPromise);
            viewAllInvoicesPromise.then(function(viewAllInvoicesSuccess) {
                var errorCode = viewAllInvoicesSuccess.data.errorCode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var viewAllInvoicesList = angular.fromJson(viewAllInvoicesSuccess.data.response);
                    displayInvoicesInTheTable(viewAllInvoicesList);
                }
                invoiceElement.loading = false;
            }, function(viewAllInvoicesError) {
                invoiceElement.blurScreen = false;
                invoiceElement.loading = false;
                dboticaServices.noConnectivityError();
            });
        }
    }

    function viewPendingInvoices() {
        if (invoiceElement.isPendingBlueActive) {
            clearAllTextBoxes();
            invoiceElement.isPendingBlueActive = false;
            invoiceElement.isPendingRedActive = true;
            invoiceElement.isAllRedActive = false;
            invoiceElement.isAllBlueActive = true;
            invoiceElement.loading = true;
            var viewPendingInvoicesPromise = dboticaServices.getPendingInvoices(organizationId);
            viewPendingInvoicesPromise.then(function(pendingInvoicesSuccess) {
                $log.log("penting success response is----", pendingInvoicesSuccess);
                var errorCode = pendingInvoicesSuccess.data.errorCode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var viewPendingInvoicesList = angular.fromJson(pendingInvoicesSuccess.data.response);
                    $log.log("pending list is-----", viewPendingInvoicesList);
                    displayInvoicesInTheTable(viewPendingInvoicesList);
                }
                invoiceElement.loading = false;
            }, function(pendingInvoicesError) {
                invoiceElement.blurScreen = false;
                invoiceElement.loading = false;
                dboticaServices.noConnectivityError();
            });
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
        $log.log("invoicesArray is----", invoicesArray);
        invoiceElement.invoiceGlobal.invoiceHistoryList = [];
        invoiceElement.invoiceGlobal.invoiceHistoryList = invoicesArray;
    }
}]);
