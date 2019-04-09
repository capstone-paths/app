package lernt;

import org.neo4j.graphdb.*;
import org.neo4j.logging.Log;
import org.neo4j.procedure.*;

import java.util.*;
import java.util.stream.Stream;

/**
 * CoursePath
 * A custom neo4j extension ("procedure") for lernt.io to recommend learning paths based on
 * the most recommended user-built learning paths
 */
public class CoursePath
{
    @Context
    public GraphDatabaseService db;

    @Context
    public Log log;


    @Procedure(name = "lernt.findCoursePath", mode=Mode.SCHEMA)
    public Stream<GraphResult> findCoursePath(@Name("startNode") Node startNode,
                                              @Name("config") Map<String, Object> config) throws Exception
    {
        ConfigObject configuration = new ConfigObject(config);

        // Collections for Courses and Prereqs to return
        // Plus a set to keep track of visited nodes
        // TODO: Add as global or as own class
        Tracker tracker = new Tracker();
        tracker.addToVisited(startNode);

        findCoursePathPrivate(startNode, tracker, configuration);

        // Nothing found
        if (tracker.getResultNodesSize() <= 1) {
            return Stream.empty();
        }

        tracker.buildHead(db);

        List<Node> nodes = tracker.getResultNodesList();
        List<Relationship> relationships = tracker.getResultRelsList();

        return Stream.of(new GraphResult(nodes, relationships));
    }


    private void findCoursePathPrivate(Node curNode, Tracker tracker, ConfigObject config)
            throws Exception
    {
        // This guard is necessary because CandidateDecider also adds nodes to the result set
        // A node can have therefore been added depth-first, when we attempt to add it in breadth
        if (tracker.isInResultNodes(curNode)) {
            return;
        }

        tracker.addToResultNodes(curNode);
        tracker.addToHeads(curNode);

        CandidateDecider cd = new CandidateDecider(curNode, tracker, config);
        Set<NewCandidate> candidateSet = cd.getCandidateSet();

        for (NewCandidate candidate : candidateSet)
        {
            Node prereq = candidate.getCourseNode();
            tracker.makeRelationship(prereq , curNode);
            tracker.removeFromHeads(curNode);
            findCoursePathPrivate(prereq, tracker, config);
//            if (tracker.isInResultNodes(prereq)) {
//                tracker.makeRelationship(prereq , curNode);
//            }
//            else if (tracker.isInVisited(prereq)) {
//                tracker.addToResultNodes(prereq);
//                tracker.makeRelationship(prereq, curNode);
//            }
//            else { // not in result, and not in visited
//                tracker.removeFromHeads(curNode);
//                findCoursePathPrivate(prereq, tracker, config);
//            }
        }
    }


    /**
     * Class defining the result of our search
     * Per the neo4j docs,  must have public fields
     */
    public class GraphResult
    {
        public List<Node> nodes;
        public List<Relationship> relationships;

        public GraphResult(List<Node> nodes, List<Relationship> relationships)
        {
            this.nodes = nodes;
            this.relationships = relationships;
        }
    }
}
