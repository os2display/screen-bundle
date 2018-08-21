angular.module('screenApp').directive('screenBundlePreview', [
    '$timeout', function ($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            previewUrl: '@',
            close: '&'
        },
        link: function (scope, element, attrs) {
            element.ready(function () {
                $timeout(function () {
                    scope.width = Math.min(element[0].offsetWidth - 40, 1200);
                    scope.height = scope.width / 16 * 9;
                });
            });
        },
        templateUrl: '/bundles/os2displayscreen/apps/screenApp/preview/preview.html'
    };
}]);
