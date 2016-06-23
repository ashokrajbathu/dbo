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
    var object1 = [{ 'name': 'teja', 'firstName': 'ravi' }, { 'name': 'krishnateja' }];
    var object2 = { 'name': 'teja' };
    var obj4 = ['a', 'b', 'c', 'd'];
    var object3 = angular.equals(object1, object2);
    $log.log('extend object is----', object3);
    angular.forEach(object1, function(value, index) {
        $log.log('value is----', value.name);
    });

    var getDoctorTypesPromise = dboticaServices.getDoctorCategories(organizationId);
    $log.log("doc types are----", getDoctorTypesPromise);
    getDoctorTypesPromise.then(function(getDoctorsSuccess) {
        var errorCode = getDoctorsSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var doctorTypes = [];
            doctorTypes = angular.fromJson(getDoctorsSuccess.data.response);
            angular.forEach(doctorTypes, function(doctorType) {
                if (doctorType.state == 'ACTIVE') {
                    doctorElement.allDoctorTypes.push(doctorType);
                }
            });
            doctorElement.doctorType = doctorElement.allDoctorTypes[0].doctorType;
            doctorElement.addNewDoctor.organizationDoctorCategoryId = doctorElement.allDoctorTypes[0].id;
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
            doctorElement.doctorActiveId = doctorElement.doctorsListToBeDisplayed[0].id;
            $log.log("doctors list response is---", doctorsListIs);
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
                    docsListInAdminElement.doctorCatName = getDoctorCategoryNameFromItsId(docsListInAdminElement.organizationDoctorCategoryId);
                    docsListInAdminElement.doctorNameToDisplay = getDoctorNameFromId(docsListInAdminElement.doctorId);
                    docsListLocal.push(docsListInAdminElement);
                }
            });
            angular.copy(docsListLocal, doctorElement.doctorsListInTheTable);
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
        if (doctorElement.addNewDoctor.hasOwnProperty('doctorCatName') && doctorElement.addNewDoctor.hasOwnProperty('doctorNameToDisplay')) {
            delete doctorElement.addNewDoctor.doctorCatName;
            delete doctorElement.addNewDoctor.doctorNameToDisplay;
        }
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
                    newDoctorResponse.doctorCatName = getDoctorCategoryNameFromItsId(newDoctorResponse.organizationDoctorCategoryId);
                    newDoctorResponse.doctorNameToDisplay = getDoctorNameFromId(newDoctorResponse.doctorId);
                    if (doctorItemIndex == '' && doctorItemId == '') {
                        doctorElement.doctorsListInTheTable.unshift(newDoctorResponse);
                    } else {
                        doctorElement.doctorsListInTheTable.splice(doctorItemIndex, 1, newDoctorResponse);
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
        doctorEntryInTable.state = 'INACTIVE';
        delete doctorEntryInTable.doctorCatName;
        delete doctorEntryInTable.doctorNameToDisplay;
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
                }
            }
        }, function(deleteDoctorCategoryError) {
            dboticaServices.noConnectivityError();
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
        if (doctorElement.doctorNameForSearch !== '' && doctorElement.doctorNameForSearch !== undefined) {
            var sortedItemsArray = [];
            var sortedDoctorCategoriesArray = [];
            var sortedDoctorNamesArray = [];
            var doctorCategoriesListForSorting = dboticaServices.getDoctorCategoriesList();
            var doctorNamesListForSorting = dboticaServices.getDoctorNames();
            $log.log("doc categories list is----", doctorCategoriesListForSorting);
            $log.log("doc names list is----", doctorNamesListForSorting);
            angular.forEach(doctorCategoriesListForSorting, function(doctorCategoryForSorting) {
                if (doctorCategoryForSorting.state == 'ACTIVE') {
                    var categoryCheck = doctorCategoryForSorting.doctorType.toLowerCase().indexOf(doctorElement.doctorNameForSearch.toLowerCase()) > -1;
                    if (categoryCheck) {
                        angular.forEach(doctorElement.doctorsListInTheTable, function(doctorInTable) {
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
                        angular.forEach(doctorElement.doctorsListInTheTable, function(doctorInTheTable) {
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
        }
    }

    var getDoctorCategoryNameFromItsId = function(doctorCategoryId) {
        var doctorCategoryName = '';
        angular.forEach(doctorElement.allDoctorTypes, function(docTypeEntity) {
            if (docTypeEntity.id == doctorCategoryId) {
                doctorCategoryName = docTypeEntity.doctorType;
            }
        });
        return doctorCategoryName;
    }

    var getDoctorNameFromId = function(docId) {
        var result = '';
        var firstName = '';
        var lastName = '';
        angular.forEach(doctorElement.doctorsListToBeDisplayed, function(docNam) {
            if (docNam.id == docId) {
                $log.log("in name check---");
                firstName = docNam.firstName;
                result = firstName;
                if (docNam.hasOwnProperty('lastName')) {
                    if (docNam.lastName !== '') {
                        result = result + ' ' + docNam.lastName;
                    }
                }
            }
        });
        return result;
    }
}]);

/*angular.module('personalAssistant').filter("doctorCategoryNameFromId", function(dboticaServices) {
    return function(input) {
        var result;
        var doctorCategoriesList = dboticaServices.getDoctorCategoriesList();
        angular.forEach(doctorCategoriesList, function(doctorCategory) {
            if (doctorCategory.id == input) {
                result = doctorCategory.doctorType;
            }
        });
        return result;
    };
});

angular.module('personalAssistant').filter("doctorNameFromDoctorId", function(dboticaServices) {
    return function(input) {
        var result;
        var firstName = '';
        var lastName = '';
        var doctorNamesList = dboticaServices.getDoctorNames();
        angular.forEach(doctorNamesList, function(doctorName) {
            if (doctorName.id == input) {
                firstName = doctorName.firstName;
                result = firstName;
                if (doctorName.hasOwnProperty('lastName')) {
                    if (doctorName.lastName !== '') {
                        result = result + ' ' + doctorName.lastName;
                    }
                }

            }
        });
        return result;
    };
});
*/
