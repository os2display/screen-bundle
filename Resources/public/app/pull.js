angular.module('ikApp').factory('pullStrategy', [
    '$rootScope', 'logging', '$interval', '$http',
    function ($rootScope, logging, $interval, $http) {
        'use strict';

        var factory = {};

        // Get the load configuration object.
        var config = window.config;

        if (config.strategy !== 'pull') {
            return factory;
        }

        var previousChannels = [];

        var initialized = false;

        function pullData () {
            $http.get(config.updatePath + config.screenId).then(
                function success (response) {
                    var data = response.data;

                    if (!initialized) {
                        $rootScope.$emit('start', data.screen);
                        initialized = true;
                    }

                    var channels = Object.values(data.channels);

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
                        channel = channels[channel];
                        $rootScope.$emit('addChannel', channel);
                    }

                    previousChannels = channels;
                },
                function err (err) {
                    console.log(err);
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
