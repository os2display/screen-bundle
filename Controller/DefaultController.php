<?php

namespace Os2Display\ScreenBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class DefaultController extends Controller
{
    /**
     * Get the current content for a screen.
     *
     * @param $screenId
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getCurrentScreenContentAction($screenId) {
        $middlewareService = $this->container->get('os2display.middleware.service');

        return new JsonResponse($middlewareService->getCurrentScreenArray($screenId));
    }

    /**
     * Render screen without middleware, but with pull strategy instead.
     *
     * @param $screenId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function pullAction($screenId)
    {
        $screenConfig = (object)[
            'strategy' => 'pull',
            'updateInterval' => 15,
            'updatePath' => '/screen/serialized/',
            'screenId' => $screenId,
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

    /**
     * Render screen with connection to middleware.
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
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
