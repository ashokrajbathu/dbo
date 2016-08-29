angular.module('personalAssistant').filter("checkInSort", function() {
    return function(input) {
        var result;
        if (input == "CHECK_IN") {
            result = "CHECKIN";
        } else {
            result = input;
        }
        return result;
    };
}).filter("longDateIntoReadableDate", function() {
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
}).filter("removeunderscore", function() {
    return function(input) {
        var result;
        if (input == undefined) {
            result = '';
        } else {
            input = _.replace(input, '_', '');
            result = input;
        }
        return result;
    }
});
