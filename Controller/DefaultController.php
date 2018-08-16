<?php

namespace Os2Display\ScreenBundle\Controller;

use Os2Display\ScreenBundle\Entity\PublicScreen;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Os2Display\CoreBundle\Entity\Screen;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class DefaultController extends Controller
{
    private function getPublicUrl($publicScreen) {
        return $this->getParameter('absolute_path_to_server') . '/screen/public/' . $publicScreen->getPublicUrl();
    }

    /**
     * Get screen publicly available status.
     *
     * @param $screenId
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getScreenPubliclyAvailableAction($screenId) {
        $publicScreen = $this->container->get('doctrine')->getRepository(PublicScreen::class)->findOneByScreen($screenId);

        if (!$publicScreen) {
            throw new HttpException(404);
        }

        return new JsonResponse([
            'screenId' => $screenId,
            'publicUrl' => $this->getPublicUrl($publicScreen),
            'enabled' => $publicScreen->getEnabled(),
        ]);
    }

    /**
     * Set public available status.
     */
    public function setScreenPubliclyAvailableAction(Request $request, $screenId) {
        // Get json body from the request.
        $post = json_decode($request->getContent());

        $entityManager = $this->container->get('doctrine')->getEntityManager();

        if (!isset($post->enabled)) {
            throw new HttpException(400);
        }

        $enabled = $post->enabled;

        $publicScreen = $entityManager->getRepository(PublicScreen::class)->findOneByScreen($screenId);

        $now = new \DateTime();

        if (!$publicScreen) {
            $screen = $entityManager->getRepository(Screen::class)->findOneById($screenId);

            $publicScreen = new PublicScreen();
            $publicScreen->setScreen($screen);
            $publicScreen->setPublicUrl(sha1($screen->getId() . $now->getTimestamp()));
            $publicScreen->setCreatedAt($now);
            $publicScreen->setUser($this->getUser());
            $publicScreen->setCreatedBy($this->getUser());

            $entityManager->persist($publicScreen);
        }

        $publicScreen->setUpdatedAt($now);
        $publicScreen->setEnabled($enabled);
        $publicScreen->setUpdatedBy($this->getUser());

        $entityManager->flush();

        return new JsonResponse([
            'screenId' => $screenId,
            'publicUrl' => $this->getPublicUrl($publicScreen),
            'enabled' => $publicScreen->getEnabled(),
        ]);
    }

    public function getCurrentScreenContentPublicAction($publicScreenId) {
        $entityManager = $this->container->get('doctrine')->getEntityManager();
        $publicScreen = $entityManager->getRepository(PublicScreen::class)->findOneByPublicUrl($publicScreenId);

        if (!$publicScreen || !$publicScreen->getEnabled()) {
            // @TODO: Better error page.
            throw new HttpException(400);
        }

        $screen = $publicScreen->getScreen();
        $screenId = $screen->getId();

        return $this->getCurrentScreenContentAction($screenId);
    }

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
     * Get publicly available screen.
     *
     * @param $publicScreenId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function pullPublicScreenAction($publicScreenId) {
        $entityManager = $this->container->get('doctrine')->getEntityManager();
        $publicScreen = $entityManager->getRepository(PublicScreen::class)->findOneByPublicUrl($publicScreenId);

        if (!$publicScreen || !$publicScreen->getEnabled()) {
            return $this->render('Os2DisplayScreenBundle:Default:not_allowed.html.twig');
        }

        $screen = $publicScreen->getScreen();
        $screenId = $screen->getId();

        $screenConfig = (object)[
            'strategy' => 'pull',
            'updateInterval' => $this->container->getParameter('os2_display_screen.strategies.pull.update_interval'),
            'updatePath' => '/screen/public/serialized/',
            'screenId' => $publicScreenId,
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
