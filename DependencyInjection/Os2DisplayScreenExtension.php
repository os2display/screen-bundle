<?php

namespace Os2Display\ScreenBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Os2Display\CoreBundle\DependencyInjection\Os2DisplayBaseExtension;

/**
 * This is the class that loads and manages your bundle configuration.
 *
 * @link http://symfony.com/doc/current/cookbook/bundles/extension.html
 */
class Os2DisplayScreenExtension extends Os2DisplayBaseExtension {
    /**
     * {@inheritdoc}
     */
    public function load(array $configs, ContainerBuilder $container) {
        $this->dir = __DIR__;

        parent::load($configs, $container);

        $configuration = new Configuration();
        $processedConfig = $this->processConfiguration($configuration, $configs);

        $defaultConfig = [
            'strategies' => [
                'pull' => [
                    'enabled' => true,
                    'debug' => false,
                    'log_to_console' => false,
                    'log_level' => 'error',
                    'update_interval' => 60 * 5,
                ],
                'push' => [
                    'enabled' => true,
                    'debug' => false,
                    'log_to_console' => false,
                    'log_level' => 'error',
                    'resource' => [
                        'server' => '%absolute_path_to_server%/',
                        'uri' => 'middleware',
                    ],
                    'ws' => [
                        'server' => '%middleware_host%',
                    ],
                    'apikey' => '%middleware_apikey%',
                    'cookie' => [
                        'secure' => false,
                    ],
                    'fallback_image' => '/bundles/os2displayscreen/assets/images/fallback_default.png'
                ],
            ],
        ];

        $resultingConfig = array_replace_recursive($defaultConfig, $processedConfig);

        $container->setParameter('os2_display_screen.strategies.pull.enabled', $resultingConfig['strategies']['pull']['enabled']);
        $container->setParameter('os2_display_screen.strategies.pull.debug', $resultingConfig['strategies']['pull']['debug']);
        $container->setParameter('os2_display_screen.strategies.pull.log_to_console', $resultingConfig['strategies']['pull']['log_to_console']);
        $container->setParameter('os2_display_screen.strategies.pull.log_level', $resultingConfig['strategies']['pull']['log_level']);
        $container->setParameter('os2_display_screen.strategies.pull.update_interval', $resultingConfig['strategies']['pull']['update_interval']);
        $container->setParameter('os2_display_screen.strategies.pull.fallback_image', $resultingConfig['strategies']['pull']['fallback_image']);

        $container->setParameter('os2_display_screen.strategies.push.enabled', $resultingConfig['strategies']['push']['enabled']);
        $container->setParameter('os2_display_screen.strategies.push.debug', $resultingConfig['strategies']['push']['debug']);
        $container->setParameter('os2_display_screen.strategies.push.log_to_console', $resultingConfig['strategies']['push']['log_to_console']);
        $container->setParameter('os2_display_screen.strategies.push.log_level', $resultingConfig['strategies']['push']['log_level']);
        $container->setParameter('os2_display_screen.strategies.push.resource.server', $resultingConfig['strategies']['push']['resource']['server']);
        $container->setParameter('os2_display_screen.strategies.push.resource.uri', $resultingConfig['strategies']['push']['resource']['uri']);
        $container->setParameter('os2_display_screen.strategies.push.ws.server', $resultingConfig['strategies']['push']['ws']['server']);
        $container->setParameter('os2_display_screen.strategies.push.cookie.secure', $resultingConfig['strategies']['push']['cookie']['secure']);
        $container->setParameter('os2_display_screen.strategies.push.fallback_image', $resultingConfig['strategies']['push']['fallback_image']);
    }
}
