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

class BasicController extends Controller
{
    private function getSavedGraphs()
    {
        $savedGraphsPath = $this->container->getParameter('kernel.root_dir').'\Resources\saved-graphs';

        $fs = new Filesystem();
        if (!$fs->exists($savedGraphsPath)) {
            $fs->mkdir($savedGraphsPath, 777);
        }

        $fn = new Finder();
        $fn->files()
           ->name('*.grph')
           ->in($savedGraphsPath);
        $savedGraphs = [];
        foreach ($fn as $file) {
            $savedGraphs[] = [
                'name' => substr($file->getFilename(), 0, -5),
                'content' => $file->getContents(),
            ];
        }

        return $savedGraphs;
    }

    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request)
    {

        return $this->render('basic/index.html.twig', array(
            'savedGraphs' => $this->getSavedGraphs(),
        ));
    }

    /**
     * @Route("/create-new", name="create new", condition="request.isXmlHttpRequest()")
     * @Method("POST")
     */
    public function createNewAction(Request $request)
    {
        return $this->render('basic/create-new.html.twig');
    }

    /**
     * @Route("/add-new", name="add new", condition="request.isXmlHttpRequest()")
     * @Method("POST")
     */
    public function addNewAction(Request $request)
    {
        $graphName = $request->get('graph-name');

        if (preg_match('/^[\w][\w\-\. ]*$/', $graphName)) {
            $graphPath = $this->container->getParameter('kernel.root_dir')."\\Resources\\saved-graphs\\{$graphName}.grph";

            $fs = new Filesystem();
            if ($fs->exists($graphPath)) {
                return new JsonResponse(array(
                    'graphExists' => 1,
                    'success' => 0,
                ));
            } else {
                $fs->touch($graphPath);

                return new JsonResponse(array(
                    'success' => 1,
                ));
            }
        } else {
            $emptyName = empty($graphName);

            return new JsonResponse(array(
                'emptyName' => $emptyName,
                'success' => 0,
                'wrongName' => !$emptyName,
            ));
        }
    }

    /**
     * @Route("/refresh-list", name="refresh list", condition="request.isXmlHttpRequest()")
     * @Method("POST")
     */
    public function refreshListAction(Request $request)
    {
        try {
            return new JsonResponse(array(
                'savedGraphs' => $this->getSavedGraphs(),
                'success' => 1,
            ));
        } catch (Exception $e) {
            return new JsonResponse(array(
                'success' => 0,
            ));
        }
    }
}
