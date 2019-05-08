/**
 * @file
 * Contains the slide directive.
 */

/**
 * Directive to insert html for a slide.
 *
 * html parameters
 *   ik-slide (object): The slide to display.
 *   show (boolean): Should the slide be visible?
 *
 *   ---- used for creating unique slide-id ----
 *   array-id (integer): The which displayIndex does this slide belong to?
 *   channel-id (integer): What channel does the slide belong to?
 *   index (integer): Which index in the channel does that slide have?
 *   region (integer): Which region does the slide belong to?
 *   ---- used for creation unique slide-id ----
 */
angular.module('ikApp').directive('slide', ['cssInjector',
  function(cssInjector) {
    'use strict';

    return {
      restrict: 'E',
      scope: {
        ikSlide: '=',
        show: '=',
        arrayId: '=',
        channelId: '=',
        index: '=',
        regionId: '=',
        scale: '='
      },
      link: function(scope, element, attrs) {
        scope.ikSlide.uniqueId = null;

        // Observe for changes to ik-array-id attribute. Set unique id.
        attrs.$observe('regionId', function(val) {
          if (!val) {
            return;
          }

          // Generate unique id for ikSlide.
          scope.ikSlide.uniqueId = '' + scope.regionId + '-' + scope.arrayId + '-' + scope.channelId + '-' + scope.index;
        });

        // Observe for changes to the ikSlide attribute. Setup ikSlide when set.
        attrs.$observe('ikSlide', function(val) {
          if (!val) {
            return;
          }

          // Check if script have been loaded. If it has not, load the script
          // and run setup function.
          if (!window.slideFunctions[scope.ikSlide.js_script_id]) {
            $.getScript(scope.ikSlide.js_path, function () {
              // The loaded script set an object with setup() and run() methods
              // into the slideFunctions array. Hence we can call setup on the
              // object in the array here.
              window.slideFunctions[scope.ikSlide.js_script_id].setup(scope);
            });
          }
          else {
            // Script have been load before, so just run setup.
            window.slideFunctions[scope.ikSlide.js_script_id].setup(scope);
          }

          // Inject stylesheet.
          cssInjector.add(scope.ikSlide.css_path);
        });
      },
      template: '<div data-ng-include="ikSlide.template_path" class="slide-{{ikSlide.uniqueId}}"></div>'
    };
  }
]);
