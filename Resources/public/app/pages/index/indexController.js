/**
 * @file
 * Contains the index controller.
 */

/**
 * Index Controller.
 *
 * Sets up the socket connection and displays the activation page if relevant.
 */
angular.module('ikApp').controller('IndexController', ['$scope', '$rootScope', '$timeout', 'socket', 'itkLog', 'cssInjector',
  function ($scope, $rootScope, $timeout, socket, itkLog, cssInjector) {
    'use strict';

    // Initial slide function array to hold custom slide plugins loaded from
    // the administration interface
    if (!window.hasOwnProperty('slideFunctions')) {
      window.slideFunctions = [];
    }

    // The template to render in the index.html's ng-include.
    $scope.template = 'app/pages/index/init.html?' + window.config.version;

    // Is the screen running (has the screen template been loaded?).
    var running = false;

    // Default fallback image, used when no slide content exists. Default to
    // displaying it during load.
    $scope.fallbackImageUrl = window.config.fallback_image ? window.config.fallback_image : 'assets/images/fallback_default.png';
    $scope.displayFallbackImage = true;

    // Stored channels for when the screen template has not yet been loaded.
    // We receive channels before the screen template has been loaded.
    // @TODO: Replace this setup with a promise setup.
    var savedChannelPushes = [];

    // Saved info about regions
    var regions = [];

    /**
     * Register to the regionInfo event.
     *
     * Updates whether or not the fallback image should be displayed.
     *
     * Each region fires this event when it has calculated how many slides are scheduled.
     *
     * If there are no scheduled slides show the fallback image.
     */
    $rootScope.$on('regionInfo', function(event, info) {
      regions[info.id] = info;

      var dontDisplayDefaultImage = false;

      // Check if the region has any content.
      regions.forEach(function(region) {
        if (region.scheduledSlides > 0) {
          dontDisplayDefaultImage = true;
        }
      });

      $scope.displayFallbackImage = !dontDisplayDefaultImage;
    });

    /**
     * Register to the activationNotComplete event.
     *
     * This event is fired when the activation fails.
     *
     * Result is that the not-activated template is shown.
     */
    $rootScope.$on('activationNotComplete', function() {
      $scope.$apply(function () {
        $scope.template = 'app/pages/notActivated/not-activated.html?' + window.config.version;
      });
    });

    /**
     * Register to the awaitingContent event.
     *
     * @TODO: Figure out if this is still needed.
     */
    $rootScope.$on('awaitingContent', function() {
      $scope.$apply(function () {
        $scope.template = 'app/pages/index/awaiting-content.html?' + window.config.version;
      });
    });

    /**
     * Register to the start event.
     *
     * Applies the screen template and emits stored channels to regions after a
     * 5 seconds delay.
     *
     * @TODO: Rewrite this to a promise that captures when the screen template
     *        has been loaded, instead of the timeouts.
     */
    $rootScope.$on('start', function(event, screen) {
      if (!running) {
        // Load screen template and trigger angular digest to update the screen
        // with the template.
        $scope.$apply(function () {
          // Inject the screen stylesheet.
          cssInjector.add(screen.template.path_css);

          // Set the screen template.
          $scope.template = screen.template.path_live;
          $scope.templateDirectory = screen.template.path;

          $scope.options = screen.options;
        });

        // Wait 5 seconds for the screen template to load.
        $timeout(function() {
          running = true;

          // Push all stored channels.
          for (var i = 0; i < savedChannelPushes.length; i++) {
            itkLog.info('Emitting channel saved channel.');
            $rootScope.$emit('addChannel', savedChannelPushes[i]);
          }
        }, 5000);
      }
    });

    /**
     * Register to the addChannel event.
     *
     * If the screen template is not running yet, store the channel for
     * emission after the screen template has been loaded.
     *
     * Add channel is emitted from the socket, when it receives channels from the middleware.
     */
    $rootScope.$on('addChannel', function(event, data) {
      if (!running) {
        itkLog.info('Saving channel till screen is ready.');
        savedChannelPushes.push(data);
      }
    });

    /**
     * Logout and reload the screen.
     */
    $scope.logout = function logout() {
      // Use the socket to logout.
      socket.logout();
    };

    // Start the socket connection to the middleware.
    socket.start();
  }
]);
