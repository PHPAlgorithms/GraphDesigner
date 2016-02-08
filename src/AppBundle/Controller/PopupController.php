<?php
namespace AppBundle\Controller;

use Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Filesystem\Filesystem;
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
        $graphName = trim($request->get('graph-name'));

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

    /**
     * @Route("/change-name", name="change name", condition="request.isXmlHttpRequest()")
     * @Method("POST")
     */
    public function changeNameAction(Request $request)
    {
        return $this->render('popup/change-name.html.twig');
    }

    /**
     * @Route("/rename-graph", name="rename graph", condition="request.isXmlHttpRequest()")
     * @Method("POST")
     */
    public function renameAction(Request $request)
    {
        $oldGraphName = trim($request->get('old-graph-name'));
        $newGraphName = trim($request->get('new-graph-name'));

        if (preg_match('/^[\w][\w\-\. ]*$/', $newGraphName) && !empty($oldGraphName)) {
            $oldGraphPath = $this->container
                              ->getParameter('kernel.root_dir') . "\\Resources\\saved-graphs\\{$oldGraphName}.grph";

            $fs = new Filesystem();
            if ($fs->exists($oldGraphPath)) {
                $newGraphPath = $this->container
                              ->getParameter('kernel.root_dir') . "\\Resources\\saved-graphs\\{$newGraphName}.grph";

                $fs->rename($oldGraphPath, $newGraphPath);
                return new JsonResponse([
                    'success' => 1,
                ]);
            } else {
                return new JsonResponse([
                    'graphExists' => 0,
                    'success' => 0,
                ]);
            }
        } else {
            $emptyName = empty($newGraphName);

            return new JsonResponse([
                'emptyName' => $emptyName | empty($oldGraphName),
                'success' => 0,
                'wrongName' => !$emptyName,
            ]);
        }
    }
}
