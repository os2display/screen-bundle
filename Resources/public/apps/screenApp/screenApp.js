/**
 * @file
 * Sets up the Screen App.
 */

// Create module and configure routing and translations.
angular.module('screenApp').config([
    '$translateProvider', function ($translateProvider) {
        'use strict';

        var appUrl = 'bundles/os2displayscreen/apps/screenApp/';

        // Set up translations.
        $translateProvider
            .useSanitizeValueStrategy('escape')
            .useStaticFilesLoader({
                prefix: appUrl + 'translations/locale-',
                suffix: '.json'
            })
            .preferredLanguage('da')
            .fallbackLanguage('da')
            .forceAsyncReload(true);
    }
]);

// Setup the app.
angular.module('screenApp').service('screenAppSetup', [
    'busService', 'userService', '$translate', '$filter', '$http', '$timeout',
    function (busService, userService, $translate, $filter, $http, $timeout) {
        'use strict';

        function setupScreenBundleOpenPreview(data) {
            if (!data.scope.hasOwnProperty('screenBundleOpenPreview')) {
                data.scope.screenBundleOpenPreview = function (id) {
                    data.scope.screenBundleShowPreview = id;
                };

                data.scope.screenBundleClosePreview = function () {
                    $timeout(function () {
                        data.scope.$apply(function () {
                            data.scope.screenBundleShowPreview = null;
                        });
                    });
                };
            }
        }

        busService.$on('itkHeader.list.element.requestItems', function (event, data) {
            if (data.type === 'screen') {
                setupScreenBundleOpenPreview(data);

                var title = $translate.instant('screen.app.start_preview');

                var html = '<div><a ng-click="screenBundleOpenPreview(' + data.entity.id + ')" class="os2display-screen-bundle--play-icon-active" title="' + title + '"><img class="os2display-screen-bundle--play-icon" src="bundles/os2displayscreen/assets/icons/play.svg"</a>' +
                    '<span data-ng-if="screenBundleShowPreview === ' + data.entity.id + '">' +
                        '<screen-bundle-preview-screen screen-id="' + data.entity.id + '" close="screenBundleClosePreview()"></screen-bundle-preview-screen>' +
                    '</span></div>';

                $http.get('/screen/api/publicly_available/' + data.entity.id).then(
                    function (response) {
                        if (response.data.enabled) {
                            var title = $translate.instant('screen.app.public');

                            var html = '<div><img class="os2display-screen-bundle--unlocked-icon" src="bundles/os2displayscreen/assets/icons/public.svg" title="' + title + '"/></div>';

                            busService.$emit(data.returnEvent, {
                                html: html
                            });
                        }
                    },
                    function (err) {
                        if (err.status !== 404) {
                            console.log(err);
                        }
                    }
                );

                busService.$emit(data.returnEvent, {
                    html: html
                });
            }
        });

        // Inject into screen page.
        busService.$on('itkHeader.screen.extra-fields.requestItems', function (event, data) {
            if (data.type === 'screen') {
                data.scope.screenBundlePublicUrl = null;
                data.scope.screenBundlePublicEnabled = null;

                $http.get('/screen/api/publicly_available/' + data.entity.id).then(
                    function (response) {
                        $timeout(function () {
                                data.scope.$apply(function () {
                                    data.scope.screenBundlePublicUrl = response.data.publicUrl;
                                    data.scope.screenBundlePublicEnabled = response.data.enabled;
                                });
                        });
                    },
                    function (err) {
                        if (err.status !== 404) {
                            console.log(err);
                        }
                    }
                );

                if (!data.scope.hasOwnProperty('screenBundleTogglePublicAvailable')) {
                    data.scope.screenBundleTogglePublicAvailable = function () {
                        $http.post('/screen/api/publicly_available/' + data.entity.id, {
                            enabled: !data.scope.screenBundlePublicEnabled
                        }).then(
                            function (response) {
                                $timeout(function () {
                                    data.scope.$apply(function () {
                                        data.scope.screenBundlePublicUrl = response.data.publicUrl;
                                        data.scope.screenBundlePublicEnabled = response.data.enabled;
                                    });
                                });
                            },
                            function (err) {
                                if (err.status !== 404) {
                                    console.log(err);
                                }
                            }
                        );
                    };
                }

                setupScreenBundleOpenPreview(data);

                var html =
                    '<form class="cpw--wrapper" data-info="From: screen-bundle">' +
                        '<div class="cpw--text">' +
                            '<label class="cpw--text-label">' + $translate.instant('screen.extra_fields.preview') + '</label>' +
                            '<button class="cpw--add-channels-item-action os2display-screen-bundle--extra-fields-button" data-ng-click="screenBundleOpenPreview(' + data.entity.id + ')">' + $translate.instant('screen.extra_fields.preview_button') + '</button>' +
                            '<span data-ng-if="screenBundleShowPreview === ' + data.entity.id + '">' +
                                '<screen-bundle-preview-screen screen-id="' + data.entity.id + '" close="screenBundleClosePreview()"></screen-bundle-preview-screen>' +
                            '</span>' +
                        '</div>' +
                        '<div class="cpw--text">' +
                            '<label class="cpw--text-label">' + $translate.instant('screen.extra_fields.publicly_available') + '</label>' +
                            '<button data-ng-click="screenBundleTogglePublicAvailable()" class="os2display-screen-bundle--extra-fields-button" data-ng-class="{\'cpw--add-channels-item-action\': !screenBundlePublicEnabled, \'cpw--selected-channels-item-action\': screenBundlePublicEnabled}">' +
                                '<span data-ng-if="screenBundlePublicEnabled">' + $translate.instant('screen.extra_fields.publicly_available_toggle_enabled') +  '</span>' +
                                '<span data-ng-if="!screenBundlePublicEnabled">' + $translate.instant('screen.extra_fields.publicly_available_toggle_disabled') + '</span>' +
                            '</button>' +
                        '</div>' +
                        '<div class="cpw--text" data-ng-if="screenBundlePublicEnabled && screenBundlePublicUrl">' +
                            '<label class="cpw--text-label">' + $translate.instant('screen.extra_fields.public_url') + '</label>' +
                            '<input type="text" class="cpw--text-input" readonly="readonly" data-ng-model="screenBundlePublicUrl">' +
                        '</div>' +
                    '</form>';

                busService.$emit(data.returnEvent, {
                    html: html
                });
            }
        });
    }
]);
