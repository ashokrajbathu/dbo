angular.module('personalAssistant').controller('invoiceHistoryController', invoiceHistoryController);
invoiceHistoryController.$inject = ['$scope', '$log', '$timeout', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function invoiceHistoryController($scope, $log, $timeout, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var invoiceElement = this;

    sessionStorage.setItem("currentState", "invoiceHistory");

    invoiceElement.selectSearchType = selectSearchType;
    invoiceElement.searchRequestSubmit = searchRequestSubmit;
    invoiceElement.selectDoctorForSearch = selectDoctorForSearch;
    invoiceElement.viewAllInvoices = viewAllInvoices;
    invoiceElement.viewPendingInvoices = viewPendingInvoices;
    invoiceElement.editInvoice = editInvoice;
    invoiceElement.pageChanged = pageChanged;

    invoiceElement.itemsPerPage = 8;
    invoiceElement.currentPage = 1;
    var entitiesArray = [];
    var displayArray = [];


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
    var organizationId = sessionStorage.getItem('orgId');
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
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            invoiceElement.doctorsList = angular.fromJson(doctorsSuccessResponse.data.response);
            angular.element('#BillingHeader').addClass('activeAdminLi');
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
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            invoiceHistoryArray = angular.fromJson(invoiceSuccessResponse.data.response);
            angular.copy(invoiceHistoryArray, entitiesArray);
            invoiceElement.totalItems = entitiesArray.length;
            displayArray = _.chunk(entitiesArray, invoiceElement.itemsPerPage);
            angular.copy(displayArray[0], invoiceElement.invoiceGlobal.invoiceHistoryList);
        }
        invoiceElement.loading = false;
        invoiceElement.blurScreen = false;
    }, function(invoiceErrorResponse) {
        invoiceElement.blurScreen = false;
        invoiceElement.loading = false;
        dboticaServices.noConnectivityError();
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
            var errorCode = searchInvoiceSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var invoicesListOnSuccess = angular.fromJson(searchInvoiceSuccess.data.response);
                displayInvoicesInTheTable(invoicesListOnSuccess);
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
            viewAllInvoicesPromise.then(function(viewAllInvoicesSuccess) {
                var errorCode = viewAllInvoicesSuccess.data.errorCode;
                if (errorCode) {
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
                var errorCode = pendingInvoicesSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var viewPendingInvoicesList = angular.fromJson(pendingInvoicesSuccess.data.response);
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
        entitiesArray = [];
        displayArray = [];
        invoiceElement.invoiceGlobal.invoiceHistoryList = [];
        angular.copy(invoicesArray, entitiesArray);
        invoiceElement.totalItems = entitiesArray.length;
        displayArray = _.chunk(entitiesArray, invoiceElement.itemsPerPage);
        angular.copy(displayArray[0], invoiceElement.invoiceGlobal.invoiceHistoryList);
    }

    function pageChanged() {
        var requiredIndex = invoiceElement.currentPage - 1;
        displayArray = [];
        displayArray = _.chunk(entitiesArray, invoiceElement.itemsPerPage);
        angular.copy(displayArray[requiredIndex], invoiceElement.invoiceGlobal.invoiceHistoryList);
    }
};
