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
});
