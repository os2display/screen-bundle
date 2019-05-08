/**
 * Pull strategy for getting data from the administration.
 */
angular.module('ikApp').factory('pull', [
    '$rootScope', 'logging', '$interval', '$http',
    function ($rootScope, logging, $interval, $http) {
        'use strict';

        var factory = {};

        // Get the load configuration object.
        var config = window.config;

        if (config.strategy !== 'pull') {
            return factory;
        }

        logging.info("Data strategy: 'pull'");

        var previousChannels = [];

        var initialized = false;

        function pullData () {
            $http.get(config.updatePath).then(
                function success (response) {
                    var data = response.data;

                    if (!initialized) {
                        $rootScope.$emit('start', data.screen);
                        initialized = true;
                    }

                    var channels = Object.values(data.channels);

                    // Find channels that should be removed.
                    var removedChannels = previousChannels.filter(function (previousChannel) {
                        var id = previousChannel.data.id;

                        var find = channels.find(function (element) {
                            return element.data.id === id;
                        });

                        return !find;
                    });

                    removedChannels.forEach(function (removedChannel) {
                        $rootScope.$emit('removeChannel', removedChannel.data);
                    });

                    for (var channel in channels) {
                        if (!channels.hasOwnProperty(channel)) {
                            continue;
                        }

                        channel = channels[channel];

                        (function (hash){
                            // If channel hash is different from previous channel hash, add it again.
                            if (!previousChannels.find(function (element) {
                                    return element.hash === hash;
                                })
                            ) {
                                $rootScope.$emit('addChannel', channel);
                            }
                        })(channel.hash);
                    }

                    previousChannels = channels;
                },
                function err (response) {
                    logging.error(response.data, response.status);
                }
            );
        }

        pullData();

        $rootScope.$on('connectionStart', function () {
            logging.info('Connection start');
            $interval(pullData, config.updateInterval * 1000);
        });

        return factory;
    }
]);
