angular.module('personalAssistant').controller('insuranceController', insuranceController);
insuranceController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert'];

function insuranceController($scope, $log, dboticaServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentState', 'insurance');
    var insurance = this;

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);
    insurance.patientSearch = patientSearch;
    insurance.patientsList = [];
    var activePatient = {};
    insurance.patientCases = [];
    insurance.invoicesList = [];
    insurance.invoicesTable = false;
    insurance.prescriptionsInModal = [];
    insurance.patientPhoneNumber = '';
    insurance.insuranceType = 'TYPE_1';
    insurance.insuranceName = 'NAME_1';
    insurance.patientPhoneNumber = '';
    insurance.primaryRelation = 'SELF';
    insurance.primaryPatientName = '';
    insurance.insuranceCompany = '';
    insurance.viewBillsLink = false;
    insurance.displaySelectedCaseNumber = '---Select Case Number---';
    insurance.insuranceReferenceNo = '';
    insurance.numberErrorMessage = false;
    insurance.disableSearchBtn = true;
    insurance.viewPrescriptionsLink = false;
    insurance.patientNumberValidation = patientNumberValidation;
    insurance.selectPatient = selectPatient;
    insurance.selectCaseNumber = selectCaseNumber;
    insurance.registerInsurance = registerInsurance;

    /*var b;
    var a = 9;
    b = a;
    console.log('kjscksjxc--', a);
    console.log('kcnkxjnc----', b);
    a = 10;
    console.log('kjsckkvjnxkjvxsjxc--', a);
    console.log('kcnkxjskjfkjxvnc----', b);

    insurance.obj1 = { name: 'ravi' };
    insurance.obj2 = {};
    insurance.obj2=insurance.obj1;
    console.log('sjdfbdskj---', insurance.obj1);
    console.log('skjcxjkv----', insurance.obj2);
    insurance.obj1.age = '25';
    console.log('sjdfbdskj---', insurance.obj1);
    console.log('skjcxjkv----', insurance.obj2);*/

    /*$anchorScroll-when called it scrolls to the element related to the specified hash or to the current value of $location.hash()
    dependencies are $window,$location,$rootScope

    when called it scrolls to the element related to the specified hash or to the current value of $location.hash()
    $animate.on(event,container,function callback(element,phase))-this provides support for the animation.
    event is the animation event that will be captured
    container-the container element that will capture each of the animation events.
    $animate.off(event,[container],[callback]);
    A jQuery wrapper for browsers window.document object-$document
    var text=$filter('uppercase')($scope.originalText);
    $interval - angulars wrapper for window.setInterval
    $interval(fn,delay,[count])
    fn a function that should be called repeatedly
    delay-number of milliseconds between each functional call
    $location service parses the URL in the browser address bar and makes URL available for your application
    changes to the url in the address bar are reflected into $location service and changes to the $location are reflected into the browser address bar
    A service that helps you run functions asynchronously and use there return values when they are done processing.
    A deferred object is simply an object that exposes a promise as well as associated methods for resolving that promise.*/

    function patientSearch() {
        var patientSearchPromise = dboticaServices.getInPatientsWithPhoneNumber(insurance.patientPhoneNumber);
        $log.log('patient search response----', patientSearchPromise);
        patientSearchPromise.then(function(patientSuccess) {
            var errorCode = patientSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                patientSearchResponse = angular.fromJson(patientSuccess.data.response);
                $log.log('search----------', patientSearchResponse);
                if (errorCode == null && patientSuccess.data.success) {
                    angular.copy(patientSearchResponse, insurance.patientsList);
                }
            }
        }, function(patientSearchError) {
            dboticaServices.noConnectivityError();
        });
    }

    function selectPatient(patientEntity) {
        angular.element('#registrationModal').modal('hide');
        $log.log('selected patient is-----', patientEntity);
        angular.copy(patientEntity, activePatient);
        var getCaseHistoryPromise = dboticaServices.getPatientCaseHistory(activePatient.patientDetail.id);
        $log.log('case promise is----', getCaseHistoryPromise);
        getCaseHistoryPromise.then(function(getCaseSuccess) {
            var errorCode = getCaseSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var getCaseResponse = angular.fromJson(getCaseSuccess.data.response);
                $log.log('case response is----', getCaseResponse);
                if (errorCode == null && getCaseSuccess.data.success) {
                    angular.copy(getCaseResponse, insurance.patientCases);
                }
            }
        }, function(getCaseError) {
            dboticaServices.noConnectivityError();
        });
    }

    function registerInsurance() {
        var check = insurance.insuranceReferenceNo !== '' && insurance.insuranceCompany !== '' && insurance.primaryPatientName !== '' && insurance.primaryRelation !== '' && insurance.patientPhoneNumber !== '';
        if (check) {
            var registerInsuranceRequest = {};
            registerInsuranceRequest.patientId = activePatient.patientDetail.id;
            registerInsuranceRequest.patientName = insurance.patientName;
            registerInsuranceRequest.organizationCaseId = activePatient.organizationCaseId;
            registerInsuranceRequest.organizationCaseNo = activePatient.organizationCaseNo;
            registerInsuranceRequest.insuranceType = insurance.insuranceType;
            registerInsuranceRequest.insuranceName = insurance.insuranceName;
            registerInsuranceRequest.insuranceReferenceNo = insurance.insuranceReferenceNo;
            registerInsuranceRequest.insuranceCompany = insurance.insuranceCompany;
            registerInsuranceRequest.primaryPatientName = insurance.primaryPatientName;
            registerInsuranceRequest.primaryRelation = insurance.primaryRelation;
            registerInsuranceRequest.patientPhoneNumber = insurance.patientPhoneNumber;
            registerInsuranceRequest.organizationPatientId = activePatient.id;
            $log.log('request is------', registerInsuranceRequest);
            var registerInsurancePromise = dboticaServices.registerPatientInsurance(registerInsuranceRequest);
            $log.log('insurance promise is-------', registerInsurancePromise);
            registerInsurancePromise.then(function(insuranceSuccess) {
                var errorCode = insuranceSuccess.data.errorCode;
                if (errorCode) {
                    dboticaServices.logoutFromThePage(errorCode);
                } else {
                    var insuranceResponse = angular.fromJson(insuranceSuccess.data.response);
                    $log.log('insurance response is-----', insuranceResponse);
                    if (errorCode == null && insuranceSuccess.data.success) {
                        dboticaServices.insuranceSuccessSwal();
                        insurance.patientsList = [];
                        activePatient = {};
                        insurance.disableSearchBtn = true;
                        insurance.patientPhoneNumber = '';
                        insurance.insuranceType = 'TYPE_1';
                        insurance.insuranceName = 'NAME_1';
                        insurance.patientPhoneNumber = '';
                        insurance.primaryRelation = 'SELF';
                        insurance.primaryPatientName = '';
                        insurance.insuranceCompany = '';
                        insurance.insuranceReferenceNo = '';
                    }
                }
            }, function(insuranceError) {
                dboticaServices.noConnectivityError();
            });

        } else {
            dboticaServices.templateMandatoryFieldsSwal();
        }
    }

    function selectCaseNumber(caseEntity) {
        if (caseEntity.organizationCaseNo !== '---Select Case Number---') {
            $log.log('in select---');
            insurance.viewPrescriptionsLink = true;
            insurance.viewBillsLink = true;
            insurance.displaySelectedCaseNumber = caseEntity.organizationCaseNo + '-' + dboticaServices.longDateToReadableDate(caseEntity.lastUpdated);
            getPrescriptionsOfCaseNumber(caseEntity);
            getInvoicesOfCaseNumber(caseEntity);
        } else {
            insurance.viewPrescriptionsLink = false;
            insurance.viewBillsLink = false;
            insurance.displaySelectedCaseNumber = '---Select Case Number---';
        }
    }

    function getInvoicesOfCaseNumber(caseEntry) {
        var invoicesPromise = dboticaServices.getInvoicesWithCaseId(caseEntry.id);
        $log.log('invoices promise is------', invoicesPromise);
        invoicesPromise.then(function(invoiceSuccess) {
            var errorCode = invoiceSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var invoiceResponse = angular.fromJson(invoiceSuccess.data.response);
                $log.log('resp is-----', invoiceResponse);
                if (errorCode == null && invoiceSuccess.data.success) {
                    angular.copy(invoiceResponse, insurance.invoicesList);
                }
            }
        }, function(invoiceError) {
            dboticaServices.noConnectivityError();
        })
    }

    function getPrescriptionsOfCaseNumber(caseEntity) {
        var prescriptionsPromise = dboticaServices.getPrescriptionsOfCase(caseEntity.id);
        var localPrescriptions = [];
        $log.log('presc promise is------', prescriptionsPromise);
        prescriptionsPromise.then(function(prescriptionSuccess) {
            var errorCode = prescriptionSuccess.data.errorCode;
            if (errorCode) {
                dboticaServices.logoutFromThePage(errorCode);
            } else {
                var prescriptionResponse = angular.fromJson(prescriptionSuccess.data.response);
                $log.log('presc response is------', prescriptionResponse);
                if (errorCode == null && prescriptionSuccess.data.success) {
                    insurance.viewPrescriptionsLink = true;
                    angular.forEach(prescriptionResponse, function(entity) {
                        if (entity.prescription.state == 'ACTIVE') {
                            var localPrescription = {};
                            localPrescription.lastUpdated = entity.prescription.lastUpdated;
                            localPrescription.prescriptionEntities = [];
                            localPrescription.diagnosisTests = {};
                            localPrescription.drugDosage = {};
                            localPrescription.drugDosage.drugsList = [];
                            if (entity.organizationTemplateInstance.length > 0) {
                                angular.forEach(entity.organizationTemplateInstance, function(instanceEntity) {
                                    var localFieldValues = [];
                                    localFieldValues = angular.fromJson(instanceEntity.templateValues);
                                    angular.forEach(localFieldValues, function(fieldEntity) {
                                        var localObject = {};
                                        if (fieldEntity.description !== '' && fieldEntity.fieldType !== 'CHECK_BOX') {
                                            localObject.name = fieldEntity.name;
                                            localObject.value = fieldEntity.description;
                                            localPrescription.prescriptionEntities.push(localObject);
                                        }
                                        if (fieldEntity.fieldType == 'CHECK_BOX') {
                                            localObject.name = fieldEntity.name;
                                            var arr = [];
                                            angular.forEach(fieldEntity.restrictValues, function(restrictEntity) {
                                                if (restrictEntity.checkBoxValue) {
                                                    arr.push(restrictEntity.name);
                                                }
                                            });
                                            localObject.value = arr.join(',');
                                            localPrescription.prescriptionEntities.push(localObject);
                                        }
                                    });
                                });
                            }
                            if (_.has(entity.prescription, 'weight') && !_.isEmpty(entity.prescription.weight)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Weight', entity.prescription.weight));
                            }
                            if (_.has(entity.prescription, 'age') && !_.isEmpty(entity.prescription.age)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Age', entity.prescription.age));
                            }
                            if (_.has(entity.prescription, 'bloodPressure') && !_.isEmpty(entity.prescription.bloodPressure)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Blood Pressure', entity.prescription.bloodPressure));
                            }
                            if (_.has(entity.prescription, 'bmi') && !_.isEmpty(entity.prescription.bmi)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Body Mass Index', entity.prescription.bmi));
                            }
                            if (_.has(entity.prescription, 'height') && !_.isEmpty(entity.prescription.height)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Height', entity.prescription.height));
                            }
                            if (_.has(entity.prescription, 'investigation') && !_.isEmpty(entity.prescription.investigation)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Investigation', entity.prescription.investigation));
                            }
                            if (_.has(entity.prescription, 'organizationCaseNo') && !_.isEmpty(entity.prescription.organizationCaseNo)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Case Number', entity.prescription.organizationCaseNo));
                            }
                            if (_.has(entity.prescription, 'pulse') && !_.isEmpty(entity.prescription.pulse)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Pulse', entity.prescription.pulse));
                            }
                            if (_.has(entity.prescription, 'references') && !_.isEmpty(entity.prescription.references)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Reference Doctor', entity.prescription.references));
                            }
                            if (_.has(entity.prescription, 'remarks') && !_.isEmpty(entity.prescription.remarks)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Remarks', entity.prescription.remarks));
                            }
                            if (_.has(entity.prescription, 'revisitDate') && !_.isEmpty(entity.prescription.revisitDate)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Revisit Date', entity.prescription.revisitDate));
                            }
                            if (_.has(entity.prescription, 'saturation') && !_.isEmpty(entity.prescription.saturation)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Saturation', entity.prescription.saturation));
                            }
                            if (_.has(entity.prescription, 'symptoms') && !_.isEmpty(entity.prescription.symptoms)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Symptoms', entity.prescription.symptoms));
                            }
                            if (_.has(entity.prescription, 'temperature') && !_.isEmpty(entity.prescription.temperature)) {
                                localPrescription.prescriptionEntities.push(dboticaServices.getLocalObject('Temperature', entity.prescription.temperature));
                            }
                            if (_.has(entity.prescription, 'diagnosisTests') && !_.isEmpty(entity.prescription.diagnosisTests)) {
                                localPrescription.diagnosisTests.name = 'Medical Tests';
                                localPrescription.diagnosisTests.tests = entity.prescription.diagnosisTests;
                            }
                            if (_.has(entity.prescription, 'drugDosage') && !_.isEmpty(entity.prescription.drugDosage)) {
                                localPrescription.drugDosage.name = 'Medicines';
                                angular.forEach(entity.prescription.drugDosage, function(drugEntry) {
                                    localPrescription.drugDosage.drugsList.push(dboticaServices.getDrugList(drugEntry));
                                });
                            }
                            $log.log('local prescription value is----', localPrescription);
                            localPrescriptions.push(localPrescription);
                        }
                    });
                    angular.copy(localPrescriptions, insurance.prescriptionsInModal);
                }
            }
        }, function(prescriptionError) {
            dboticaServices.noConnectivityError();
        });
    }

    function patientNumberValidation() {
        var phoneNumber = insurance.patientPhoneNumber;
        if (phoneNumber !== undefined && phoneNumber !== null && phoneNumber !== "") {
            if (phoneNumber.length < 10) {
                insurance.disableSearchBtn = true;
                if (phoneNumber.length == 0) {
                    insurance.numberErrorMessage = false;
                } else {
                    insurance.numberErrorMessage = true;
                }
            } else {
                if (phoneNumber.length == 10) {
                    insurance.disableSearchBtn = false;
                    insurance.numberErrorMessage = false;
                } else {
                    insurance.disableSearchBtn = true;
                    insurance.numberErrorMessage = true;
                }
            }
        } else {
            insurance.numberErrorMessage = false;
            insurance.disableSearchBtn = true;
        }
    }
}
