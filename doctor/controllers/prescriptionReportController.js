angular.module('doctor').controller('prescriptionReportController', prescriptionReportController);
prescriptionReportController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function prescriptionReportController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'prescriptionReport');
    var prescriptionReport = this;
    prescriptionReport.deleteDrugOrTest = deleteDrugOrTest;
    prescriptionReport.newPatient = newPatient;
    prescriptionReport.patientHeight = false;
    prescriptionReport.patientWeight = false;
    prescriptionReport.patientBMI = false;
    prescriptionReport.patientBloodPressure = false;
    prescriptionReport.patientTemperature = false;
    prescriptionReport.patientPulse = false;
    prescriptionReport.patientSaturation = false;
    prescriptionReport.patientrevisitOn = false;
    prescriptionReport.patientReferTo = false;
    prescriptionReport.patientSymptoms = false;
    prescriptionReport.patientInvestigation = false;
    prescriptionReport.patientComments = false;
    angular.element('#drugPrescriptionActive').addClass('activeDoctorLi');
    prescriptionReport.prescriptionActive = {};
    var activePrescription = localStorage.getItem('prescriptionObjectToPrint');
    var activePrescriptionId = localStorage.getItem('activePrescriptionId');
    prescriptionReport.prescriptionActive = angular.fromJson(activePrescription);
    if (_.isEmpty(prescriptionReport.prescriptionActive)) {
        localStorage.clear();
        localStorage.setItem('isLoggedInDoctor', 'false');
        $state.go('login');
    } else {
        $log.log('active prescription id is------', activePrescriptionId);
        var currentPrescriptionPromise = doctorServices.getCurrentActivePrescription(activePrescriptionId);
        $log.log('current prescription promise is-----', currentPrescriptionPromise);
        currentPrescriptionPromise.then(function(currentPrescSuccess) {
            var errorCode = currentPrescSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                var currentPrescriptionResponse = angular.fromJson(currentPrescSuccess.data.response);
                $log.log('prescription response is--------', currentPrescriptionResponse);
            }
        }, function(currentPrescError) {
            doctorServices.noConnectivityError();
        });
        var prescDetails = prescriptionReport.prescriptionActive.prescriptionToPrint;
        prescriptionReport.drugsList = prescriptionReport.prescriptionActive.drugListToDisplay;
        prescriptionReport.testsListInTable = prescriptionReport.prescriptionActive.testsListToDisplay;
        if (!_.isEmpty(prescDetails.height)) {
            prescriptionReport.patientHeight = true;
            prescriptionReport.height = prescDetails.height;
        }
        if (!_.isEmpty(prescDetails.weight)) {
            prescriptionReport.patientWeight = true;
            prescriptionReport.weight = prescDetails.weight;
        }
        if (!_.isEmpty(prescDetails.bmi)) {
            prescriptionReport.patientBMI = true;
            prescriptionReport.bmi = prescDetails.bmi;
        }
        if (!_.isEmpty(prescDetails.bloodPressure)) {
            prescriptionReport.patientBloodPressure = true;
            prescriptionReport.bloodPressure = prescDetails.bloodPressure;
        }
        if (!_.isEmpty(prescDetails.temperature)) {
            prescriptionReport.patientTemperature = true;
            prescriptionReport.temperature = prescDetails.temperature;
        }
        if (!_.isEmpty(prescDetails.pulse)) {
            prescriptionReport.patientPulse = true;
            prescriptionReport.pulse = prescDetails.pulse;
        }
        if (!_.isEmpty(prescDetails.saturation)) {
            prescriptionReport.patientSaturation = true;
            prescriptionReport.saturation = prescDetails.saturation;
        }
        if (!_.isEmpty(prescDetails.revisitDate)) {
            prescriptionReport.patientrevisitOn = true;
            prescriptionReport.revisitOn = prescDetails.revisitDate;
        }
        if (!_.isEmpty(prescDetails.references)) {
            prescriptionReport.patientReferTo = true;
            prescriptionReport.referTo = prescDetails.references;
        }
        if (!_.isEmpty(prescDetails.symptoms)) {
            prescriptionReport.patientSymptoms = true;
            prescriptionReport.symptoms = prescDetails.symptoms;
        }
        if (!_.isEmpty(prescDetails.investigation)) {
            prescriptionReport.patientInvestigation = true;
            prescriptionReport.investigation = prescDetails.investigation;
        }
        if (!_.isEmpty(prescDetails.remarks)) {
            prescriptionReport.patientComments = true;
            prescriptionReport.comments = prescDetails.remarks;
        }
    }

    function deleteDrugOrTest(drugOrTest, drugOrTestEntity, index) {
        switch (drugOrTest) {
            case 'drug':
                prescriptionReport.prescriptionActive.prescriptionToPrint.drugDosage.splice(index, 1);
                break;
            case 'test':
                prescriptionReport.prescriptionActive.prescriptionToPrint.diagnosisTests.splice(index, 1);
                break;
        }
        var updatePrescriptionPromise = doctorServices.addPrescription(prescriptionReport.prescriptionActive.prescriptionToPrint);
        updatePrescriptionPromise.then(function(updatePrescriptionSuccess) {
            var errorCode = updatePrescriptionSuccess.data.errorCode;
            if (errorCode) {
                doctorServices.logoutFromThePage(errorCode);
            } else {
                var updatePrescResponse = angular.fromJson(updatePrescriptionSuccess.data.response);
                if (errorCode == null && updatePrescriptionSuccess.data.success == true) {
                    if (drugOrTest == 'drug') {
                        prescriptionReport.drugsList.splice(index, 1);
                    } else {
                        prescriptionReport.testsListInTable.splice(index, 1);
                    }
                    var updatedPrescriptionActive = {};
                    updatedPrescriptionActive.prescriptionToPrint = updatePrescResponse;
                    updatedPrescriptionActive.drugListToDisplay = prescriptionReport.drugsList;
                    updatedPrescriptionActive.testsListToDisplay = prescriptionReport.testsListInTable;
                    localStorage.setItem('prescriptionObjectToPrint', JSON.stringify(updatedPrescriptionActive));
                }
            }
        }, function(updatePrescriptionError) {
            doctorServices.noConnectivityError();
        });
    }

    function newPatient() {
        $state.go('doctorHome.drugPrescription');
    }
}
