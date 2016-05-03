var myapp = angular.module('doctorServices', []);

myapp.service('doctorServices', ['$http', function($http) {
    var getDoctors = function() {
        console.log("in doctors service");
        console.log("doctors--", $http.get('http://localhost:8081/dbotica-spring/assistant/getMyDoctors'));
        return $http.get('http://localhost:8081/dbotica-spring/assistant/getMyDoctors');

    }
    return {
        getDoctors: getDoctors
    }
}]);
