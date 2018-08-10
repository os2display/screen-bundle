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
    'busService', 'userService', '$translate', '$filter', '$http',
    function (busService, userService, $translate, $filter, $http) {
        'use strict';

        // Inject into screen page.
        busService.$on('itkHeader.screen.extra-fields.requestItems', function (event, data) {
            if (data.type === 'screen') {
                data.scope.screenBundlePublicUrl = null;
                data.scope.screenBundlePublicEnabled = null;

                $http.get('/screen/api/publicly_available/' + data.entity.id).then(
                    function (response) {
                        data.scope.$apply(function () {
                            data.scope.screenBundlePublicUrl = response.data.publicUrl;
                            data.scope.screenBundlePublicEnabled = response.data.enabled;
                        });
                    },
                    function (err) {
                        if (err.status !== 404) {
                            console.log(err);
                        }
                    }
                );

                data.scope.screenBundleTogglePublicAvailable = function () {
                    $http.post('/screen/api/publicly_available/' + data.entity.id, {
                        enabled: !data.scope.screenBundlePublicEnabled
                    }).then(
                        function (response) {
                            data.scope.$apply(function () {
                                data.scope.screenBundlePublicUrl = response.data.publicUrl;
                                data.scope.screenBundlePublicEnabled = response.data.enabled;
                            });
                        },
                        function (err) {
                            if (err.status !== 404) {
                                console.log(err);
                            }
                        }
                    );
                };

                var html =
                    '<form class="cpw--wrapper" data-info="From: screen-bundle">' +
                        '<div class="cpw--text" data-ng-if="screenBundlePublicEnabled && screenBundlePublicUrl">' +
                            '<label class="cpw--text-label">' + $translate.instant('screen.extra_fields.public_url') + '</label>' +
                            '<input type="text" class="cpw--text-input" readonly="readonly" data-ng-model="screenBundlePublicUrl">' +
                        '</div>' +
                        '<div class="cpw--text" data-ng-if="screenBundlePublicEnabled !== null">' +
                            '<label class="cpw--text-label">' + $translate.instant('screen.extra_fields.publicly_available') + '</label>' +
                            '<button data-ng-click="screenBundleTogglePublicAvailable()" data-ng-class="{\'cpw--add-channels-item-action\': !screenBundlePublicEnabled, \'cpw--selected-channels-item-action\': screenBundlePublicEnabled}">' +
                                '<span data-ng-if="screenBundlePublicEnabled">' + $translate.instant('screen.extra_fields.publicly_available_toggle_enabled') +  '</span>' +
                                '<span data-ng-if="!screenBundlePublicEnabled">' + $translate.instant('screen.extra_fields.publicly_available_toggle_disabled') + '</span>' +
                            '</button>' +
                        '</div>' +
                    '</form>';

                busService.$emit(data.returnEvent, {
                    html: html
                });
            }
        });
    }
]);

// Start the service.
angular.module('screenApp').run(['screenAppSetup', angular.noop]);
