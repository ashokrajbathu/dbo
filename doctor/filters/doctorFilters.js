angular.module('doctor').filter("longDateIntoReadableDate", function() {
    return function(input) {
        var result;
        if (input == undefined) {
            result = "";
        } else {
            result = new Date(input);
            result = moment(result).format('DD/MM/YYYY,hh:mm:ss A');
            var timeArray = result.split(",");
            result = timeArray[0];
        }
        return result;
    };
});

angular.module('doctor').filter('editBloodGroup', function() {
    return function(input) {
        var result;
        if (input == undefined || input == '') {
            result = '-';
        } else {
            result = _.replace(input, '_', ' ');
        }
        return result;
    };
});

angular.module('doctor').filter('ReadableAppointmentsTimings', function() {
    return function(input) {
        var result;
        if (input == undefined) {
            result = "";
        } else {
            result = new Date(input);
            result = moment(result).format('DD/MM/YYYY,hh:mm:ss A');
            var timeArray = result.split(",");
            result = timeArray[1];
        }
        return result;
    };
});
