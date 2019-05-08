<?php
/**
 * @file
 * Contains the PublicScreen model.
 */

namespace Os2Display\ScreenBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Blameable\Traits\BlameableEntity;
use Gedmo\Mapping\Annotation as Gedmo;
use Gedmo\Timestampable\Traits\TimestampableEntity;
use Os2Display\CoreBundle\Entity\ApiEntity;

/**
 * PublicScreen entity.
 *
 * @ORM\Table(name="ik_public_screen")
 * @ORM\Entity
 */
class PublicScreen extends ApiEntity
{
    use TimestampableEntity;
    use BlameableEntity;

    /**
     * Id.
     *
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * User that created the channel.
     *
     * @Gedmo\Blameable(on="create")
     * @ORM\ManyToOne(targetEntity="Os2Display\CoreBundle\Entity\User")
     * @ORM\JoinColumn(name="user")
     */
    private $user;

    /**
     * Screen that is public.
     *
     * @ORM\OneToOne(targetEntity="Os2Display\CoreBundle\Entity\Screen")
     */
    private $screen;

    /**
     * @ORM\Column(type="string")
     */
    private $publicUrl;

    /**
     * @ORM\Column(type="boolean")
     */
    private $enabled;

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return mixed
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @param mixed $user
     */
    public function setUser($user)
    {
        $this->user = $user;
    }

    /**
     * @return mixed
     */
    public function getScreen()
    {
        return $this->screen;
    }

    /**
     * @param mixed $screen
     */
    public function setScreen($screen)
    {
        $this->screen = $screen;
    }

    /**
     * @return mixed
     */
    public function getPublicUrl()
    {
        return $this->publicUrl;
    }

    /**
     * @param mixed $publicUrl
     */
    public function setPublicUrl($publicUrl)
    {
        $this->publicUrl = $publicUrl;
    }

    /**
     * @return mixed
     */
    public function getEnabled()
    {
        return $this->enabled;
    }

    /**
     * @param mixed $enabled
     */
    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;
    }
}
