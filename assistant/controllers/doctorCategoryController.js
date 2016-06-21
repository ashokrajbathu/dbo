angular.module('personalAssistant').controller('doctorCategoryController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var doctorCategoryElement = this;

    var organizationId = localStorage.getItem('orgId');

    doctorCategoryElement.addNewDoctorCategory = {};
    doctorCategoryElement.doctorCategoriesList = [];
    doctorCategoryElement.addNewDoctorCategoryInModal = addNewDoctorCategoryInModal;
    doctorCategoryElement.deleteDoctorCategory = deleteDoctorCategory;
    doctorCategoryElement.editDoctorCategory = editDoctorCategory;

    var doctorCategoryItemId = '';
    var doctorCategoryItemIndex = '';

    var getDoctorsCategoriesPromise = dboticaServices.getDoctorCategories(organizationId);
    $log.log("get docs promise is----", getDoctorsCategoriesPromise);
    getDoctorsCategoriesPromise.then(function(doctorsCategoriesPromise) {
        var errorCode = doctorsCategoriesPromise.data.errorCode;
        if (!!errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var doctorCategories = $.parseJSON(doctorsCategoriesPromise.data.response);
            for (var doctorCategoryIndex in doctorCategories) {
                if (doctorCategories[doctorCategoryIndex].state == 'ACTIVE') {
                    doctorCategoryElement.doctorCategoriesList.push(doctorCategories[doctorCategoryIndex]);
                }
            }
        }
    }, function(docotorCategoriesError) {
        dboticaServices.noConnectivityError();
    });

    function addNewDoctorCategoryInModal() {
        doctorCategoryElement.addNewDoctorCategory.organizationId = organizationId;
        $log.log("new doctor category is----", doctorCategoryElement.addNewDoctorCategory);
        var addNewDoctorCategoryPromise = dboticaServices.addNewDoctorCategory(doctorCategoryElement.addNewDoctorCategory);
        $log.log("doc promise is----", addNewDoctorCategoryPromise);
        addNewDoctorCategoryPromise.then(function(addNewDoctorSuccess) {
            var errorCode = addNewDoctorSuccess.data.errorCode;
            if (!!errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var addNewDoctorCategorySuccess = $.parseJSON(addNewDoctorSuccess.data.response);
                if (errorCode == null && addNewDoctorSuccess.data.success == true) {
                    dboticaServices.addNewDoctorCategorySuccessSwal();
                    doctorCategoryElement.doctorCategoriesList.unshift(addNewDoctorCategorySuccess);
                }
            }
        }, function(addNewDoctorError) {

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
                var deleteDoctorEntitySuccess = $.parseJSON(deleteDoctorSuccess.data.response);
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

    }


}]);
