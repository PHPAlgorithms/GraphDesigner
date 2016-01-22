<?php
namespace AppBundle\Controller;

use Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Filesystem\Filesystem;
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
                    $toSave = array('points' => array(), 'connections' => array());

                    $points = explode(',', $points);
                    foreach ($points as $i => $point) {
                        list($x, $y) = explode(':', $point);
                        $toSave['points'][] = [
                            'id' => $i,
                            'x' => $x,
                            'y' => $y,
                        ];
                    }

                    $connections = $request->get('connections');
                    if (!empty($connections)) {
                        $connections = explode(',', $connections);
                        foreach ($connections as $connection) {
                            list($from, $to) = explode(':', $connection);
                            $toSave['connections'][] = [
                                'from' => $from,
                                'to' => $to,
                            ];
                        }
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

    /**
     * @Route("/load-graph", name="load graph", condition="request.isXmlHttpRequest()")
     * @Method("POST")
     */
    public function loadGraphAction(Request $request)
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

            $fs = new Filesystem();
            if ($fs->exists($graphPath)) {
                $fileContent = file_get_contents($graphPath);

                $contentArray = unserialize($fileContent);
                if (is_array($contentArray)) {
                    try {
                        return new JsonResponse([
                            'connections' => $contentArray['connections'],
                            'connectionscount' => count($contentArray['connections']),
                            'points' => $contentArray['points'],
                            'pointscount' => count($contentArray['points']),
                            'success' => 1
                        ]);
                    } catch (Exception $e) {
                        return new JsonResponse([
                           'brokenFile' => 1,
                           'success' => 0
                       ]); 
                    }
                } else {
                    return new JsonResponse([
                        'brokenFile' => 1,
                        'success' => 0
                    ]); 
                }
            } else {
                return new JsonResponse([
                    'fileNotExists' => 1,
                    'success' => 0
                ]);
            }
        }
    }
};
