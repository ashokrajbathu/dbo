angular.module('personalAssistant').controller('mainAdminController', mainAdminController);
mainAdminController.$inject = ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function mainAdminController($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    localStorage.setItem("currentState", "mainAdmin");
    /* $state.go('.addDocCategory');*/
    var billInvoice = {};
    dboticaServices.setInvoice(billInvoice);

};
