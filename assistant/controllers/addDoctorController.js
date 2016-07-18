angular.module('personalAssistant').controller('doctorController', doctorController);
doctorController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function doctorController($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var doctorElement = this;

    var organizationId = localStorage.getItem('orgId');

    doctorElement.doctorTypeSelect = doctorTypeSelect;
    doctorElement.addNewDoctorInModal = addNewDoctorInModal;
    doctorElement.editDoctorInTable = editDoctorInTable;
    doctorElement.deleteDoctorInTable = deleteDoctorInTable;
    doctorElement.doctorSearchInTheTotalList = doctorSearchInTheTotalList;
    doctorElement.phoneNumberValidation = phoneNumberValidation;
    doctorElement.doctorSearchWithPhoneNumber = doctorSearchWithPhoneNumber;
    doctorElement.addNewDoctorByAssistant = addNewDoctorByAssistant;
    doctorElement.specialitySelect = specialitySelect;
    doctorElement.pageChanged = pageChanged;
    doctorElement.addNewDoctorBtn = addNewDoctorBtn;

    doctorElement.allDoctorTypes = [];
    var doctorsListIs = [];
    doctorElement.doctorPhoneNumberSearchTxtBox = true;
    doctorElement.doctorsListToBeDisplayed = [];
    doctorElement.doctorsListInTheTable = [];
    doctorElement.addNewDoctor = {};
    doctorElement.doctorData = {};
    doctorElement.doctorName = '';
    doctorElement.doctorData.firstName = '';
    doctorElement.doctorData.lastName = '';
    doctorElement.doctorData.phoneNumber = '';
    doctorElement.doctorData.userName = '';
    doctorElement.doctorData.emailid = '';
    doctorElement.doctorData.doctorRegistrationNo = '';
    doctorElement.doctorData.organization = '';
    doctorElement.doctorData.password = '';
    doctorElement.doctorData.qualification = '';
    doctorElement.doctorData.city = '';
    doctorElement.doctorType = '';
    doctorElement.doctorName = '';
    doctorElement.doctorActiveId = '';
    doctorElement.doctorSearch = true;
    doctorElement.addNewDoctorForm = false;
    var doctorItemIndex = '';
    var doctorItemId = '';
    doctorElement.doctorSearchInTxtBox = '';
    doctorElement.phoneNumberBtn = true;
    doctorElement.phoneNumberErrorMessage = false;
    doctorElement.newDoctorDetails = false;
    doctorElement.asteriskErrorMessage = false;
    doctorElement.doctorDetailsErrorMessage = false;
    doctorElement.specialityName = 'Cardiologist';
    doctorElement.optionsForSpeciality = [{ 'name': 'Dentist' },
        { 'name': 'ENT Specialist' },
        { 'name': 'Pediatrician' },
        { 'name': 'Neurosurgeon' },
        { 'name': 'Psychiatrist' },
        { 'name': 'Vascular Surgeon' },
        { 'name': 'Cardiologist' },
        { 'name': 'Endocrinologist' },
        { 'name': 'Neurologist' },
        { 'name': 'Pulmonologist' },
        { 'name': 'General Medicine' },
        { 'name': 'General Surgeon' },
        { 'name': 'Gastroenterologist' },
        { 'name': 'Nephrologist' },
        { 'name': 'Diabetologist' },
        { 'name': 'Urologist' },
        { 'name': 'Gynecologist / Obstetrician' },
        { 'name': 'Dermatologist' },
        { 'name': 'Oncologist' },
        { 'name': 'Orthopedic Surgeon' },
        { 'name': 'Immunologist' },
        { 'name': 'Ophthalmologist' },
        { 'name': 'Audiologist' },
        { 'name': 'General Physician' },
        { 'name': 'Cosmetic Surgeon' },
        { 'name': 'Physiotherapist' },
        { 'name': 'Bariactric Specialist' },
        { 'name': 'Homoeopathy' },
        { 'name': 'Colorectal Specialist' },
        { 'name': 'Ayurveda' },
        { 'name': 'Andrologist' },
        { 'name': 'Ayurveda Specialist' },
        { 'name': 'Yoga Specialist' },
        { 'name': 'IVF Specialist' },
        { 'name': 'Acupuncturist' },
        { 'name': 'Bariatric Specialist' },
        { 'name': 'Psychotherapist' },
        { 'name': 'Pediatrician' },
        { 'name': 'Immunologist' }
    ]


    doctorElement.sortTypeOne = 'doctorType';
    doctorElement.sortTypeTwo = 'firstName';

    var entitiesArray = [];
    var entitiesArrayFlag = parseInt(0);

    doctorElement.currentPage = 1;
    doctorElement.itemsPerPage = 3;
    var displayArray = [];

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);



    var getDoctorTypesPromise = dboticaServices.getDoctorCategories(organizationId);
    getDoctorTypesPromise.then(function(getDoctorsSuccess) {
        var errorCode = getDoctorsSuccess.data.errorCode;
        if (errorCode) {
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
        if (errorCode) {
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
        }
    }, function(getDoctorsListError) {
        dboticaServices.noConnectivityError();
    });

    var doctorsListInAdminPromise = dboticaServices.doctorsListInMainAdmin(organizationId);
    doctorsListInAdminPromise.then(function(doctorsListInMainSuccess) {
        var errorCode = doctorsListInMainSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage();
        } else {
            var docsListInAdmin = angular.fromJson(doctorsListInMainSuccess.data.response);
            var docsListLocal = [];
            docsListLocal = _.filter(docsListInAdmin, function(entity) {
                return entity.state == 'ACTIVE';
            });
            doctorElement.totalItems = docsListLocal.length;
            angular.copy(docsListLocal, doctorElement.doctorsListInTheTable);
            angular.copy(docsListLocal, entitiesArray);
            displayArray = _.chunk(entitiesArray, doctorElement.itemsPerPage);
            angular.copy(displayArray[0], doctorElement.doctorsListInTheTable);
        }
    }, function(doctorsListInMainError) {
        dboticaServices.noConnectivityError();
    });

    function addNewDoctorBtn() {
        doctorElement.doctorPhoneNumberSearchTxtBox = true;
        doctorElement.newDoctorDetails = false;
        doctorElement.addNewDoctorForm = false;
    }

    function doctorSearchWithPhoneNumber() {
        doctorElement.doctorPhoneNumberSearchTxtBox = true;
        var doctorsOfAssistantPromise = dboticaServices.doctorsOfAssistant();
        var doctorIdActive = '';
        var doctorActive = null;
        doctorsOfAssistantPromise.then(function(doctorsSuccess) {
            var errorCode = doctorsSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var doctorsListResponse = angular.fromJson(doctorsSuccess.data.response);
                for (var doctorIndex in doctorsListResponse) {
                    if (doctorsListResponse[doctorIndex].phoneNumber == doctorElement.doctorSearchInTxtBox) {
                        doctorActive = doctorsListResponse[doctorIndex];
                        break;
                    }
                }
                if (angular.isObject(doctorActive)) {
                    doctorElement.newDoctorDetails = false;
                    doctorElement.addNewDoctorForm = true;
                    doctorElement.addNewDoctor.doctorId = doctorsListResponse[0].id;
                    doctorElement.doctorName = doctorsListResponse[0].firstName;
                    doctorElement.addNewDoctor.phoneNumber = doctorsListResponse[0].phoneNumber;
                    if (doctorsListResponse[0].hasOwnProperty('lastName')) {
                        doctorElement.doctorName = doctorElement.doctorName + ' ' + doctorsListResponse[0].lastName;
                    }
                } else {
                    doctorElement.newDoctorDetails = true;
                    doctorElement.doctorDetailsErrorMessage = true;
                    doctorElement.doctorData.phoneNumber = doctorElement.doctorSearchInTxtBox;
                }
            }
        }, function(doctorsError) {
            dboticaServices.noConnectivityError();
        });
    }

    function phoneNumberValidation() {
        if (doctorElement.doctorSearchInTxtBox !== '' && doctorElement.doctorSearchInTxtBox !== undefined) {
            var phoneNumberLength = doctorElement.doctorSearchInTxtBox.length;
            if (phoneNumberLength < parseInt(10) || phoneNumberLength > parseInt(10)) {
                doctorElement.phoneNumberErrorMessage = true;
                doctorElement.phoneNumberBtn = true;
            } else {
                doctorElement.phoneNumberErrorMessage = false;
                doctorElement.phoneNumberBtn = false;
            }
        } else {
            doctorElement.phoneNumberErrorMessage = false;
            doctorElement.phoneNumberBtn = true;
        }
    }

    function doctorTypeSelect(doctorTypeEntity) {
        doctorElement.doctorType = doctorTypeEntity.doctorType;
        doctorElement.addNewDoctor.organizationDoctorCategoryId = doctorTypeEntity.id;
    }

    function addNewDoctorInModal() {
        if (doctorItemIndex == '' && doctorItemId == '') {
            doctorElement.addNewDoctor.organizationId = organizationId;
        }
        var addNewDoctorPromise = dboticaServices.addNewDoctorToACategory(doctorElement.addNewDoctor);
        addNewDoctorPromise.then(function(addNewDocSuccess) {
            var errorCode = addNewDocSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var newDoctorResponse = angular.fromJson(addNewDocSuccess.data.response);
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

    /*function doctorSelectFromDropDown(doctorEntityFromDropdown) {
        if (doctorEntityFromDropdown.lastName == undefined) {
            doctorEntityFromDropdown.lastName = '';
        }
        doctorElement.doctorName = doctorEntityFromDropdown.firstName + ' ' + doctorEntityFromDropdown.lastName;
        doctorElement.addNewDoctor.doctorId = doctorEntityFromDropdown.id;
    }*/

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
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var deleteDoctorSuccessEntity = angular.fromJson(deleteDoctorSuccess.data.response);
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
        doctorElement.newDoctorDetails = false;
        doctorElement.addNewDoctorForm = true;
        doctorElement.doctorPhoneNumberSearchTxtBox = false;
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

    function addNewDoctorByAssistant() {
        doctorElement.doctorDetailsErrorMessage = false;
        var check = textCheck(doctorElement.doctorData.firstName) && textCheck(doctorElement.doctorData.emailId) && textCheck(doctorElement.doctorData.phoneNumber) && textCheck(doctorElement.doctorData.password);
        if (check === true) {
            doctorElement.asteriskErrorMessage = false;
            var newDoctorEntity = {};
            newDoctorEntity.firstName = doctorElement.doctorData.firstName;
            newDoctorEntity.lastName = '';
            newDoctorEntity.emailId = doctorElement.doctorData.emailId;
            newDoctorEntity.userName = doctorElement.doctorData.userName;
            newDoctorEntity.password = doctorElement.doctorData.password;
            newDoctorEntity.city = doctorElement.doctorData.city;
            newDoctorEntity.speciality = doctorElement.specialityName;
            newDoctorEntity.qualification = doctorElement.doctorData.qualification;
            newDoctorEntity.doctorRegistrationNo = doctorElement.doctorData.doctorRegistrationNo;
            newDoctorEntity.organization = doctorElement.doctorData.organization;
            var newDoctorPromise = dboticaServices.newDoctorByAssistant(newDoctorEntity);
            $log.log('add new doctor promise is----', newDoctorPromise);
            newDoctorPromise.then(function(newDoctorSuccess) {
                var errorCode = newDoctorSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var newDoctorDetails = angular.fromJson(newDoctorSuccess.data.response);
                    if (errorCode == null && newDoctorSuccess.data.success == true) {
                        doctorElement.addNewDoctorForm = true;
                        doctorElement.newDoctorDetails = false;
                    }
                }
            }, function(newDoctorError) {
                dboticaServices.noConnectivityError();
            });
        } else {
            doctorElement.asteriskErrorMessage = true;
        }
    }

    var textCheck = function(textValueIs) {
        var result;
        if (textValueIs !== undefined && textValueIs !== null && textValueIs !== '') {
            result = true;
        } else {
            result = false;
        }
        return result;
    }

    function specialitySelect(specialitySelected) {
        doctorElement.specialityName = specialitySelected.name;
    }

    function pageChanged() {
        var requiredIndex = doctorElement.currentPage - 1;
        var localArray = [];
        displayArray = [];
        displayArray = _.chunk(entitiesArray, doctorElement.itemsPerPage);
        localArray = displayArray[requiredIndex];
        angular.copy(localArray, doctorElement.doctorsListInTheTable);
    }
};
