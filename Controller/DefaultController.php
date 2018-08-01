<?php

namespace Os2Display\ScreenBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function pullAction()
    {
        $screenConfig = (object)[
            'strategy' => 'pull',
            'updateInterval' => 5000,
            'updatePath' => 'screen/serialized/',
            'screenId' => 1,
            'apikey' => '059d9d9c50e0c45b529407b183b6a02f',
            'debug' => true,
            'version' => $this->container->getParameter('version'),
            'logging' => (object)[
                'logToConsole' => true,
                'logLevel' => 'all',
            ]
        ];

        return $this->render('Os2DisplayScreenBundle:Default:index.html.twig', [
            'screenConfig' => $screenConfig,
        ]);
    }

    public function pushAction()
    {
        $screenConfig = (object)[
            'strategy' => 'push',
            'resource' => (object)[
                'server' => '//admin.os2display.vm/',
                'uri' => 'middleware',
            ],
            'ws' => (object)[
                'server' => 'https://screen.os2display.vm/',
            ],
            'apikey' => '059d9d9c50e0c45b529407b183b6a02f',
            'cookie' => (object)[
                'secure' => false,
            ],
            'debug' => true,
            'version' => $this->container->getParameter('version'),
            'logging' => (object)[
                'logToConsole' => true,
                'logLevel' => 'all',
            ]
        ];

        return $this->render('Os2DisplayScreenBundle:Default:index.html.twig', [
            'screenConfig' => $screenConfig,
        ]);
    }
}
