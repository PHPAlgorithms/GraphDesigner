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

class GraphController extends Controller
{
    /**
     * @Route("/save-graph", name="save graph", condition="request.isXmlHttpRequest()")
     * @Method("POST")
     */
    public function saveGraphAction(Request $request)
    {
        $graphName = trim($request->get('graphName'));
        if (empty($graphName)) {
            return new JsonResponse([
                'nameEmpty' => 1,
                'success' => 0,
            ]);
        } else {
            $graphPath = $this->container
                              ->getParameter('kernel.root_dir') . "\\Resources\\saved-graphs\\{$graphName}.grph";

            $points = $request->get('points');
            if (empty($points)) {
                $toSave = null;
            } else {
                try {
                    $toSave = array();

                    $points = explode(',', $points);
                    foreach ($points as $i => $point) {
                        list($x, $y) = explode(':', $point);
                        $toSave[] = [
                            'id' => $i,
                            'x' => $x,
                            'y' => $y
                        ];
                    }
                } catch (Exception $e) {
                    return new JsonResponse([
                        'badStructure' => 1,
                        'success' => 0,
                    ]);
                }
            }

            $fs = new Filesystem();
            if (!$fs->exists($graphPath)) {
                $fs->touch($graphPath);
            }
            $fs->dumpFile($graphPath, serialize($toSave));

            return new JsonResponse([
                'success' => 1,
            ]);
        }
    }
};
