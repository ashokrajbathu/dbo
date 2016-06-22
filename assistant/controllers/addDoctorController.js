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

    var getDoctorTypesPromise = dboticaServices.getDoctorCategories(organizationId);
    $log.log("doc types are----", getDoctorTypesPromise);
    getDoctorTypesPromise.then(function(getDoctorsSuccess) {
        var errorCode = getDoctorsSuccess.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var doctorTypes = [];
            doctorTypes = $.parseJSON(getDoctorsSuccess.data.response);
            for (var docTypeIndex in doctorTypes) {
                if (doctorTypes[docTypeIndex].state == 'ACTIVE') {
                    doctorElement.allDoctorTypes.push(doctorTypes[docTypeIndex]);
                }
            }
            dboticaServices.setDoctorTypes(doctorElement.allDoctorTypes);
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
            doctorsListIs = $.parseJSON(getDoctorsListSuccess.data.response);
            for (var docIndex in doctorsListIs) {
                if (doctorsListIs[docIndex].state == 'ACTIVE') {
                    doctorElement.doctorsListToBeDisplayed.push(doctorsListIs[docIndex]);
                }
            }
            dboticaServices.setDoctorsNames(doctorElement.doctorsListToBeDisplayed);
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
            var docsListInAdmin = $.parseJSON(doctorsListInMainSuccess.data.response);
            $log.log("docs list in admin-----", docsListInAdmin);
            for (var docListIndex in docsListInAdmin) {
                if (docsListInAdmin[docListIndex].state == 'ACTIVE') {
                    doctorElement.doctorsListInTheTable.push(docsListInAdmin[docListIndex]);
                }
            }
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
                var newDoctorResponse = $.parseJSON(addNewDocSuccess.data.response);
                $log.log("new doctor response is----", newDoctorResponse);
                if (errorCode == null && addNewDocSuccess.data.success == true) {
                    dboticaServices.addNewDoctorSuccessSwal();
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
        var deleteDoctorPromise = dboticaServices.addNewDoctorToACategory(doctorEntryInTable);
        deleteDoctorPromise.then(function(deleteDoctorSuccess) {
            var errorCode = deleteDoctorSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var deleteDoctorSuccessEntity = $.parseJSON(deleteDoctorSuccess.data.response);
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
        for (var docCategoryIndex in doctorElement.allDoctorTypes) {
            if (doctorElement.allDoctorTypes[docCategoryIndex].id == localDoctorEntity.organizationDoctorCategoryId) {
                doctorElement.doctorType = doctorElement.allDoctorTypes[docCategoryIndex].doctorType;
            }
        }
        for (var docNameIndex in doctorElement.doctorsListToBeDisplayed) {
            if (doctorElement.doctorsListToBeDisplayed[docNameIndex].id == localDoctorEntity.doctorId) {
                if (doctorElement.doctorsListToBeDisplayed[docNameIndex].lastName == undefined) {
                    doctorElement.doctorsListToBeDisplayed[docNameIndex].lastName = '';
                }
                doctorElement.doctorName = doctorElement.doctorsListToBeDisplayed[docNameIndex].firstName + ' ' + doctorElement.doctorsListToBeDisplayed[docNameIndex].lastName;
            }
        }
        angular.copy(localDoctorEntity, doctorElement.addNewDoctor);
    }

    function doctorSearchInTheTotalList() {
        if (doctorElement.doctorNameForSearch !== '' && doctorElement.doctorNameForSearch !== undefined) {
            var sortedItemsArray = [];
            for (var doctorIndexInSearch in doctorElement.allDoctorTypes) {
                var check = doctorElement.allDoctorTypes[doctorIndexInSearch].roomNo.toLowerCase().indexOf(roomElement.inputItemSearch.toLowerCase()) > -1;
                if (check) {
                    sortedItemsArray.push(roomElement.roomsList[roomIndexInSearch]);
                }
            }
            angular.copy(sortedItemsArray, roomElement.roomsList);
        }
    }
}]);

angular.module('personalAssistant').filter("doctorCategoryNameFromId", function(dboticaServices) {
    return function(input) {
        var result;
        var doctorCategoriesList = dboticaServices.getDoctorCategoriesList();
        for (var categoryIndex in doctorCategoriesList) {
            if (doctorCategoriesList[categoryIndex].id == input) {
                result = doctorCategoriesList[categoryIndex].doctorType;
            }
        }
        return result;
    };
});

angular.module('personalAssistant').filter("doctorNameFromDoctorId", function(dboticaServices) {
    return function(input) {
        var result;
        var firstName = '';
        var lastName = '';
        var doctorNamesList = dboticaServices.getDoctorNames();
        for (var doctorName in doctorNamesList) {
            if (doctorNamesList[doctorName].id == input) {
                firstName = doctorNamesList[doctorName].firstName;
                result = firstName;
                if (doctorNamesList[doctorName].hasOwnProperty('lastName')) {
                    if (doctorNamesList[doctorName].lastName !== '') {
                        result = result + ' ' + doctorNamesList[doctorName].lastName;
                    }
                }
            }
        }
        return result;
    };
});
