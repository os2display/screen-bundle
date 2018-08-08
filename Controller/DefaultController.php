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
            'updateInterval' => $this->container->getParameter('os2_display_screen.strategies.pull.update_interval'),
            'updatePath' => $this->container->getParameter('os2_display_screen.strategies.pull.update_path'),
            'screenId' => $screenId,
            'debug' => $this->container->getParameter('os2_display_screen.strategies.pull.debug'),
            'version' => $this->container->getParameter('version'),
            'logging' => (object)[
                'logToConsole' => $this->container->getParameter('os2_display_screen.strategies.pull.log_to_console'),
                'logLevel' => $this->container->getParameter('os2_display_screen.strategies.pull.log_level'),
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
                'server' => $this->container->getParameter('os2_display_screen.strategies.push.resource.server'),
                'uri' => $this->container->getParameter('os2_display_screen.strategies.push.resource.uri'),
            ],
            'ws' => (object)[
                'server' => $this->container->getParameter('os2_display_screen.strategies.push.ws.server'),
            ],
            'apikey' => $this->container->getParameter('middleware_apikey'),
            'cookie' => (object)[
               'secure' => $this->container->getParameter('os2_display_screen.strategies.push.cookie.secure'),
            ],
            'debug' => $this->container->getParameter('os2_display_screen.strategies.push.debug'),
            'version' => $this->container->getParameter('version'),
            'logging' => (object)[
                'logToConsole' => $this->container->getParameter('os2_display_screen.strategies.push.log_to_console'),
                'logLevel' => $this->container->getParameter('os2_display_screen.strategies.push.log_level'),
            ]
        ];

        return $this->render('Os2DisplayScreenBundle:Default:index.html.twig', [
            'screenConfig' => $screenConfig,
        ]);
    }
}
