<?php

namespace Os2Display\ScreenBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

/**
 * This is the class that validates and merges configuration from your app/config files.
 *
 * To learn more see {@link http://symfony.com/doc/current/cookbook/bundles/configuration.html}
 */
class Configuration implements ConfigurationInterface
{
    /**
     * {@inheritdoc}
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root('os2_display_screen');

        $rootNode
            ->children()
                ->arrayNode('strategies')
                    ->children()
                        ->arrayNode('pull')
                            ->children()
                                ->booleanNode('enabled')->defaultTrue()->end()
                                ->booleanNode('debug')->defaultTrue()->end()
                                ->booleanNode('log_to_console')->defaultTrue()->end()
                                ->scalarNode('log_level')->defaultValue('all')->end()
                                ->integerNode('update_interval')->defaultValue('60')->end()
                                ->scalarNode('fallback_image')->end()
                            ->end()
                        ->end()
                        ->arrayNode('push')
                            ->children()
                                ->booleanNode('enabled')->defaultTrue()->end()
                                ->booleanNode('debug')->defaultTrue()->end()
                                ->booleanNode('log_to_console')->defaultTrue()->end()
                                ->scalarNode('log_level')->defaultValue('all')->end()
                                ->arrayNode('resource')
                                    ->children()
                                        ->scalarNode('server')->end()
                                        ->scalarNode('uri')->end()
                                    ->end()
                                ->end()
                                ->arrayNode('ws')
                                    ->children()
                                        ->scalarNode('server')->end()
                                    ->end()
                                ->end()
                                ->arrayNode('cookie')
                                    ->children()
                                        ->scalarNode('secure')->defaultFalse()->end()
                                    ->end()
                                ->end()
                                ->scalarNode('fallback_image')->end()
                            ->end()
                        ->end()
                    ->end()
                ->end()
            ->end()
        ;

        return $treeBuilder;
    }
}
