angular.module('personalAssistant').controller('doctorCategoryController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var doctorCategoryElement = this;

    var organizationId = localStorage.getItem('orgId');

    $log.log('in doctor category controller---');



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

    var doctorCategoryItemId = '';
    var doctorCategoryItemIndex = '';
    var entitiesArray = [];
    var entitiesArrayFlag = parseInt(0);

    doctorCategoryElement.doctorCategoryErrorMessage = false;

    doctorCategoryElement.sortTypeOne = 'doctorType';
    doctorCategoryElement.sortTypeTwo = 'description';

    var getDoctorsCategoriesPromise = dboticaServices.getDoctorCategories(organizationId);
    $log.log("get docs promise is----", getDoctorsCategoriesPromise);
    getDoctorsCategoriesPromise.then(function(doctorsCategoriesPromise) {
        angular.element('#mainAdminLiActive').addClass('activeAdminLi');
        var errorCode = doctorsCategoriesPromise.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var doctorCategories = angular.fromJson(doctorsCategoriesPromise.data.response);
            angular.forEach(doctorCategories, function(doctorCategoryEntity) {
                if (doctorCategoryEntity.state == 'ACTIVE') {
                    doctorCategoryElement.doctorCategoriesList.push(doctorCategoryEntity);
                }
            });
            angular.copy(doctorCategoryElement.doctorCategoriesList, entitiesArray);
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
            $log.log("new doctor category is----", doctorCategoryElement.addNewDoctorCategory);
            var addNewDoctorCategoryPromise = dboticaServices.addNewDoctorCategory(doctorCategoryElement.addNewDoctorCategory);
            $log.log("doc promise is----", addNewDoctorCategoryPromise);
            addNewDoctorCategoryPromise.then(function(addNewDoctorSuccess) {
                var errorCode = addNewDoctorSuccess.data.errorCode;
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var addNewDoctorCategorySuccess = angular.fromJson(addNewDoctorSuccess.data.response);
                    if (errorCode == null && addNewDoctorSuccess.data.success == true) {
                        angular.element('#adddoctorCategoryModal').modal('hide');
                        dboticaServices.addNewDoctorCategorySuccessSwal();
                        if (doctorCategoryItemId == '' && doctorCategoryItemIndex == '') {
                            doctorCategoryElement.doctorCategoriesList.unshift(addNewDoctorCategorySuccess);
                            entitiesArray.unshift(addNewDoctorCategorySuccess);
                        } else {
                            doctorCategoryElement.doctorCategoriesList.splice(doctorCategoryItemIndex, 1, addNewDoctorCategorySuccess);
                            var localDoctorCategoryIndex;
                            for (var entityIndex in entitiesArray) {
                                if (entitiesArray[entityIndex].id == addNewDoctorCategorySuccess.id) {
                                    localDoctorCategoryIndex = entityIndex;
                                    break;
                                } else {
                                    continue;
                                }
                            }
                            entitiesArray.splice(localDoctorCategoryIndex, 1, addNewDoctorCategorySuccess);
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
                if (!!errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var deleteDoctorEntitySuccess = angular.fromJson(deleteDoctorSuccess.data.response);
                    $log.log("delete doctor category is----", deleteDoctorEntitySuccess);
                    if (errorCode == null && deleteDoctorSuccess.data.success == true) {
                        dboticaServices.deleteDoctorCategorySuccessSwal();
                        doctorCategoryElement.doctorCategoriesList.splice(index, 1);
                        var localDoctorCategoryIndex;
                        for (var entityIndex in entitiesArray) {
                            if (entitiesArray[entityIndex].id == doctorCategory.id) {
                                localDoctorCategoryIndex = entityIndex;
                                break;
                            } else {
                                continue;
                            }
                        }
                        entitiesArray.splice(localDoctorCategoryIndex, 1);
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
                angular.copy(sortedItemsArray, doctorCategoryElement.doctorCategoriesList);
                entitiesArrayFlag = doctorCategoryElement.inputItemSearch.length;
            }
        }
        if (searchStringLength <= parseInt(2)) {
            entitiesArrayFlag = parseInt(0);
            angular.copy(entitiesArray, doctorCategoryElement.doctorCategoriesList);
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

}]);
