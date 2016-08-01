angular.module('doctor').directive('numbersOnly', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});

angular.module('doctor').directive('validNumber', function() {
    return {
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            if (!ngModelCtrl) {
                return;
            }
            ngModelCtrl.$parsers.push(function(val) {
                if (angular.isUndefined(val)) {
                    var val = '';
                }
                var clean = val.replace(/[^-0-9\.]/g, '');
                var negativeCheck = clean.split('-');
                var decimalCheck = clean.split('.');
                if (!angular.isUndefined(negativeCheck[1])) {
                    negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                    clean = negativeCheck[0] + '-' + negativeCheck[1];
                    if (negativeCheck[0].length > 0) {
                        clean = negativeCheck[0];
                    }
                }
                if (!angular.isUndefined(decimalCheck[1])) {
                    decimalCheck[1] = decimalCheck[1].slice(0, 2);
                    clean = decimalCheck[0] + '.' + decimalCheck[1];
                }
                if (val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                }
                return clean;
            });
            element.bind('keypress', function(event) {
                if (event.keyCode === 32) {
                    event.preventDefault();
                }
            });
        }
    };
});

angular.module('doctor').directive('uiSrefActiveIf', ['$state', function($state) {
    return {
        restrict: "A",
        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
            var state = $attrs.uiSrefActiveIf;

            function update() {
                if ($state.includes(state) || $state.is(state)) {
                    $element.addClass("activeDoctorLi");
                } else {
                    $element.removeClass("activeDoctorLi");
                }
            }

            $scope.$on('$stateChangeSuccess', update);
            update();
        }]
    };
}]);

angular.module('doctor').directive('uiSrefActiveDrugIf', ['$state', function($state) {
    return {
        restrict: "A",
        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
            var state = $attrs.uiSrefActiveIf;

            function update() {
                if ($state.includes(state) || $state.is(state)) {
                    $element.addClass("activeDoctorLi");
                } else {
                    $element.removeClass("activeDoctorLi");
                }
            }

            $scope.$on('$stateChangeSuccess', update);
            update();
        }]
    };
}]);

/*angular.module('doctor').directive('clickOutside', function($document) {
    return {
        restrict: 'A',
        scope: {
            clickOutside: '&'
        },
        link: function(scope, el, attr) {
            $document.on('click', function(e) {
                console.log('in click----');
                if (el !== e.target && !el[0].contains(e.target)) {
                    console.log('in click 2----');
                    scope.$apply(function() {
                        console.log('in click 3----');
                        scope.$eval(scope.clickOutside);
                        el.addClass('displayNone');
                    });
                }
            });
        }
    }
});*/
