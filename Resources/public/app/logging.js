// Check that window.config.logging exists.
if (!window.config || !window.config.logging) {
    throw 'logging Exception: window.config.logging does not exist';
}

/**
 * Logging.
 */
angular.module('ikApp').factory('logging', [
        '$http', '$timeout', '$log',
        function ($http, $timeout, $log) {
            'use strict';

            var config = window.config.logging;

            var factory = {};
            factory.message = null;

            /**
             * Log an error.
             * And post to backend.
             *
             * @param message
             *   Error message.
             * @param cause
             *   Cause of error.
             */
            factory.error = function error (message, cause) {
                if (config.logLevel !== 'none') {
                    var error = {
                        'type': 'error',
                        'date': new Date(),
                        'message': '' + message,
                        'cause': cause
                    };

                    factory.message = error;

                    if (config.logToConsole) {
                        $log.error(error);
                    }
                }
            };

            /**
             * Log a message.
             *
             * @param message
             *   Message to log.
             * @param timeout
             *   Clear log after timeout, if set.
             */
            factory.log = function log (message, timeout) {
                if (config.logLevel === 'all') {
                    factory.message = {
                        'type': 'log',
                        'date': new Date(),
                        'message': message
                    };

                    if (config.logToConsole) {
                        $log.log(message);
                    }

                    if (timeout) {
                        $timeout(function () {
                            factory.message = null;
                        }, timeout);
                    }
                }
            };

            /**
             * Info message.
             *
             * @param message
             *   Info message.
             * @param timeout
             *   Clear log after timeout, if set.
             */
            factory.info = function log (message, timeout) {
                if (config.logLevel === 'all') {
                    factory.message = {
                        'type': 'info',
                        'date': new Date(),
                        'message': message
                    };

                    if (config.logToConsole) {
                        $log.info(message);
                    }

                    if (timeout) {
                        $timeout(function () {
                            factory.message = null;
                        }, timeout);
                    }
                }
            };

            /**
             * Warn message.
             *
             * @param message
             *   Warn message.
             * @param timeout
             *   Clear log after timeout, if set.
             */
            factory.warn = function warn (message, timeout) {
                if (config.logLevel === 'all') {
                    factory.message = {
                        'type': 'warn',
                        'date': new Date(),
                        'message': message
                    };

                    if (config.logToConsole) {
                        $log.warn(message);
                    }

                    if (timeout) {
                        $timeout(function () {
                            factory.message = null;
                        }, timeout);
                    }
                }
            };

            /**
             * Clear latest exception.
             */
            factory.clear = function () {
                factory.message = null;
            };

            return factory;
        }
    ]
);

/**
 * itk-log directive.
 *
 * Displays the current message from logging.
 */
angular.module('ikApp').directive('logging', [
    'logging',
    function (logging) {
        'use strict';

        return {
            restrict: 'E',
            templateUrl: '/bundles/os2displayscreen/app/views/logging.html',
            link: function (scope) {
                scope.expanded = false;

                /**
                 * Expand/Collapse extra info.
                 */
                scope.toggleExpanded = function toggleExpanded () {
                    scope.expanded = !scope.expanded;
                };

                /**
                 * Clear log.
                 */
                scope.clearLog = function clearLog () {
                    logging.clear();
                };

                /**
                 * Get exception.
                 */
                scope.getLogMessage = function getLogMessage () {
                    return logging.message;
                };
            }
        };
    }
]);
