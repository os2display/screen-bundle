angular.module('screenApp').directive('screenBundlePreview', [
    '$timeout', 'busService', function ($timeout, busService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            previewUrl: '@',
            close: '&'
        },
        link: function (scope, element, attrs) {
            busService.$emit('bodyService.addClass', 'is-locked');

            var containerWidth;
            scope.aspectRatios = [
                {id: 0, w: 16, h: 9, name: '16:9 (Full HD)'},
                {id: 1, w: 9, h: 16, name: '9:16 (Full HD portrait)'}
            ];

            scope.selectedAspectRatio = scope.aspectRatios[0];

            function calculateDimensions() {
                $timeout(function () {
                    if (scope.selectedAspectRatio.w > scope.selectedAspectRatio.h) {
                        scope.width = Math.min(containerWidth, 1200);
                        scope.height = scope.width / scope.selectedAspectRatio.w * scope.selectedAspectRatio.h;
                    }
                    else {
                        scope.width = Math.min(containerWidth, 1200 * scope.selectedAspectRatio.w / scope.selectedAspectRatio.h);
                        scope.height = scope.width * scope.selectedAspectRatio.h / scope.selectedAspectRatio.w;
                    }
                });
            }

            element.ready(function () {
                $timeout(function () {
                    containerWidth =  Math.min(element[0].offsetWidth - 40);
                    calculateDimensions();
                });
            });

            scope.$watch('selectedAspectRatio', function () {
                calculateDimensions();
            });

            scope.$on('$destroy', function () {
                busService.$emit('bodyService.removeClass', 'is-locked');
            })
        },
        templateUrl: '/bundles/os2displayscreen/apps/screenApp/preview/preview.html'
    };
}]);
