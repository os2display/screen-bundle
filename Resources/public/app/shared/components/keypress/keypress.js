/**
 * @file
 * KeyPresses is used to capture keyboard presses.
 *
 * It's used in the screen to capture keyboard shortcut for logout.
 */

/**
 * Setup the module.
 */
(function () {
  'use strict';

  var modifierPressed = false;
  var app;
  app = angular.module("itkKeypress", []);

  app.directive('itkKeypress', function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {

        // Capture modifier.
        if (event.which === Number(attrs.modifier)) {
          modifierPressed = true;
          return;
        }

        // Check if modifier was pressed last.
        if(modifierPressed && event.which === Number(attrs.key)) {
          scope.$apply(function () {
            scope.$eval(attrs.itkKeypress);
          });

          // Prevent default action.
          event.preventDefault();
        }

        // Reset modifier.
        modifierPressed = false;
      });
    };
  });

}).call(this);
