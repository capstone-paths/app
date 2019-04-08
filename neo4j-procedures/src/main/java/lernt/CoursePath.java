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
                                              @Name("threshold") Double threshold,
                                              @Name("config") Map<String, Object> config) throws Exception
    {
        ConfigObject configuration = new ConfigObject(config);

        // Collections for Courses and Prereqs to return
        // Plus a set to keep track of visited nodes
        // TODO: Add as global or as own class
        List<Node> nodes = new ArrayList<Node>();
        List<Relationship> relationships = new ArrayList<Relationship>();
        Set<Long> visited = new HashSet<>();
        Set<Node> heads = new HashSet<>();

        visited.add(startNode.getId());

        findCoursePathPrivate(nodes, relationships, visited, heads, startNode, threshold, configuration);

        // Nothing found
        if (nodes.size() < 2) {
            return Stream.empty();
        }

        // Create virtual node
        // Create relationship between node and all nodes in the heads
        VirtualNode head = new VirtualNode(-1, db);
        head.addLabel(Label.label("VirtualPathStart"));
        head.setProperty("name", "VirtualPathStart");
        for (Node node : heads) {
            VirtualRelationship rel = head.createRelationshipTo(node, RelationshipType.withName("NEXT"));
            relationships.add(rel);
        }
        nodes.add(head);

        return Stream.of(new GraphResult(nodes, relationships));
    }


    private void findCoursePathPrivate(List<Node> nodes, List<Relationship> rels, Set<Long> visited, Set<Node> heads,
                                       Node curNode, Double threshold, ConfigObject config)
            throws Exception
    {
        nodes.add(curNode);
        heads.add(curNode);

        Iterator<Relationship> relsIt = curNode.getRelationships(RelationshipType.withName(config.getPrereqLabelName()),
                                                                 Direction.INCOMING).iterator();

        if (!relsIt.hasNext()) {
            return;
        }

        // Get relationships from both directions
        // For each relationship
            // Get node at other end
            // Add to visited
            // if incoming
                // add to incoming map <Node, NumOccurrences>
                // increment incoming total counter

        // if incoming map is empty get out

        // for each member of the incoming set


        // if candidate set is > 0, remove

        // recurse over list of candidates


        HashMap<String, Candidate> nextNodes = new HashMap<>();
        Relationship prereq = null;
        Candidate candidate = null;

        while (relsIt.hasNext()) {
            prereq = relsIt.next();
            candidate = new Candidate(curNode, prereq, prereq.getOtherNode(curNode), config);

            // TODO: Debug, remove
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

        if (nextNodes.size() > 0) {
            heads.remove(curNode);
        }

        for (Candidate toAdd : nextNodes.values()) {
            findCoursePathPrivate(nodes, rels, visited, heads, toAdd.getCandidateCourse(), threshold, config);
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
