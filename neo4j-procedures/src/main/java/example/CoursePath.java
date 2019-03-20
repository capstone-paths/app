package example;

import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Relationship;
import org.neo4j.logging.Log;
import org.neo4j.procedure.Context;
import org.neo4j.procedure.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
                                               @Name("linkPropName") String linkPropName,
                                               @Name("linkLabelName") String linkLabelName,
                                               @Name("threshold") Double threshold)
    {
        if (startNode == null) {
            log.debug("findCoursePath: null input");
            return Stream.empty();
        }

        // TODO: Need to throw here
        if (!(startNode instanceof Node)) {
            log.debug("findCoursePath: startNode is not a Node");
        }

        List<Node> nodes = new ArrayList<Node>();
        List<Relationship> relationships = new ArrayList<Relationship>();
        Set<Node> visited = new HashSet<Node>();

        findCoursePathPrivate(nodes, relationships, visited,
                              nodePropName, nodeLabelName, linkPropName, linkLabelName, threshold);

        return Stream.of(new GraphResult(nodes, relationships));
    }

    /**
     *
     */
    private void findCoursePathPrivate(List<Node> nodes, List<Relationship> rels, Set<Node> visited,
                                       String nodePropName, String nodeLabelName, String linkPropName,
                                       String linkLabelName, Double threshold)
    {

    }

    /**
     * Class defining the result of our search
     * Per the neo4j docs,  must have public fields
     */
    public class GraphResult
    {
        public final List<Node> nodes;
        public final List<Relationship> relationships;

        public GraphResult(List<Node> nodes, List<Relationship> relationships)
        {
            this.nodes = nodes;
            this.relationships = relationships;
        }
    }
}
