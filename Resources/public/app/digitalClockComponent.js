/**
 * @file
 * Contains the itkDateComponent module.
 *
 * @TODO: jeskr: why is this code here... what is it used for?
 */

/**
 * Setup the module.
 */
(function () {
  'use strict';

  /**
   * date component directive.
   *
   * html parameters:
   */
  angular.module('ikApp').directive('digitalClockComponent', ['$interval',
    function ($interval) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: '/bundles/os2displayscreen/app/views/digital-clock.html?' + window.config.version,
        scope: {
        },
        link: function (scope) {
          scope.thisDate = new Date();

          // Update current date every minute.
          var interval = $interval(function() {
            // Update current datetime.
            scope.thisDate = Date.now();
          }, 1000);

          // Register event listener for destroy.
          //   Cleanup interval.
          scope.$on('$destroy', function() {
            if (angular.isDefined(interval)) {
              $interval.cancel(interval);
              interval = undefined;
            }
          });
        }
      };
    }
  ]);
}).call(this);
