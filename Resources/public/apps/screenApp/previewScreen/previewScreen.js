angular.module('screenApp').directive('screenBundlePreviewScreen', [
    '$timeout', '$translate', function ($timeout, $translate) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            screenId: '=',
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
        templateUrl: '/bundles/os2displayscreen/apps/screenApp/previewScreen/preview-screen.html'
    };
}]);
