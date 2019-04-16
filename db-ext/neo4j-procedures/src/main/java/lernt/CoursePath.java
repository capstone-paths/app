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
    public Stream<GraphResult> findCoursePath(@Name("startNode") Object startNode,
                                              @Name("threshold") Double threshold,
                                              @Name("config") Map<String, Object> config) throws Exception
    {
        if (!(startNode instanceof Node)) {
            log.debug("findCoursePath: startNode is not a Node.");
            throw new Exception("startNode is not a Node.");
        }

        ConfigObject configuration = new ConfigObject(config);

        // Collections for Courses and Prereqs to return
        // Plus a set to keep track of visited nodes
        // TODO: Add as global or as own class
        List<Node> nodes = new ArrayList<Node>();
        List<Relationship> relationships = new ArrayList<Relationship>();
        Set<Long> visited = new HashSet<>();

        Node first = (Node) startNode;
        visited.add(first.getId());

        findCoursePathPrivate(nodes, relationships, visited, first, threshold, configuration);

        return Stream.of(new GraphResult(nodes, relationships));
    }


    private void findCoursePathPrivate(List<Node> nodes, List<Relationship> rels, Set<Long> visited, Node curNode,
                                       Double threshold, ConfigObject config)
            throws Exception
    {
        nodes.add(curNode);

        Iterator<Relationship> relsIt = curNode.getRelationships(RelationshipType.withName(config.getPrereqLabelName()),
                                                                 Direction.INCOMING).iterator();

        if (!relsIt.hasNext()) {
            return;
        }

        HashMap<String, Candidate> nextNodes = new HashMap<>();
        Relationship prereq = null;
        Candidate candidate = null;

        while (relsIt.hasNext()) {
            prereq = relsIt.next();
            candidate = new Candidate(curNode, prereq, prereq.getOtherNode(curNode), config);
            String cur = curNode.getProperty("name").toString();
            String can = candidate.getCandidateCourse().getProperty("name").toString();

            // if node has been visited we don't add it
            // prereq is only added if node hasn't been visited
            // this helps break cycles but affects the model's fidelity
            if (visited.contains(candidate.getCandidateId())) {
                continue;
            }
            rels.add(prereq);

            visited.add(candidate.getCandidateId());

            if (candidate.shouldAddToNextNodes(nextNodes, threshold)) {
                nextNodes.put(candidate.getCandidateCategory(), candidate);
            }
        }

        for (Candidate toAdd : nextNodes.values()) {
            findCoursePathPrivate(nodes, rels, visited, toAdd.getCandidateCourse(), threshold, config);
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
