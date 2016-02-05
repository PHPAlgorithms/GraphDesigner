<?php
namespace AppBundle\Controller;

use Algorithms\GraphTools\Point;
use Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ContextMenuController extends Controller
{
    /**
     * @Route("/context-menu-list-element", name="context menu list element", condition="request.isXmlHttpRequest()")
     * @Method("POST")
     */
    public function contextMenuListElementAction(Request $request)
    {
        return new JsonResponse([
            ['change-menu-element-name', 'Change Name'],
            ['remove-menu-element', 'Remove']
        ]);
    }
}
