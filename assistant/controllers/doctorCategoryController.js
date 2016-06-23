angular.module('personalAssistant').controller('doctorCategoryController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var doctorCategoryElement = this;

    var organizationId = localStorage.getItem('orgId');

    doctorCategoryElement.addNewDoctorCategory = {};
    doctorCategoryElement.doctorCategoriesList = [];
    doctorCategoryElement.addNewDoctorCategoryInModal = addNewDoctorCategoryInModal;
    doctorCategoryElement.deleteDoctorCategory = deleteDoctorCategory;
    doctorCategoryElement.editDoctorCategory = editDoctorCategory;
    doctorCategoryElement.doctorCategorySearch = doctorCategorySearch;

    var doctorCategoryItemId = '';
    var doctorCategoryItemIndex = '';

    var getDoctorsCategoriesPromise = dboticaServices.getDoctorCategories(organizationId);
    $log.log("get docs promise is----", getDoctorsCategoriesPromise);
    getDoctorsCategoriesPromise.then(function(doctorsCategoriesPromise) {
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
        }
    }, function(docotorCategoriesError) {
        dboticaServices.noConnectivityError();
    });

    function addNewDoctorCategoryInModal() {
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
                    dboticaServices.addNewDoctorCategorySuccessSwal();
                    if (doctorCategoryItemId == '' && doctorCategoryItemIndex == '') {
                        doctorCategoryElement.doctorCategoriesList.unshift(addNewDoctorCategorySuccess);
                    } else {
                        doctorCategoryElement.doctorCategoriesList.splice(doctorCategoryItemIndex, 1, addNewDoctorCategorySuccess);
                    }
                }
            }
        }, function(addNewDoctorError) {
            dboticaServices.noConnectivityError();
        });
    }

    function deleteDoctorCategory(doctorCategory, index) {
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
                }
            }

        }, function(deleteDoctorError) {
            dboticaServices.noConnectivityError();
        });
    }

    function editDoctorCategory(doctor, index) {
        doctorCategoryItemIndex = '';
        doctorCategoryItemId = '';
        doctorCategoryItemId = doctor.id;
        doctorCategoryItemIndex = index;
        angular.copy(doctor, doctorCategoryElement.addNewDoctorCategory);
    }

    function doctorCategorySearch() {
        if (doctorCategoryElement.inputItemSearch !== '' && doctorCategoryElement.inputItemSearch !== undefined) {
            var sortedItemsArray = [];
            angular.forEach(doctorCategoryElement.doctorCategoriesList, function(doctorCategoryEntityEle) {
                if (doctorCategoryEntityEle.state == 'ACTIVE') {
                    var check = doctorCategoryEntityEle.doctorType.toLowerCase().indexOf(doctorCategoryElement.inputItemSearch.toLowerCase()) > -1;
                    if (check) {
                        sortedItemsArray.push(doctorCategoryEntityEle);
                    }
                }
            });
            angular.copy(sortedItemsArray, doctorCategoryElement.doctorCategoriesList);
        }
    }
}]);
