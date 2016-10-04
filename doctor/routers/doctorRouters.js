angular.module('doctor').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise(function($injector, $location) {
        var $state = $injector.get("$state");
        $state.go('login');
    });

    $stateProvider
        .state('login', {
            url: '/',
            controller: 'loginController',
            controllerAs: 'login',
            templateUrl: 'views/login.html'
        })
        .state('doctorHome', {
            controller: 'doctorHomeController',
            controllerAs: 'doctorHome',
            templateUrl: 'views/doctorHome.html'
        })
        .state('doctorHome.drugPrescription', {
            url: '/drugPrescriptions',
            controller: 'drugPrescriptionsController',
            controllerAs: 'prescription',
            templateUrl: 'views/drugPrescriptions.html'
        })
        .state('doctorHome.myPrescriptions', {
            url: '/myPrescriptions',
            controller: 'myPrescriptionsController',
            controllerAs: 'myPrescription',
            templateUrl: 'views/myPrescriptions.html'
        })
        .state('doctorHome.myPatients', {
            url: '/myPatients',
            controller: 'myPatientsController',
            controllerAs: 'myPatient',
            templateUrl: 'views/myPatients.html'
        })
        .state('doctorHome.myScheduler', {
            url: 'myScheduler',
            controller: 'mySchedulerController',
            controllerAs: 'scheduler',
            templateUrl: 'views/myScheduler.html'
        })
        .state('doctorHome.referDbotica', {
            url: 'referDbotica',
            controller: 'referDboticaController',
            controllerAs: 'referDbotica',
            templateUrl: 'views/referDbotica.html'
        })
        .state('doctorHome.settings', {
            url: '/settings',
            controller: 'settingsController',
            controllerAs: 'settings',
            templateUrl: 'views/settings.html'
        })
        .state('doctorHome.diseaseTemplate', {
            url: '/diseaseTemplate',
            controller: 'diseaseTemplateController',
            controllerAs: 'diseaseTemplate',
            templateUrl: 'views/diseaseTemplate.html'
        })
        .state('doctorHome.doctorProfile', {
            url: 'doctorProfile',
            controller: 'doctorProfileController',
            controllerAs: 'doctorProfile',
            templateUrl: 'views/doctorProfile.html'
        })
        .state('doctorHome.prescriptionReport', {
            url: 'prescriptionReport',
            controller: 'prescriptionReportController',
            controllerAs: 'prescriptionReport',
            templateUrl: 'views/prescriptionReport.html'
        });
});
