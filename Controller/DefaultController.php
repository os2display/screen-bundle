<?php

namespace Os2Display\ScreenBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('Os2DisplayScreenBundle:Default:index.html.twig');
    }
}
