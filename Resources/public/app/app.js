// Enable caching of ajax requests.
$.ajaxSetup({
  cache: true
});

/**
 * Defines the Angular Application.
 *
 * Dependency:
 *   A angularJS service to load dynamically CSS files. The original name of this
 *   project was angularDynamicStylesheets.
 */
angular.module('ikApp', [
    'ngAnimate',
    'ngSanitize',
    'angular.css.injector'
  ]
).config(function ($sceDelegateProvider) {
    'use strict';

    // The administration interface and the client code do not run on the same
    // domain/sub-domain hence we need to white-list the domains to load slide
    // templates and CSS form the administration domain.
    $sceDelegateProvider.resourceUrlWhitelist([
      // Allow same origin resource loads.
      'self',
      // Allow loading from outer templates domain.
      '**'
    ]);
  }
).config(function ($provide) {
  'use strict';

  $provide.decorator("$exceptionHandler", ['$delegate', '$injector',
    function ($delegate, $injector) {
      return function (exception, cause) {
        $delegate(exception, cause);

        // Send the error to logging.
        $injector.get('logging').error(exception, cause);
      };
    }
  ]);
});

/**
 * Handle hide/show mouse on movement.
 */
(function() {
    var mouseTimer = null, cursorVisible = false;

    function disappearCursor() {
        mouseTimer = null;

        document.body.style.cursor = 'url(/assets/images/trans.gif),none';
        cursorVisible = false;
    }

    // Add hacks fails in chorme, so just always hide mouse cursor.
    var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    if (!is_chrome) {
      document.addEventListener("mousemove", function() {
          if (mouseTimer) {
              window.clearTimeout(mouseTimer);
          }

          if (!cursorVisible) {
              document.body.style.cursor = 'default';
              cursorVisible = true;
          }

          mouseTimer = window.setTimeout(disappearCursor, 5000);
      });
    }
})();
