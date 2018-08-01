angular.module('ikApp').factory('pullStrategy', ['$rootScope', 'logging', '$interval', '$http',
    function ($rootScope, logging, $interval, $http) {
        'use strict';

        var factory = {};

        // Get the load configuration object.
        var config = window.config;

        if (config.strategy !== 'pull') {
            return factory;
        }

        $rootScope.$on('connectionStart', function () {
            $interval(function () {
                $http.get(config.updatePath + config.screenId).then(
                    function success(data) {
                        console.log(data);
                    },
                    function err(err) {
                        console.log(err);
                    }
                )
            }, config.updateInterval);
        });
    }
]);
