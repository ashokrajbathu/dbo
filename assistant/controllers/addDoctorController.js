angular.module('personalAssistant').controller('doctorController', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var doctorElement = this;

    var organizationId = localStorage.getItem('orgId');

    doctorElement.doctorTypeSelect = doctorTypeSelect;
    doctorElement.addNewDoctorInModal = addNewDoctorInModal;
    doctorElement.doctorSelectFromDropDown = doctorSelectFromDropDown;

    doctorElement.allDoctorTypes = [];
    var doctorsListIs = [];
    doctorElement.doctorsListToBeDisplayed = [];
    doctorElement.addNewDoctor = {};
    doctorElement.doctorType = '';
    doctorElement.doctorName = '';
    doctorElement.doctorActiveId = '';

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
        }
    }, function(doctorsListInMainError) {

    });

    function doctorTypeSelect(doctorTypeEntity) {
        doctorElement.doctorType = doctorTypeEntity.doctorType;
        doctorElement.addNewDoctor.organizationDoctorCategoryId = doctorTypeEntity.id;
    }

    function addNewDoctorInModal() {
        doctorElement.addNewDoctor.organizationId = organizationId;
        doctorElement.addNewDoctor.doctorId = doctorElement.doctorActiveId;
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
                }
            }
        }, function(addNewDocError) {
            dboticaServices.noConnectivityError();
        });
    }

    function doctorSelectFromDropDown(doctorEntityFromDropdown) {
        if (doctorEntityFromDropdown.lastName == undefined) {
            doctorEntityFromDropdown.lastName = '';
        }
        doctorElement.doctorName = doctorEntityFromDropdown.firstName + ' ' + doctorEntityFromDropdown.lastName;
        doctorElement.doctorActiveId = doctorEntityFromDropdown.id;
    }
}]);
