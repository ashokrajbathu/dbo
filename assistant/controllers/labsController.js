angular.module('personalAssistant').controller('labsController', labsController);
labsController.$inject = ['$scope', '$log', '$location', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function labsController($scope, $log, $location, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem('currentState', 'labs');

    var labs = this;

    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);

    var getLabsPromise = dboticaServices.getLabEntities();
    $log.log('get labs promise is-----', getLabsPromise);
    getLabsPromise.then(function(getLabsSuccess) {
        var errorCode = getLabsSuccess.data.errorCode;
        if (errorCode) {
            dboticaServices.logoutFromThePage(errorCode);
        } else {
            var getLabsResponse = angular.fromJson(getLabsSuccess.data.response);
            $log.log('get lab response is----', getLabsResponse);
            labs.labTestsList = _.filter(getLabsResponse, function(labTestEntity) {
                return labTestEntity.state == 'ACTIVE';
            });
            angular.forEach(labs.labTestsList, function(labEntry) {
                labEntry.referenceDetails = angular.fromJson(labEntry.referenceDetails);
            });
            $log.log('total lab tests are----', labs.labTestsList);
        }
    }, function(getLabsError) {
        dboticaServices.noConnectivityError();
    });
}
