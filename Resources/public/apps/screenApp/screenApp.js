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
            if (!data) {
                return;
            }

            if (data.type === 'screen' || data.type === 'channel') {
                setupScreenBundleOpenPreview(data);

                var message = $translate.instant('screen.app.start_preview');
                var iconSource = 'bundles/os2displayscreen/assets/icons/play.svg';
                var html =
                    '  <div tooltips tooltip-template="' + message + '" tooltip-side="top">' +
                    '    <a ng-click="screenBundleOpenPreview(' + data.entity.id + ')" class="os2display-screen-bundle--play-icon-active">' +
                    '       <img class="os2display-screen-bundle--play-icon" src="' + iconSource + '"/>' +
                    '    </a>' +
                    '  </div>';

                var previewUrl = '/screen/display' + (data.type === 'channel' ? '_channel' : '') + '/' + data.entity.id;

                html = html +
                    '<span data-ng-if="screenBundleShowPreview === ' + data.entity.id + '">' +
                    '<screen-bundle-preview preview-url="' + previewUrl + '" close="screenBundleClosePreview()"></screen-bundle-preview>' +
                    '</span></div>';

                busService.$emit(data.returnEvent, {
                    html: html
                });

                $http.get('/screen/api/publicly_available' + (data.type === 'channel' ? '_channel' : '') + '/' + data.entity.id).then(
                    function (response) {
                        if (response.data.enabled) {
                            var message = $translate.instant('screen.app.public');
                            var iconSource = 'bundles/os2displayscreen/assets/icons/public.svg';

                            var html =
                            '  <div tooltips tooltip-template="' + message + '" tooltip-side="top">' +
                            '    <div class="os2display-screen-bundle--icon-container"><img class="os2display-screen-bundle--unlocked-icon" src="' + iconSource + '"></div>' +
                            '  </div>';

                            busService.$emit(data.returnEvent, {
                                html: html
                            });
                        }
                    }
                );
            }
        });

        // Inject into screen page.
        busService.$on('itkHeader.settings.extra-fields.requestItems', function (event, data) {
            if (data.type === 'screen' || data.type === 'channel') {
                data.scope.screenBundlePublicUrl = null;
                data.scope.screenBundlePublicEnabled = null;

                var dataUrl = '';
                var previewUrl = '/screen/display' + (data.type === 'channel' ? '_channel' : '') + '/' + data.entity.id;

                if (data.type === 'screen') {
                    dataUrl = '/screen/api/publicly_available/' + data.entity.id;
                }
                else {
                    dataUrl = '/screen/api/publicly_available_channel/' + data.entity.id;
                }


                $http.get(dataUrl).then(
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
                        $http.post(dataUrl, {
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
                                '<screen-bundle-preview preview-url="' + previewUrl + '" close="screenBundleClosePreview()"></screen-bundle-preview>' +
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
                            '<textarea type="text" class="cpw--text-input" readonly="readonly" data-ng-model="screenBundlePublicUrl">' +
                        '</div>' +
                    '</form>';

                busService.$emit(data.returnEvent, {
                    html: html
                });
            }
        });
    }
]);
