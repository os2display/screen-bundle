/**
 * @file
 * Contains the itkRegion module.
 */

/**
 * Setup the module.
 */
(function () {
  'use strict';

  var app = angular.module("itkRegion", []);

  // Create ProgressBar object ot handle the bar.
  function ProgressBar(scope, itkLog) {
    this.scope = scope;
    this.itkLog = itkLog;

    // Used by progress bar
    this.scope.progressBoxElements = 0;
    this.scope.progressBoxElementsIndex = 0;
  }

  /**
   * Sets the progress bar style.
   *
   * @param duration
   *   How many seconds should the animation take?
   */
  ProgressBar.prototype.start = function start(duration) {
    this.scope.progressBarStyle =  {
      "overflow": "hidden",
      "-webkit-transition": "width " + duration + "s linear",
      "-moz-transition": "width " + duration + "s linear",
      "-o-transition": "width " + duration + "s linear",
      "transition": "width " + duration + "s linear",
      "width": "100%"
    };
  };

  /**
   * Reset the progress box.
   *
   * @return int
   *   The number of slides currently scheduled.
   */
  ProgressBar.prototype.resetBox = function resetBox() {
    var self = this;

    self.itkLog.info('resetProgressBox');
    self.scope.progressBoxElements = 0;
    self.scope.progressBoxElementsIndex = 0;

    var numberOfScheduledSlides = 0;

    for (var i = 0; i < self.scope.channelKeys[self.scope.displayIndex].length; i++) {
      var channelKey = self.scope.channelKeys[self.scope.displayIndex][i];
      var channel = self.scope.channels[self.scope.displayIndex][channelKey];

      if (channel.isScheduled) {
        for (var j = 0; j < channel.slides.length; j++) {
          var slide = channel.slides[j];
          if (slide.isScheduled) {
            numberOfScheduledSlides++;
          }
        }
      }
    }

    self.scope.progressBoxElements = numberOfScheduledSlides;

    return numberOfScheduledSlides;
  };

  /**
   * Set the next slide number in the info box.
   */
  ProgressBar.prototype.next = function next() {
    // Reset the bar.
    this.reset();

    // Update the counter.
    this.scope.progressBoxElementsIndex++;
  };

  /**
   * Resets the progress bar style.
   */
  ProgressBar.prototype.reset = function reset() {
    this.scope.progressBarStyle = {
      "width": "0"
    };
  };


  // Create region function object and use prototype to extend it to optimize
  // memory usage inside the region directive.
  function Region(scope, itkLog, progressBar, $timeout, $rootScope, $http, $interval, $sce, $filter) {
    this.scope = scope;
    this.itkLog = itkLog;
    this.progressBar = progressBar;
    this.$timeout = $timeout;
    this.$rootScope = $rootScope;

    this.$http = $http;
    this.$interval = $interval;
    this.$sce = $sce;
    this.$filter = $filter;

    // @TODO: Hardcode fade timeout?
    this.fadeTime = 1000;

    // @TODO: try to get out of this timeout h...!
    this.timeout = null;
  }

  /**
   * Broadcast regionInfo event.
   *
   * @param slideCount
   *   The number of slides that are scheduled.
   */
  Region.prototype.broadcastInfo = function broadcastInfo(slideCount) {
    var self = this;
    self.$rootScope.$broadcast('regionInfo', {
      "id": self.scope.regionId,
      "scheduledSlides": slideCount
    });
  };

  /**
   * Calculated if the slide should be shown now.
   *
   * Stores the result of calculation on the slide object in the property
   * "isScheduled".
   *
   * @param slide
   */
  Region.prototype.updateSlideScheduleState = function updateSlideScheduleState(slide) {
    var now = Math.round((new Date()).getTime() / 1000);
    var from = slide.schedule_from;
    var to = slide.schedule_to;

    var fromSet = from && from !== 0;
    var toSet = to && to !== 0;

    if (fromSet && !toSet) {
      slide.isScheduled = from < now;
    }
    else if (fromSet && toSet) {
      slide.isScheduled = (from < to && from < now && to > now);
    }
    else if (!fromSet && toSet) {
      slide.isScheduled = to > now;
    }
    else {
      slide.isScheduled = true;
    }
  };

  /**
   * Is the channel scheduled to be shown now?
   *
   * @param channel
   *   The channel to evaluate.
   * @returns {boolean}
   */
  Region.prototype.isChannelScheduled = function isChannelScheduled(channel) {
    // If no schedule repeat is set, it should be shown all the time.
    if (!channel.schedule_repeat) {
      return true;
    }

    var now = new Date();
    var nowDay = now.getDay();
    var nowHour = now.getHours();

    var hourFrom = channel.schedule_repeat_from;
    var hourTo = channel.schedule_repeat_to;
    var days = channel.schedule_repeat_days;

    // If all 3 parameters are not set return.
    if (!hourFrom && !hourTo && days.length === 0) {
      return true;
    }

    // Should it be shown today?
    var repeatToday = false;
    for (var i = 0; i < days.length; i++) {
      if (days[i].id === nowDay) {
        repeatToday = true;
        break;
      }
    }

    // Is it within scheduled hours?
    if (repeatToday) {
      if (hourFrom > hourTo) {
        return false;
      }

      return nowHour >= hourFrom && nowHour < hourTo;
    }

    return false;
  };

  /**
   * Is the channel published to be shown now?
   *
   * @param channel
   *   The channel to evaluate.
   */
  Region.prototype.updateChannelScheduleState = function updateChannelScheduleState(channel) {
    var now = Math.round((new Date()).getTime() / 1000);
    var publishFrom = channel.publish_from;
    var publishTo = channel.publish_to;

    channel.isScheduled = false;
    if (this.isChannelScheduled(channel)) {
      if (!publishFrom && !publishTo) {
        channel.isScheduled = true;
      }
      else if (publishFrom && now > publishFrom && (!publishTo || now < publishTo)) {
        channel.isScheduled = true;
      }
      else {
        channel.isScheduled = !publishFrom && now < publishTo;
      }
    }
  };

  /**
   * Update which channels are scheduled to be shown.
   */
  Region.prototype.updateScheduling = function updateScheduling() {
    var self = this;
    var displayIndex = self.scope.displayIndex;

    self.scope.channelKeys[displayIndex].forEach(function (channelKey, index, array) {
      var channel = self.scope.channels[displayIndex][channelKey];
      self.updateChannelScheduleState(channel);

      channel.slides.forEach(function (slide) {
        self.updateSlideScheduleState(slide);
      });
    });
  };

  /**
   * Check if there are any slides that are scheduled.
   */
  Region.prototype.isContentScheduled = function isContentScheduled() {
    var self = this;
    var element;

    var displayIndex = self.scope.displayIndex;
    var len = self.scope.channelKeys[self.scope.displayIndex].length;

    // Check all channels to see if there are slides to show.
    for (var i = 0; i < len; i++) {
      var channel = self.scope.channels[displayIndex][self.scope.channelKeys[displayIndex][i]];

      if (channel.isScheduled) {
        // Check if there are any slides scheduled in the current channel.
        for (var k = 0; k < channel.slides.length; k++) {
          element = channel.slides[k];

          if (element.isScheduled) {
            return true;
          }
        }
      }
    }

    return false;
  };

  /**
   * Restart the show.
   *
   * Restart the show from the start of the current channels array,
   *   or if there have been changes, go to the other channels array.
   */
  Region.prototype.restartShow = function restartShow() {
    var self = this;

    self.itkLog.info("Restart show");

    // Reset the index keys, they will bed +1 in the nextSlide and nextChannel
    // hence first will be zero indexed.
    self.scope.slideIndex = -1;
    self.scope.channelKey = -1;

    // Swap to updated channel array, if there have been changes to channels.
    if (self.scope.slidesUpdated) {
      var shadowIndex = self.getShadowIndex();

      var displayIndex = self.scope.displayIndex;
      var channels = self.scope.channels;
      channels[displayIndex] = angular.copy(channels[shadowIndex]);
      self.scope.channelKeys[displayIndex] = Object.keys(channels[displayIndex]);

      // Update the display index to the new index value.
      self.scope.displayIndex = shadowIndex;

      // Reset update variable as slides have been updated.
      self.scope.slidesUpdated = false;
    }

    // Mark channels and slides that should not be show right now as they may be
    // scheduled for later. So set isScheduled = false for the slides.
    self.updateScheduling();

    // Reset progress box.
    self.broadcastInfo(self.progressBar.resetBox());

    // If no slides are to be displayed, wait 5 seconds and restart.
    if (!self.isContentScheduled()) {
      self.$timeout.cancel(self.timeout);
      self.timeout = self.$timeout(function() {
        self.restartShow();
      }, 5000);
      return;
    }

    // Show next channel.
    self.nextChannel();
  };

  /**
   * Go to next channel
   *
   * Switch to the next channel or cycle to the first. S
   */
  Region.prototype.nextChannel = function nextChannel() {
    var self = this;

    // Update the channel key to get the next channel in the array.
    self.scope.channelKey++;

    // If more channels remain to be shown, go to next channel.
    var displayIndex = self.scope.displayIndex;
    var channelKeys = self.scope.channelKeys;

    // @TODO: Check if any channels remainsToBeShow, if not stop the show until
    //        channels are scheduled or addChannel event. isContentScheduled
    //        could be used.

    // Check if the next channel exists. If not restart the show :-D.
    if (self.scope.channelKey < channelKeys[displayIndex].length) {
      var nextChannelIndex = channelKeys[displayIndex][self.scope.channelKey];
      var nextChannel = self.scope.channels[displayIndex][nextChannelIndex];

      if (nextChannel.isScheduled) {
        self.scope.channelIndex = nextChannelIndex;
        self.scope.slideIndex = -1;
        self.nextSlide();
      }
      else {
        self.nextChannel();
      }
    }
    else {
      self.restartShow();
    }
  };

  /**
   * Set the next slide, and call displaySlide.
   */
  Region.prototype.nextSlide = function nextSlide() {
    var self = this;

    var nextSlideIndex = self.scope.slideIndex + 1;
    var shadowIndex = self.scope.displayIndex;
    var channels = self.scope.channels;
    var channelIndex = self.scope.channelIndex;

    // If we are at the end of current channel goto the next channel.
    if (!channels[shadowIndex][channelIndex] || nextSlideIndex >= channels[shadowIndex][channelIndex].slides.length) {
      self.nextChannel();
      return;
    }

    // If current channel is empty goto next channel.
    if (channels[shadowIndex][channelIndex] === undefined || channels[shadowIndex][channelIndex].slides.length <= 0) {
      self.nextChannel();
      return;
    }

    // Get current slide.
    self.scope.slideIndex = nextSlideIndex;
    var currentSlide = channels[shadowIndex][channelIndex].slides[nextSlideIndex];

    // If slide is not scheduled, make sure a slide is scheduled, to be shown,
    // then go to next slide else wait 5 seconds and then go to next slide.
    //
    // This is to avoid fast loop over slides that are not scheduled, when no
    // slides are scheduled.
    if (!currentSlide.isScheduled) {
      if (self.isContentScheduled()) {
        // There are more slides to be show.
        self.itkLog.info('Slide schedule: slides remain.');
        self.nextSlide();
      }
      else {
        self.itkLog.info('Slide schedule: slides do not remain');

        // Not slides are currently schedule, hence not slides to show. But
        // slides may become scheduled to be displayed later and to ensure that
        // they are displayed we need to check the schedule.
        // @TODO: Why not check when the next slide is scheduled and set that as
        //        timeout value. If addChannel event is fired cancel this
        //        timeout and resetShow.
        self.$timeout.cancel(self.timeout);
        self.$timeout(function () {
          self.restartShow();
        }, 1000);
      }
    }
    else {
      // Slide is scheduled, show it.
      self.displaySlide();
    }
  };

  /**
   * Update which slides to show next.
   *
   * @param data
   *   Channel content.
   */
  Region.prototype.updateSlideShow = function updateSlideShow(data) {
    var self = this;
    var shadowIndex = self.getShadowIndex();
    var id = "" + data.id;

    self.scope.channels[shadowIndex][id] = angular.copy(data);
    self.scope.channelKeys[shadowIndex] = Object.keys(self.scope.channels[shadowIndex]);

    // Flag content, so that content will be flipped in the next run.
    self.scope.slidesUpdated = true;
  };

  /**
   * Display the current slide.
   */
  Region.prototype.displaySlide = function displaySlide() {
    var self = this;

    // To be sure to be sure that the timeout is completed from the last slide.
    self.$timeout.cancel(self.timeout);

    // Reset the UI elements (Slide counter display x/y and progress bar).
    self.progressBar.next();

    // Get the slide to be displayed.
    var slide = self.scope.channels[self.scope.displayIndex][self.scope.channelIndex].slides[self.scope.slideIndex];

    // Call the run function for the given slide_type.
    if (window.slideFunctions.hasOwnProperty(slide.js_script_id)) {
        window.slideFunctions[slide.js_script_id].run(slide, self);
    }
    else {
      // Script is not available. Wait 5 seconds and continue to next slide.
      self.itkLog.info('slideFunction "' + slide.js_script_id + '" not defined. Wait 5 seconds and continue to next slide.');
      self.$timeout(function () {
          self.nextSlide();
      }, 5000);
    }
  };

  /**
   * Get the index (key) of the current shadow array.
   *
   * @returns {number}
   *   The index in the channels array.
   */
  Region.prototype.getShadowIndex = function getShadowIndex() {
    return (this.scope.displayIndex + 1) % 2;
  };

  /**
   * Region directive.
   *
   * html parameters:
   *   region (integer): region id.
   *   show-progress (boolean): should the progress bar/box be displayed?
   */
  app.directive('region', ['$rootScope', '$timeout', '$interval', 'itkLog', '$http', '$sce', '$filter',
    function ($rootScope, $timeout, $interval, itkLog, $http, $sce, $filter) {
      return {
        restrict: 'E',
        scope: {
          regionId: '=',
          showProgress: '=',
          scale: '='
        },
        link: function (scope) {
          // To get smooth transitions between slides, channels consist of two arrays, that are switched between.
          // The current array consist of the channels that are in the current rotation, and the other array
          // contains future slides.
          scope.channels = [
            {},
            {}
          ];
          // Since channels are set by keys, we need arrays of the keys, that we can cycle between.
          scope.channelKeys = [
            [],
            []
          ];

          var running = false;

          scope.slideIndex = null;
          scope.channelIndex = null;
          scope.displayIndex = 0;
          // @TODO: This could be moved out of scope, but needs to be accessible through the region.
          scope.slidesUpdated = false;

          var progressBar = new ProgressBar(scope, itkLog);
          var region = new Region(scope, itkLog, progressBar, $timeout, $rootScope, $http, $interval, $sce, $filter);

          // Broadcast 0 slides to get the default splash image display during
          // init.
          region.broadcastInfo(0);

          /**
           * Event handler for 'addChannel' event.
           *
           * Content has arrived from the middleware.
           */
          $rootScope.$on('addChannel', function handleAddChannel(event, channel) {
            if (channel === null) {
              return;
            }

            // Check if channel should not be added to region.
            // If it should not be in region and is already, remove it from the region.
            if (channel.regions.indexOf(scope.regionId) === -1) {
              var shadowIndex = region.getShadowIndex();

              var id = "" + channel.data.id;

              if (scope.channels[shadowIndex].hasOwnProperty(id)) {
                itkLog.info("Removing channel " + channel.data.id + " from region " + scope.regionId);

                delete scope.channels[shadowIndex][id];
                scope.channelKeys[shadowIndex] = Object.keys(scope.channels[shadowIndex]);
                scope.slidesUpdated = true;
              }

              return;
            }

            itkLog.info("Adding channel " + channel.data.id + " to region " + scope.regionId);

            // The show is running simply update the slides.
            if (running) {
              region.updateSlideShow(channel.data);
            }
            else {
              // Ensures that this else statement is only runned one time.
              running = true;

              // The show was not running, so update the slides and start the show.
              // @TODO: Information about shadow.
              scope.$apply(function () {
                // Insert channel into both arrays.
                var id = "" + channel.data.id;
                scope.channels[0][id] = angular.copy(channel.data);
                scope.channels[1][id] = angular.copy(channel.data);

                // Update key arrays
                scope.channelKeys[0] = Object.keys(scope.channels[0]);
                scope.channelKeys[1] = Object.keys(scope.channels[1]);

                // Select first channel. It's -1 because it +1 in the
                // nextChannel function hence first is index 0
                scope.channelKey = -1;

                // Make sure the slides have been loaded. Then start the show.
                // @TODO: We need to find an way to detect that the first slide
                //        content have been loaded.
                $timeout(function () {
                  // The first slide index is 0, so its ++1 in the nextSlide,
                  // hence -1 is the first index.
                  scope.slideIndex = -1;

                  // Mark channels and slides that should not be show as isScheduled = false
                  region.updateScheduling();

                  // Reset progress box
                  region.broadcastInfo(progressBar.resetBox());

                  region.nextChannel();
                }, 1000);
              });
            }
          });

          /**
           * Event handler for 'removeChannel' event.
           *
           * Remove the channel from the next display array.
           */
          $rootScope.$on('removeChannel', function removeChannelEvent(event, channel) {
            var shadowIndex = region.getShadowIndex();
            var id = "" + channel.id;

            // If the channel is in the array, remove it.
            if (scope.channels[shadowIndex].hasOwnProperty(id)) {
              itkLog.info("Removing channel " + channel.id + " from region " + scope.regionId + " with shadowIndex: " + shadowIndex);

              delete scope.channels[shadowIndex][id];
              scope.channelKeys[shadowIndex] = Object.keys(scope.channels[shadowIndex]);
              scope.slidesUpdated = true;
            }
          });
        },
        templateUrl: 'app/shared/region/region.html?' + window.config.version
      };
    }
  ]);
}).call(this);
