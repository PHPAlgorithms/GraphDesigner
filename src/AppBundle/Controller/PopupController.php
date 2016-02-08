<?php
namespace AppBundle\Controller;

use Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class PopupController extends Controller
{
    /**
     * @Route("/create-new", name="create new", condition="request.isXmlHttpRequest()")
     * @Method("POST")
     */
    public function createNewAction(Request $request)
    {
        return $this->render('popup/create-new.html.twig');
    }

    /**
     * @Route("/add-new", name="add new", condition="request.isXmlHttpRequest()")
     * @Method("POST")
     */
    public function addNewAction(Request $request)
    {
        $graphName = $request->get('graph-name');

        if (preg_match('/^[\w][\w\-\. ]*$/', $graphName)) {
            $graphPath = $this->container
                              ->getParameter('kernel.root_dir') . "\\Resources\\saved-graphs\\{$graphName}.grph";

            $fs = new Filesystem();
            if ($fs->exists($graphPath)) {
                return new JsonResponse([
                    'graphExists' => 1,
                    'success' => 0,
                ]);
            } else {
                $fs->touch($graphPath);

                return new JsonResponse([
                    'success' => 1,
                ]);
            }
        } else {
            $emptyName = empty($graphName);

            return new JsonResponse([
                'emptyName' => $emptyName,
                'success' => 0,
                'wrongName' => !$emptyName,
            ]);
        }
    }
}
