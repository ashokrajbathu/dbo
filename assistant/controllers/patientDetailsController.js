angular.module('personalAssistant').controller('patientDetailsController', patientDetailsController);
patientDetailsController.$inject = ['$rootScope', '$scope', '$log', '$stateParams', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices'];

function patientDetailsController($rootScope, $scope, $log, $stateParams, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var detail = this;

    var users = [{
        name: 'First Name',
        modelName: ''
    }, {
        name: 'Last Name',
        modelName: ''
    }];

    detail.formData = {};
    detail.formData.button = 'Save';
    detail.formData.users = users;

    detail.saveData = saveData;

    var configs1 = [{
        'name': 'Configdsjfddsjasds 1',
        'value': 'configkjdfdsfsd1'
    }, {
        'name': 'Configsjdsdjsjdfds 2',
        'value': 'configsdmsf2'
    }, {
        'name': 'Configshsdjfsdfhjc 3',
        'value': 'configshdfsdf3'
    }];

    var configs2 = [{
        'name': 'Configdsjfddsjasds 1',
        'value': 'configkjdfdsfsd1'
    }, {
        'name': 'Configsjdsdjsjdfds 2',
        'value': 'configsdmsf2'
    }, {
        'name': 'Configshsdjfsdfhjc 3',
        'value': 'configshdfsdf3'
    }];

    detail.selectBoxes = [{
        configs: configs1
    }, {
        configs: configs2
    }];

    detail.selectBoxes[0].config = detail.selectBoxes[0].configs[0].value;
    detail.selectBoxes[1].config = detail.selectBoxes[1].configs[1].value;

    function saveData() {
        $log.log('select box val is-----', detail.formData.users);
        $log.log('input box values is-------', detail.selectBoxes);
    }
}
