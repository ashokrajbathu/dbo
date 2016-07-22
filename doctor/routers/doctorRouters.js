angular.module('doctor').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

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
        });
});
