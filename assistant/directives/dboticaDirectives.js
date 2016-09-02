angular.module('personalAssistant').run(function($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function(evt, to, params) {
        if (to.redirectTo) {
            evt.preventDefault();
            $state.go(to.redirectTo, params)
        }
    });
});
angular.module('personalAssistant').directive('validNumber', function() {
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
    }).directive('numbersOnly', function() {
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
    }).directive('uiSrefActiveIf', ['$state', function($state) {
        return {
            restrict: "A",
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                var state = $attrs.uiSrefActiveIf;

                function update() {
                    if ($state.includes(state) || $state.is(state)) {
                        $element.addClass("activeAdminLi");
                    } else {
                        $element.removeClass("activeAdminLi");
                    }
                }

                $scope.$on('$stateChangeSuccess', update);
                update();
            }]
        };
    }]).directive('uiSrefIf', ['$state', function($state) {
        return {
            restrict: "A",
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                var state = $attrs.uiSrefIf;

                function update() {
                    if ($state.includes(state) || $state.is(state)) {
                        console.log('in uisrefif---');
                        console.log("dollar element is---", angular.element('#mainAdminLiActive'));
                        console.log('id value is-----', document.getElementById('mainAdminLiActive'));
                        $('#mainAdminLiActive').addClass("activeAdminLi");
                    } else {
                        $element.removeClass("activeAdminLi");
                    }
                }

                $scope.$on('$stateChangeSuccess', update);
                update();
            }]
        };
    }]).directive('testSelection', function(dboticaServices, $timeout, $log) {
        return {
            restrict: 'A',
            controller: 'billManagementCtrl',
            controllerAs: 'billView',
            bindToController: true,
            scope: { max: '=' },
            link: function(scope, elem) {
                scope.$watch(function() {
                    $timeout(function() {
                        elem.autocomplete({
                            source: dboticaServices.getTestsNamesList(),
                            minLength: 2,
                            select: function(event, ui) {
                                var tests = dboticaServices.getTestsFromService();
                                var testEntered = ui.item.value;
                                for (var testIndex = 0; testIndex < tests.length; testIndex++) {
                                    if (testEntered.toLowerCase() == tests[testIndex].diagnosisTest.toLowerCase()) {
                                        angular.element('#exampleInputTestsCost').val(tests[testIndex].price / 100);
                                    }
                                }
                            }
                        }, 5);
                    });
                });
            }
        };
    }).directive('autoComplete', function(dboticaServices, $timeout, $log) {
        return {
            restrict: 'A',
            bindToController: true,
            link: function(scope, elem) {
                scope.$watch(function() {
                    elem.autocomplete({
                        source: dboticaServices.getMedicineNames(),
                        minLength: 2,
                        select: function(event, ui) {
                            var medicines = dboticaServices.getMedicine();
                            var medicineEntered = ui.item.value;
                            for (var medicineIndex = 0; medicineIndex < medicines.length - 1; medicineIndex++) {
                                if (medicineEntered.toLowerCase() == medicines[medicineIndex].itemName.toLowerCase()) {
                                    angular.element('#exampleInputMedicineCost').val(medicines[medicineIndex].retailPrice);
                                }
                            }
                        }
                    });
                });
            }
        };
    })
    .directive('autoCompleteMedicines', function(dboticaServices, $timeout, $log) {
        return {
            restrict: 'A',

            bindToController: true,

            link: function(scope, elem) {
                scope.$watch(function() {
                    elem.autocomplete({
                        source: dboticaServices.getMedicineNamesFromNurse(),
                        minLength: 2,
                        select: function(event, ui) {
                            var medicines = dboticaServices.getMedicinesFromNurse();
                            var medicineEntered = ui.item.value;
                            for (var medicineIndex = 0; medicineIndex < medicines.length - 1; medicineIndex++) {
                                if (medicineEntered.toLowerCase() == medicines[medicineIndex].itemName.toLowerCase()) {
                                    angular.element('#inputDrugInMedication').val(medicines[medicineIndex].retailPrice);
                                }
                            }
                        }
                    });
                });
            }
        };
    });
