angular.module('personalAssistant').controller('doctorCategoryController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var doctorCategoryElement = this;

    var organizationId = localStorage.getItem('orgId');

    doctorCategoryElement.addNewDoctorCategory = {};
    doctorCategoryElement.doctorCategoriesList = [];
    doctorCategoryElement.addNewDoctorCategory.doctorType = '';
    doctorCategoryElement.addNewDoctorCategory.description = '';
    doctorCategoryElement.addNewDoctorCategoryInModal = addNewDoctorCategoryInModal;
    doctorCategoryElement.deleteDoctorCategory = deleteDoctorCategory;
    doctorCategoryElement.editDoctorCategory = editDoctorCategory;
    doctorCategoryElement.doctorCategorySearch = doctorCategorySearch;
    doctorCategoryElement.validateDoctorCategoryName = validateDoctorCategoryName;
    doctorCategoryElement.clearModal = clearModal;
    doctorCategoryElement.pageChanged = pageChanged;

    var doctorCategoryItemId = '';
    var doctorCategoryItemIndex = '';
    var entitiesArray = [];
    var sortedItemsArrayOnPageChange = [];
    doctorCategoryElement.currentPage = 1;
    doctorCategoryElement.itemsPerPage = 3;
    var displayArray = [];
    var entitiesArrayFlag = parseInt(0);

    doctorCategoryElement.doctorCategoryErrorMessage = false;

    doctorCategoryElement.sortTypeOne = 'doctorType';
    doctorCategoryElement.sortTypeTwo = 'description';

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);


    var getDoctorsCategoriesPromise = dboticaServices.getDoctorCategories(organizationId);
    getDoctorsCategoriesPromise.then(function(doctorsCategoriesPromise) {
        angular.element('#mainAdminLiActive').addClass('activeAdminLi');
        var errorCode = doctorsCategoriesPromise.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var doctorCategories = angular.fromJson(doctorsCategoriesPromise.data.response);
            doctorCategoryElement.doctorCategoriesList = _.filter(doctorCategories, function(entity) {
                return entity.state == 'ACTIVE';
            });
            doctorCategoryElement.totalItems = doctorCategoryElement.doctorCategoriesList.length;
            angular.copy(doctorCategoryElement.doctorCategoriesList, entitiesArray);
            displayArray = _.chunk(entitiesArray, doctorCategoryElement.itemsPerPage);
            angular.copy(displayArray[0], doctorCategoryElement.doctorCategoriesList);
        }
    }, function(docotorCategoriesError) {
        dboticaServices.noConnectivityError();
    });

    function addNewDoctorCategoryInModal() {
        if (doctorCategoryElement.addNewDoctorCategory.doctorType == '') {
            doctorCategoryElement.doctorCategoryErrorMessage = true;
        } else {
            if (doctorCategoryItemId == '' && doctorCategoryItemIndex == '') {
                doctorCategoryElement.addNewDoctorCategory.organizationId = organizationId;
            }
            var addNewDoctorCategoryPromise = dboticaServices.addNewDoctorCategory(doctorCategoryElement.addNewDoctorCategory);
            addNewDoctorCategoryPromise.then(function(addNewDoctorSuccess) {
                var errorCode = addNewDoctorSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var addNewDoctorCategorySuccess = angular.fromJson(addNewDoctorSuccess.data.response);
                    if (errorCode == null && addNewDoctorSuccess.data.success == true) {
                        angular.element('#adddoctorCategoryModal').modal('hide');
                        dboticaServices.addNewDoctorCategorySuccessSwal();
                        if (doctorCategoryItemId == '' && doctorCategoryItemIndex == '') {
                            if (doctorCategoryElement.doctorCategoriesList.length < doctorCategoryElement.itemsPerPage) {
                                doctorCategoryElement.doctorCategoriesList.unshift(addNewDoctorCategorySuccess);
                                entitiesArray.push(addNewDoctorCategorySuccess);
                            } else {
                                if (displayArray.length == doctorCategoryElement.currentPage || displayArray.length == parseInt(1)) {
                                    doctorCategoryElement.doctorCategoriesList = [];
                                    doctorCategoryElement.currentPage = doctorCategoryElement.currentPage + 1;
                                    doctorCategoryElement.doctorCategoriesList.unshift(addNewDoctorCategorySuccess);
                                }
                                entitiesArray.unshift(addNewDoctorCategorySuccess);
                                if (doctorCategoryElement.doctorCategoriesList.length == doctorCategoryElement.itemsPerPage && displayArray.length !== parseInt(1)) {
                                    doctorCategoryElement.currentPage = 1;
                                    displayArray = _.chunk(entitiesArray, doctorCategoryElement.itemsPerPage);
                                    angular.copy(displayArray[0], doctorCategoryElement.doctorCategoriesList);
                                }
                            }
                            displayArray = _.chunk(entitiesArray, doctorCategoryElement.itemsPerPage);
                            doctorCategoryElement.totalItems = entitiesArray.length;
                        } else {
                            doctorCategoryElement.doctorCategoriesList.splice(doctorCategoryItemIndex, 1, addNewDoctorCategorySuccess);
                            var localDoctorCategoryIndex = _.findLastIndex(entitiesArray, function(entity) {
                                return entity.id == addNewDoctorCategorySuccess.id;
                            });
                            entitiesArray.splice(localDoctorCategoryIndex, 1, addNewDoctorCategorySuccess);
                            displayArray = _.chunk(entitiesArray, doctorCategoryElement.itemsPerPage);
                            bedElement.totalItems = entitiesArray.length;
                            doctorCategoryItemId = '';
                            doctorCategoryItemIndex = '';
                        }
                    }
                }
            }, function(addNewDoctorError) {
                dboticaServices.noConnectivityError();
            });
        }
    }

    function deleteDoctorCategory(doctorCategory, index) {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover the doctor category details!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, function() {
            doctorCategory.state = 'INACTIVE';
            var deleteDoctorCategoryPromise = dboticaServices.addNewDoctorCategory(doctorCategory);
            deleteDoctorCategoryPromise.then(function(deleteDoctorSuccess) {
                var errorCode = deleteDoctorSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var deleteDoctorEntitySuccess = angular.fromJson(deleteDoctorSuccess.data.response);
                    if (errorCode == null && deleteDoctorSuccess.data.success == true) {
                        dboticaServices.deleteDoctorCategorySuccessSwal();
                        doctorCategoryElement.doctorCategoriesList.splice(index, 1);
                        var localDoctorCategoryIndex = _.findLastIndex(entitiesArray, function(entity) {
                            return entity.id == doctorCategory.id;
                        });
                        entitiesArray.splice(localDoctorCategoryIndex, 1);
                        doctorCategoryElement.totalItems = entitiesArray.length;
                        displayArray = _.chunk(entitiesArray, bedElement.itemsPerPage);
                    }
                }
            }, function(deleteDoctorError) {
                dboticaServices.noConnectivityError();
            });
            swal("Deleted!", "doctor category has been deleted.", "success");
        });
    }

    function editDoctorCategory(doctor, index) {
        doctorCategoryItemIndex = '';
        doctorCategoryItemId = '';
        doctorCategoryItemId = doctor.id;
        doctorCategoryItemIndex = index;
        doctorCategoryElement.doctorCategoryErrorMessage = false;
        angular.copy(doctor, doctorCategoryElement.addNewDoctorCategory);
    }

    function doctorCategorySearch() {
        var searchStringLength = doctorCategoryElement.inputItemSearch.length;
        if (searchStringLength >= parseInt(3)) {
            var searchDisplayArrayInTable = [];
            if (doctorCategoryElement.inputItemSearch !== '' && doctorCategoryElement.inputItemSearch !== undefined) {
                if (searchStringLength > entitiesArrayFlag) {
                    angular.copy(doctorCategoryElement.doctorCategoriesList, searchDisplayArrayInTable);
                } else {
                    angular.copy(entitiesArray, searchDisplayArrayInTable);
                }
                var sortedItemsArray = [];
                angular.forEach(searchDisplayArrayInTable, function(doctorCategoryEntityEle) {
                    if (doctorCategoryEntityEle.state == 'ACTIVE') {
                        var checkDoctorType = doctorCategoryEntityEle.doctorType.toLowerCase().indexOf(doctorCategoryElement.inputItemSearch.toLowerCase()) > -1;
                        var checkDoctorDescription = doctorCategoryEntityEle.description.toLowerCase().indexOf(doctorCategoryElement.inputItemSearch.toLowerCase()) > -1;
                        var check = checkDoctorType || checkDoctorDescription;
                        if (check) {
                            sortedItemsArray.push(doctorCategoryEntityEle);
                        }
                    }
                });
                doctorCategoryElement.totalItems = sortedItemsArray.length;
                doctorCategoryElement.currentPage = 1;
                angular.copy(sortedItemsArray, sortedItemsArrayOnPageChange);
                displayArray = _.chunk(sortedItemsArray, doctorCategoryElement.itemsPerPage);
                angular.copy(displayArray[0], doctorCategoryElement.doctorCategoriesList);
                entitiesArrayFlag = doctorCategoryElement.inputItemSearch.length;
            }
        }
        if (searchStringLength <= parseInt(2)) {
            entitiesArrayFlag = parseInt(0);
            doctorCategoryElement.totalItems = entitiesArray.length;
            doctorCategoryElement.currentPage = 1;
            displayArray = _.chunk(entitiesArray, doctorCategoryElement.itemsPerPage);
            angular.copy(displayArray[0], doctorCategoryElement.doctorCategoriesList);
        }
    }

    function validateDoctorCategoryName() {
        if (doctorCategoryElement.addNewDoctorCategory.doctorType == '') {
            doctorCategoryElement.doctorCategoryErrorMessage = true;
        } else {
            doctorCategoryElement.doctorCategoryErrorMessage = false;
        }
    }

    function clearModal() {
        doctorCategoryElement.doctorCategoryErrorMessage = false;
        doctorCategoryElement.addNewDoctorCategory.doctorType = '';
        doctorCategoryElement.addNewDoctorCategory.description = '';
    }

    function pageChanged() {
        var requiredIndex = doctorCategoryElement.currentPage - 1;
        var localArray = [];
        displayArray = [];
        if (doctorCategoryElement.inputItemSearch.length >= parseInt(3)) {
            displayArray = _.chunk(sortedItemsArrayOnPageChange, doctorCategoryElement.itemsPerPage);
        } else {
            sortedItemsArrayOnPageChange = [];
            displayArray = _.chunk(entitiesArray, doctorCategoryElement.itemsPerPage);
        }
        localArray = displayArray[requiredIndex];
        angular.copy(localArray, doctorCategoryElement.doctorCategoriesList);
    }

}]);
