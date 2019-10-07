angular.module('screenApp').directive('screenBundlePreview', [
    '$timeout', 'busService', '$window', function ($timeout, busService, $window) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            previewUrl: '@',
            close: '&'
        },
        link: function (scope) {
            busService.$emit('bodyService.addClass', 'is-locked');

            scope.aspectRatios = [
                {id: 0, w: 1920, h: 1080, name: '16:9 (Full HD)'},
                {id: 1, w: 1080, h: 1920, name: '9:16 (Full HD portrait)'}
            ];

            scope.selectedAspectRatio = scope.aspectRatios[0];

            scope.sWidth = 1920;
            scope.sHeight = 1080;
            scope.transformOrigin = '0 0';

            function calculateDimensions() {
                $timeout(function () {
                    scope.sWidth = scope.selectedAspectRatio.w;
                    scope.sHeight = scope.selectedAspectRatio.h;

                    var chosenSize = null;

                    if (scope.selectedAspectRatio.id === 0) {
                        chosenSize = 1200;
                    }
                    else {
                        chosenSize = 675;
                    }

                    var width = Math.min($window.innerWidth - 2 * 20, chosenSize);

                    scope.scale = width / scope.sWidth;

                    if ($window.innerWidth <= chosenSize) {
                        scope.margin = null;
                    }
                    else {
                        scope.margin = '0 ' + Math.max(40, ($window.innerWidth - width) / 2) + 'px';
                    }
                });
            }

            angular.element($window).on('resize', calculateDimensions);

            scope.$watch('selectedAspectRatio', function () {
                calculateDimensions();
            });

            scope.$on('$destroy', function () {
                busService.$emit('bodyService.removeClass', 'is-locked');
                angular.element($window).off('resize', calculateDimensions);
            });
        },
        templateUrl: '/bundles/os2displayscreen/apps/screenApp/preview/preview.html'
    };
}]);
