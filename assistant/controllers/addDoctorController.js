angular.module('personalAssistant').controller('doctorController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var doctorElement = this;

    var organizationId = localStorage.getItem('orgId');

    doctorElement.doctorTypeSelect = doctorTypeSelect;
    doctorElement.addNewDoctorInModal = addNewDoctorInModal;
    doctorElement.doctorSelectFromDropDown = doctorSelectFromDropDown;
    doctorElement.editDoctorInTable = editDoctorInTable;
    doctorElement.deleteDoctorInTable = deleteDoctorInTable;
    doctorElement.doctorSearchInTheTotalList = doctorSearchInTheTotalList;

    doctorElement.allDoctorTypes = [];
    var doctorsListIs = [];
    doctorElement.doctorsListToBeDisplayed = [];
    doctorElement.doctorsListInTheTable = [];
    doctorElement.addNewDoctor = {};
    doctorElement.doctorType = '';
    doctorElement.doctorName = '';
    doctorElement.doctorActiveId = '';
    var doctorItemIndex = '';
    var doctorItemId = '';

    doctorElement.sortTypeOne = 'doctorType';
    doctorElement.sortTypeTwo = 'firstName';

    var entitiesArray = [];
    var entitiesArrayFlag = parseInt(0);



    var getDoctorTypesPromise = dboticaServices.getDoctorCategories(organizationId);
    $log.log("doc types are----", getDoctorTypesPromise);
    getDoctorTypesPromise.then(function(getDoctorsSuccess) {
        var errorCode = getDoctorsSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var doctorTypes = [];
            doctorTypes = angular.fromJson(getDoctorsSuccess.data.response);
            $log.log('doctor types are----', doctorTypes);
            angular.forEach(doctorTypes, function(doctorType) {
                if (doctorType.state == 'ACTIVE') {
                    doctorElement.allDoctorTypes.push(doctorType);
                }
            });
            doctorElement.doctorType = doctorElement.allDoctorTypes[0].doctorType;
            doctorElement.addNewDoctor.organizationDoctorCategoryId = doctorElement.allDoctorTypes[0].id;
            $log.log('org doc cat id---', doctorElement.addNewDoctor.organizationDoctorCategoryId);
        }
    }, function(getDoctorsError) {
        dboticaServices.noConnectivityError();
    });

    var getDoctorsListOnLoadPromise = dboticaServices.doctorsOfAssistant();
    getDoctorsListOnLoadPromise.then(function(getDoctorsListSuccess) {
        var errorCode = getDoctorsListSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            doctorsListIs = angular.fromJson(getDoctorsListSuccess.data.response);
            angular.forEach(doctorsListIs, function(doctorListElement) {
                if (doctorListElement.state == 'ACTIVE') {
                    doctorElement.doctorsListToBeDisplayed.push(doctorListElement);
                }
            });
            if (doctorElement.doctorsListToBeDisplayed[0].lastName == undefined) {
                doctorElement.doctorsListToBeDisplayed[0].lastName = '';
            }
            doctorElement.doctorName = doctorElement.doctorsListToBeDisplayed[0].firstName + ' ' + doctorElement.doctorsListToBeDisplayed[0].lastName;
            doctorElement.addNewDoctor.doctorId = doctorElement.doctorsListToBeDisplayed[0].id;
            $log.log("doctors list response is---", doctorElement.addNewDoctor.doctorId);
        }
    }, function(getDoctorsListError) {
        dboticaServices.noConnectivityError();
    });

    var doctorsListInAdminPromise = dboticaServices.doctorsListInMainAdmin(organizationId);
    $log.log("docs list in admin promise-----", doctorsListInAdminPromise);
    doctorsListInAdminPromise.then(function(doctorsListInMainSuccess) {
        var errorCode = doctorsListInMainSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage();
        } else {
            var docsListInAdmin = angular.fromJson(doctorsListInMainSuccess.data.response);
            var docsListLocal = [];
            $log.log("docs list in admin-----", docsListInAdmin);
            angular.forEach(docsListInAdmin, function(docsListInAdminElement) {
                if (docsListInAdminElement.state == 'ACTIVE') {
                    docsListLocal.push(docsListInAdminElement);
                }
            });
            angular.copy(docsListLocal, doctorElement.doctorsListInTheTable);
            angular.copy(docsListLocal, entitiesArray);
            $log.log('in list in table----', doctorElement.doctorsListInTheTable);
        }
    }, function(doctorsListInMainError) {
        dboticaServices.noConnectivityError();
    });

    function doctorTypeSelect(doctorTypeEntity) {
        doctorElement.doctorType = doctorTypeEntity.doctorType;
        doctorElement.addNewDoctor.organizationDoctorCategoryId = doctorTypeEntity.id;
    }

    function addNewDoctorInModal() {
        if (doctorItemIndex == '' && doctorItemId == '') {
            doctorElement.addNewDoctor.organizationId = organizationId;
        }
        $log.log("add new doc entity is----", doctorElement.addNewDoctor);
        var addNewDoctorPromise = dboticaServices.addNewDoctorToACategory(doctorElement.addNewDoctor);
        $log.log("docs promise is----", addNewDoctorPromise);
        addNewDoctorPromise.then(function(addNewDocSuccess) {
            var errorCode = addNewDocSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var newDoctorResponse = angular.fromJson(addNewDocSuccess.data.response);
                $log.log("new doctor response is----", newDoctorResponse);
                if (errorCode == null && addNewDocSuccess.data.success == true) {
                    dboticaServices.addNewDoctorSuccessSwal();
                    if (doctorItemIndex == '' && doctorItemId == '') {
                        doctorElement.doctorsListInTheTable.unshift(newDoctorResponse);
                        entitiesArray.unshift(newDoctorResponse);
                    } else {
                        doctorElement.doctorsListInTheTable.splice(doctorItemIndex, 1, newDoctorResponse);
                        var indexLocal;
                        for (var doctorEntity in entitiesArray) {
                            if (entitiesArray[doctorEntity].id == newDoctorResponse.id) {
                                indexLocal = doctorEntity;
                                break;
                            } else {
                                continue;
                            }
                        }
                        entitiesArray.splice(indexLocal, 1, newDoctorResponse);
                    }
                }
            }
            doctorItemIndex = '';
            doctorItemId = '';
        }, function(addNewDocError) {
            dboticaServices.noConnectivityError();
        });
        doctorElement.addNewDoctor = {};
    }

    function doctorSelectFromDropDown(doctorEntityFromDropdown) {
        if (doctorEntityFromDropdown.lastName == undefined) {
            doctorEntityFromDropdown.lastName = '';
        }
        doctorElement.doctorName = doctorEntityFromDropdown.firstName + ' ' + doctorEntityFromDropdown.lastName;
        doctorElement.addNewDoctor.doctorId = doctorEntityFromDropdown.id;
    }

    function deleteDoctorInTable(doctorEntryInTable, index) {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover the Doctor Details!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, function() {
            doctorEntryInTable.state = 'INACTIVE';

            var deleteDoctorPromise = dboticaServices.addNewDoctorToACategory(doctorEntryInTable);
            deleteDoctorPromise.then(function(deleteDoctorSuccess) {
                var errorCode = deleteDoctorSuccess.data.errorCode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var deleteDoctorSuccessEntity = angular.fromJson(deleteDoctorSuccess.data.response);
                    $log.log("delete is----", deleteDoctorSuccessEntity);
                    if (deleteDoctorSuccess.data.errorCode == null && deleteDoctorSuccess.data.success == true) {
                        dboticaServices.deleteDoctorSuccessSwal();
                        doctorElement.doctorsListInTheTable.splice(index, 1);
                        var delIndex;
                        for (var deleteIndex in entitiesArray) {
                            if (entitiesArray[deleteIndex].id == doctorEntryInTable.id) {
                                delIndex = deleteIndex;
                                break;
                            } else {
                                continue;
                            }
                        }
                        entitiesArray.splice(delIndex, 1);
                    }
                }
            }, function(deleteDoctorCategoryError) {
                dboticaServices.noConnectivityError();
            });
            swal("Deleted!", "Doctor Details has been deleted.", "success");
        });
    }

    function editDoctorInTable(doctorEntity, index) {
        doctorItemIndex = '';
        doctorItemId = '';
        doctorItemIndex = index;
        doctorItemId = doctorEntity.id;
        var localDoctorEntity = {};
        angular.copy(doctorEntity, localDoctorEntity);
        angular.forEach(doctorElement.allDoctorTypes, function(docCategory) {
            if (docCategory.id == localDoctorEntity.organizationDoctorCategoryId) {
                doctorElement.doctorType = docCategory.doctorType;
            }
        });
        angular.forEach(doctorElement.doctorsListToBeDisplayed, function(doctorListElem) {
            if (doctorListElem.id == localDoctorEntity.doctorId) {
                if (doctorListElem.lastName == undefined) {
                    doctorListElem.lastName = '';
                }
                doctorElement.doctorName = doctorListElem.firstName + ' ' + doctorListElem.lastName;
            }
        });
        angular.copy(localDoctorEntity, doctorElement.addNewDoctor);
    }

    function doctorSearchInTheTotalList() {
        if (doctorElement.doctorNameForSearch.length >= parseInt(3)) {
            var searchDisplayArrayInTable = [];
            if (doctorElement.doctorNameForSearch !== '' && doctorElement.doctorNameForSearch !== undefined) {
                if (doctorElement.doctorNameForSearch.length > entitiesArrayFlag) {
                    angular.copy(doctorElement.doctorsListInTheTable, searchDisplayArrayInTable);
                } else {
                    angular.copy(entitiesArray, searchDisplayArrayInTable);
                }
                var sortedItemsArray = [];
                var sortedDoctorCategoriesArray = [];
                var sortedDoctorNamesArray = [];
                var doctorCategoriesListForSorting = doctorElement.allDoctorTypes;
                var doctorNamesListForSorting = doctorElement.doctorsListToBeDisplayed;
                angular.forEach(doctorCategoriesListForSorting, function(doctorCategoryForSorting) {
                    if (doctorCategoryForSorting.state == 'ACTIVE') {
                        var categoryCheck = doctorCategoryForSorting.doctorType.toLowerCase().indexOf(doctorElement.doctorNameForSearch.toLowerCase()) > -1;
                        if (categoryCheck) {
                            angular.forEach(searchDisplayArrayInTable, function(doctorInTable) {
                                if (doctorInTable.organizationDoctorCategoryId == doctorCategoryForSorting.id) {
                                    sortedItemsArray.push(doctorInTable);
                                }
                            });
                        }
                    }
                });
                angular.forEach(doctorNamesListForSorting, function(doctorNameToSort) {
                    if (doctorNameToSort.state == 'ACTIVE') {
                        var doctorFirstNameCheck = doctorNameToSort.firstName.toLowerCase().indexOf(doctorElement.doctorNameForSearch.toLowerCase()) > -1;
                        var doctorLastNameCheck = doctorNameToSort.lastName.toLowerCase().indexOf(doctorElement.doctorNameForSearch.toLowerCase()) > -1;
                        var doctorNameCheck = doctorFirstNameCheck || doctorLastNameCheck;
                        if (doctorNameCheck) {
                            angular.forEach(searchDisplayArrayInTable, function(doctorInTheTable) {
                                if (doctorInTheTable.doctorId == doctorNameToSort.id) {
                                    var stringPresenceCheck = false;
                                    for (var sortedItemIndex in sortedItemsArray) {
                                        if (sortedItemsArray[sortedItemIndex].doctorId == doctorNameToSort.id) {
                                            stringPresenceCheck = true;
                                            break;
                                        } else {
                                            continue;
                                        }
                                    }
                                    if (!stringPresenceCheck) {
                                        sortedItemsArray.push(doctorInTheTable);
                                    }
                                }
                            });
                        }
                    }
                });
                angular.copy(sortedItemsArray, doctorElement.doctorsListInTheTable);
                entitiesArrayFlag = doctorElement.doctorNameForSearch.length;
            }
        }
        if (doctorElement.doctorNameForSearch.length <= parseInt(2)) {
            entitiesArrayFlag = parseInt(0);
            angular.copy(entitiesArray, doctorElement.doctorsListInTheTable);
        }
    }
}]);
