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
        $savedGraphsPath = $this->container
                                ->getParameter('kernel.root_dir') . '\\Resources\\saved-graphs';

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
     * @Route("/refresh-list", name="refresh list", condition="request.isXmlHttpRequest()")
     * @Method("POST")
     */
    public function refreshListAction(Request $request)
    {
        try {
            return new JsonResponse([
                'savedGraphs' => $this->getSavedGraphs(),
                'success' => 1,
            ]);
        } catch (Exception $e) {
            return new JsonResponse([
                'success' => 0,
            ]);
        }
    }
}
