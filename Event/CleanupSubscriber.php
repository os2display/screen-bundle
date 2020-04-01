<?php

namespace Os2Display\ScreenBundle\Event;

use Doctrine\ORM\EntityManagerInterface;
use Os2Display\CoreBundle\Events\CleanupEvent;
use Os2Display\ScreenBundle\Entity\PublicChannel;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Class CleanupSubscriber
 * @package Os2Display\ScreenBundle\Event
 */
class CleanupSubscriber implements EventSubscriberInterface
{
    protected $entityManager;

    /**
     * CleanupSubscriber constructor.
     */
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * Subscribed events.
     *
     * @return array
     */
    public static function getSubscribedEvents()
    {
        return [
            CleanupEvent::EVENT_CLEANUP_CHANNELS => 'ignorePublicChannels',
        ];
    }

    /**
     * Make sure public channels are not removed.
     *
     * @param \Os2Display\CoreBundle\Events\CleanupEvent $event
     * @return \Os2Display\CoreBundle\Events\CleanupEvent
     */
    public function ignorePublicChannels(CleanupEvent $event)
    {
        $entities = $event->getEntities();

        foreach ($entities as $key => $channel) {
            $qb = $this->entityManager->createQueryBuilder();
            $query = $qb->select('entity')
                ->from(PublicChannel::class, 'entity')
                ->where(':channel = entity.channel')
                ->setParameter('channel', $channel);

            if (count($query->getQuery()->getResult()) > 0) {
                unset($entities[$key]);
            }
        }

        $event->setEntities($entities);

        return $event;
    }
}
