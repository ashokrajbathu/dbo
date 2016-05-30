angular.module('personalAssistant').controller('analyticReportsCtrl', ['$scope', '$log', 'dboticaServices', '$state', '$parse', '$http', 'SweetAlert', 'doctorServices', function($scope, $log, dboticaServices, $state, $http, $parse, doctorServices, SweetAlert) {
    var analyticReport = this;
    analyticReport.selectSearchType = selectSearchType;

    angular.element("#date").datepicker({
        dateFormat: "dd/mm/yy",
        autoclose: true,
        'minDate': 0
    });
    localStorage.setItem('currentState', 'analyticReport');
    analyticReport.name = "Invoice History";
    analyticReport.searchTypes = ['Phone Number', 'Bill Number', 'Date', 'Doctor'];
    analyticReport.searchBox = true;
    analyticReport.searchBoxDate = false;
    analyticReport.searchSelected = "Phone Number";

    function selectSearchType(search) {
        analyticReport.searchSelected = search;
        if (search == "Date") {
            analyticReport.searchBoxDate = true;
            analyticReport.searchBox = false;
        } else {
            analyticReport.searchBoxDate = false;
            analyticReport.searchBox = true;
        }
    }

}]);
