angular.module('doctor').controller('diseaseTemplateController', diseaseTemplateController);
diseaseTemplateController.$inject = ['$scope', '$log', 'doctorServices', '$state', '$parse', '$http', 'SweetAlert'];

function diseaseTemplateController($scope, $log, doctorServices, $state, $http, $parse, SweetAlert) {
    var diseaseTemplate = this;

    var activeDoctorId = '';
    diseaseTemplate.daysOrQuantity = 'Days';
    var classDefault = 'default';
    var classSuccess = 'success';

    resetAllButtons();

    function resetAllButtons() {
        diseaseTemplate.Before_BreakFast = classDefault;
        diseaseTemplate.After_BreakFast = classDefault;
        diseaseTemplate.Before_Lunch = classDefault;
        diseaseTemplate.After_Lunch = classDefault;
        diseaseTemplate.Before_Dinner = classDefault;
        diseaseTemplate.After_Dinner = classDefault;
    }
}
