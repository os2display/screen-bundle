<?php

namespace Os2Display\ScreenBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader;
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
    }
}
