<?php

namespace Os2Display\ScreenBundle\Controller;

use Os2Display\ScreenBundle\Entity\PublicScreen;
use Os2Display\ScreenBundle\Entity\PublicChannel;
use Os2Display\CoreBundle\Entity\Channel;
use Os2Display\CoreBundle\Entity\Screen;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class DefaultController extends Controller
{
    /**
     * Get the url to the public screen.
     *
     * @param $path
     * @param $publicUrl
     * @return string
     */
    private function getPublicUrl($path, $publicUrl) {
        return $this->getParameter('absolute_path_to_server') . $path . $publicUrl;
    }

    /**
     * Generate unique public id.
     *
     * @param $id
     * @return bool|null|string
     */
    private function generatePublicId($id) {
        $publicId = null;

        $now = new \DateTime();

        do {
            $publicId = substr(sha1($id . $now->getTimestamp()), 0, 8);
        }
        while (
            is_null($publicId) ||
            $this->container->get('doctrine')->getRepository(PublicScreen::class)->findOneByPublicUrl($publicId)
        );

        return $publicId;
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
            return new JsonResponse([
                'screenId' => $screenId,
                'publicUrl' => '',
                'enabled' => false,
            ]);
        }

        return new JsonResponse([
            'screenId' => $screenId,
            'publicUrl' => $this->getPublicUrl('/screen/public/', $publicScreen->getPublicUrl()),
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
            $publicScreen->setPublicUrl($this->generatePublicId($screen->getId()));
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
            'publicUrl' => $this->getPublicUrl('/screen/public/', $publicScreen->getPublicUrl()),
            'enabled' => $publicScreen->getEnabled(),
        ]);
    }


    /**
     * Get channel publicly available status.
     *
     * @param $channelId
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getChannelPubliclyAvailableAction($channelId) {
        $publicChannel = $this->container->get('doctrine')->getRepository(PublicChannel::class)->findOneByChannel($channelId);

        if (!$publicChannel) {
            return new JsonResponse([
                'channelId' => $channelId,
                'publicUrl' => '',
                'enabled' => false,
            ]);
        }

        return new JsonResponse([
            'channelId' => $channelId,
            'publicUrl' => $this->getPublicUrl('/screen/public/channel/', $publicChannel->getPublicUrl()),
            'enabled' => $publicChannel->getEnabled(),
        ]);
    }

    /**
     * Set public available status.
     */
    public function setChannelPubliclyAvailableAction(Request $request, $channelId) {
        // Get json body from the request.
        $post = json_decode($request->getContent());

        $entityManager = $this->container->get('doctrine')->getEntityManager();

        if (!isset($post->enabled)) {
            throw new HttpException(400);
        }

        $enabled = $post->enabled;

        $publicChannel = $entityManager->getRepository(PublicChannel::class)->findOneByChannel($channelId);

        $now = new \DateTime();

        if (!$publicChannel) {
            $channel = $entityManager->getRepository(Channel::class)->findOneById($channelId);

            $publicChannel = new PublicChannel();
            $publicChannel->setChannel($channel);
            $publicChannel->setPublicUrl($this->generatePublicId($channel->getId()));
            $publicChannel->setCreatedAt($now);
            $publicChannel->setUser($this->getUser());
            $publicChannel->setCreatedBy($this->getUser());

            $entityManager->persist($publicChannel);
        }

        $publicChannel->setUpdatedAt($now);
        $publicChannel->setEnabled($enabled);
        $publicChannel->setUpdatedBy($this->getUser());

        $entityManager->flush();

        return new JsonResponse([
            'channelId' => $channelId,
            'publicUrl' => $this->getPublicUrl('/screen/public/channel/', $publicChannel->getPublicUrl()),
            'enabled' => $publicChannel->getEnabled(),
        ]);
    }

    /**
     * Get the current content of a public channel.
     *
     * @param $publicChannelId
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getCurrentChannelContentPublicAction($publicChannelId) {
        $entityManager = $this->container->get('doctrine')->getEntityManager();
        $publicChannel = $entityManager->getRepository(PublicChannel::class)->findOneByPublicUrl($publicChannelId);

        if (!$publicChannel || !$publicChannel->getEnabled()) {
            throw new HttpException(400);
        }

        $channel = $publicChannel->getChannel();
        $channelId = $channel->getId();

        return $this->getCurrentChannelContentAction($channelId);
    }

    /**
     * Get the current content of a public screen.
     *
     * @param $publicScreenId
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getCurrentScreenContentPublicAction($publicScreenId) {
        $entityManager = $this->container->get('doctrine')->getEntityManager();
        $publicScreen = $entityManager->getRepository(PublicScreen::class)->findOneByPublicUrl($publicScreenId);

        if (!$publicScreen || !$publicScreen->getEnabled()) {
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
     * Get the current content for a channel placed in a full-screen screen.
     *
     * @param $channelId
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getCurrentChannelContentAction($channelId) {
        $middlewareService = $this->container->get('os2display.middleware.service');

        return new JsonResponse($middlewareService->getCurrentChannelArray($channelId));
    }

    /**
     * Get publicly available channel.
     *
     * @param $publicChannelId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function pullPublicChannelAction($publicChannelId) {
        $entityManager = $this->container->get('doctrine')->getEntityManager();
        $publicChannel = $entityManager->getRepository(PublicChannel::class)->findOneByPublicUrl($publicChannelId);

        if (!$publicChannel || !$publicChannel->getEnabled()) {
            return $this->render('Os2DisplayScreenBundle:Default:not_allowed.html.twig');
        }

        $screenConfig = (object)[
            'strategy' => 'pull',
            'updateInterval' => $this->container->getParameter('os2_display_screen.strategies.pull.update_interval'),
            'updatePath' => '/screen/public/serialized_channel/' . $publicChannelId,
            'debug' => $this->container->getParameter('os2_display_screen.strategies.pull.debug'),
            'version' => $this->container->getParameter('version'),
            'logging' => (object)[
                'logToConsole' => $this->container->getParameter('os2_display_screen.strategies.pull.log_to_console'),
                'logLevel' => $this->container->getParameter('os2_display_screen.strategies.pull.log_level'),
            ],
            'fallback_image' => $this->container->getParameter('os2_display_screen.strategies.pull.fallback_image'),
        ];

        return $this->render('Os2DisplayScreenBundle:Default:index.html.twig', [
            'screenConfig' => $screenConfig,
        ]);
    }

    /**
     * Render channel without middleware, but with pull strategy instead.
     *
     * @param $channelId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function pullChannelAction($channelId) {
        $screenConfig = (object)[
            'strategy' => 'pull',
            'updateInterval' => $this->container->getParameter('os2_display_screen.strategies.pull.update_interval'),
            'updatePath' => '/screen/serialized_channel/' . $channelId,
            'debug' => $this->container->getParameter('os2_display_screen.strategies.pull.debug'),
            'version' => $this->container->getParameter('version'),
            'logging' => (object)[
                'logToConsole' => $this->container->getParameter('os2_display_screen.strategies.pull.log_to_console'),
                'logLevel' => $this->container->getParameter('os2_display_screen.strategies.pull.log_level'),
            ],
            'fallback_image' => $this->container->getParameter('os2_display_screen.strategies.pull.fallback_image'),
        ];

        return $this->render('Os2DisplayScreenBundle:Default:index.html.twig', [
            'screenConfig' => $screenConfig,
        ]);
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

        $screenConfig = (object)[
            'strategy' => 'pull',
            'updateInterval' => $this->container->getParameter('os2_display_screen.strategies.pull.update_interval'),
            'updatePath' => '/screen/public/serialized/' . $publicScreenId,
            'debug' => $this->container->getParameter('os2_display_screen.strategies.pull.debug'),
            'version' => $this->container->getParameter('version'),
            'logging' => (object)[
                'logToConsole' => $this->container->getParameter('os2_display_screen.strategies.pull.log_to_console'),
                'logLevel' => $this->container->getParameter('os2_display_screen.strategies.pull.log_level'),
            ],
            'fallback_image' => $this->container->getParameter('os2_display_screen.strategies.pull.fallback_image'),
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
            'updatePath' => '/screen/serialized/' . $screenId,
            'debug' => $this->container->getParameter('os2_display_screen.strategies.pull.debug'),
            'version' => $this->container->getParameter('version'),
            'logging' => (object)[
                'logToConsole' => $this->container->getParameter('os2_display_screen.strategies.pull.log_to_console'),
                'logLevel' => $this->container->getParameter('os2_display_screen.strategies.pull.log_level'),
            ],
            'fallback_image' => $this->container->getParameter('os2_display_screen.strategies.pull.fallback_image'),
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
            ],
            'fallback_image' => $this->container->getParameter('os2_display_screen.strategies.push.fallback_image'),
        ];

        return $this->render('Os2DisplayScreenBundle:Default:index.html.twig', [
            'screenConfig' => $screenConfig,
        ]);
    }
}
