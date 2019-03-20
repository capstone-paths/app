package example;

import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Relationship;
import org.neo4j.graphdb.RelationshipType;
import org.neo4j.logging.Log;
import org.neo4j.procedure.Context;
import org.neo4j.procedure.*;

import java.util.*;
import java.util.stream.Stream;

public class CoursePath
{
    @Context
    public GraphDatabaseService db;

    @Context
    public Log log;

    @Procedure(name = "example.findCoursePath", mode=Mode.SCHEMA)
    public Stream<GraphResult> findCoursePath( @Name("startNode") Object startNode,
                                               @Name("nodePropName") String nodePropName,
                                               @Name("nodeLabelName") String nodeLabelName,
                                               @Name("nodeCategoryName") String nodeCategoryName,
                                               @Name("linkPropName") String linkPropName,
                                               @Name("linkLabelName") String linkLabelName,
                                               @Name("threshold") Double threshold)
    {
        if (startNode == null) {
            log.debug("findCoursePath: null input");
            return Stream.empty();
        }

        // TODO: Need to throw here instead of returning empty
        if (!(startNode instanceof Node)) {
            log.debug("findCoursePath: startNode is not a Node");
            return Stream.empty();
        }

        List<Node> nodes = new ArrayList<Node>();
        List<Relationship> relationships = new ArrayList<Relationship>();
        Set<Node> visited = new HashSet<Node>();

        findCoursePathPrivate(nodes, relationships, visited, (Node) startNode,
                              nodePropName, nodeLabelName, linkPropName, linkLabelName, threshold);

        return Stream.of(new GraphResult(nodes, relationships));
    }

    /**
     *
     */
    private void findCoursePathPrivate(List<Node> nodes, List<Relationship> rels, Set<Node> visited, Node curNode,
                                       String nodePropName, String nodeLabelName, String linkPropName,
                                       String linkLabelName, Double threshold)
    {
        nodes.add(curNode);

        Iterator<Relationship> relsIt = curNode.getRelationships(RelationshipType.withName(linkPropName)).iterator();

        if (!relsIt.hasNext()) {
            return;
        }

        // get node id
        // create array of nodes

        while (relsIt.hasNext()) {
            // get relationship
            // get node at the other end
            // add node to visited set
            // if relationship passes the threshold && (category doesn't exist || is category max)
                // add relationship to results
                // add node to nodes to be processed
        }

        // process next nodes;

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


    private class NodeWithGraphWeight
    {
        public Node node;
        public Integer weight;

        public NodeWithGraphWeight(Node node, Integer weight)
        {
            this.node = node;
            this.weight = weight;
        }
    }
}
