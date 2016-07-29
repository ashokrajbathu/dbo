angular.module('doctor').controller('referDboticaController', referDboticaController);
referDboticaController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function referDboticaController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    localStorage.setItem('currentDoctorState', 'referDbotica');
    var refer = this;
    refer.referDoctor = {};
    refer.referDoctor.doctorName = '';
    refer.referDoctor.emailId = '';
    refer.referDoctor.phoneNumber = '';
    refer.referADoctor = referADoctor;

    function referADoctor() {
        if (refer.referDoctor.doctorName == '' || (refer.referDoctor.emailId == '' && refer.referDoctor.phoneNumber == '')) {
            doctorServices.referDetailsErrorSwal();
        } else {
            var referDoctorPromise = doctorServices.referDoctorToDbotica(refer.referDoctor);
            referDoctorPromise.then(function(referSuccess) {
                var errorCode = referSuccess.data.errorCode;
                if (errorCode) {
                    doctorServices.logoutFromThePage(errorCode);
                } else {
                    var referResponse = angular.fromJson(referSuccess.data.response);
                    if (errorCode == null && referSuccess.data.success) {
                        doctorServices.referDoctorSuccessSwal();
                        refer.referDoctor = {};
                    }
                }
            }, function(referError) {
                doctorServices.noConnectivityError();
            });
        }
    }
};
