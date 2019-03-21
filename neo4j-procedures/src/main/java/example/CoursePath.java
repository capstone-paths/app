package example;

import org.neo4j.graphdb.*;
import org.neo4j.logging.Log;
import org.neo4j.procedure.Context;
import org.neo4j.procedure.*;
import org.omg.CosNaming.NamingContextPackage.NotFound;

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
                                               @Name("courseWeightPropName") String courseWeightPropName,
                                               @Name("courseLabelName") String courseLabelName,
                                               @Name("courseCategoryPropName") String courseCategoryPropName,
                                               @Name("prereqWeightPropName") String prereqWeightPropName,
                                               @Name("prereqLabelName") String prereqLabelName,
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
        Set<Long> visited = new HashSet<>();

        findCoursePathPrivate(nodes, relationships, visited, (Node) startNode,
                              courseWeightPropName, courseLabelName, courseCategoryPropName,
                              prereqWeightPropName, prereqLabelName, threshold);

        return Stream.of(new GraphResult(nodes, relationships));
    }

    /**
     *
     */
    private void findCoursePathPrivate(List<Node> nodes, List<Relationship> rels, Set<Long> visited, Node curNode,
                                       String courseWeightPropName, String courseLabelName, String courseCategoryPropName,
                                       String prereqWeightPropName, String prereqLabelName,
                                       Double threshold)
    {
        nodes.add(curNode);

        Iterator<Relationship> relsIt = curNode.getRelationships(RelationshipType.withName(prereqLabelName)).iterator();

        if (!relsIt.hasNext()) {
            return;
        }


        // get node id
        // create array of nodes
        long id = curNode.getId();
        HashMap<String, NodeWithWeight> nextNodes = new HashMap<>();
        Relationship rel = null;
        Node candidate = null;
        PrereqInfo prereqInfo = null;

        while (relsIt.hasNext()) {
            // get relationship
            // get node at the other end
            // add node to visited set
            // if relationship passes the threshold && (category doesn't exist || is category max)
                // add relationship to results
                // add node to nodes to be processed
            rel = relsIt.next();
            candidate = rel.getOtherNode(curNode);
            if (visited.contains(candidate.getId())) {
                continue;
            }

            visited.add(candidate.getId());
            prereqInfo = prereqInfoFromGraph(candidate, courseCategoryPropName, courseWeightPropName, rel, prereqWeightPropName);
            if (prereqInfo == null) {
                continue;
            }

            if (shouldAddToNextNodes(nextNodes, prereqInfo, threshold)) {

            }


        }

        // process next nodes;
    }

    private boolean shouldAddToNextNodes(HashMap<String, Node> nextNodes, PrereqInfo info, Double threshold)
    {


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

    // TODO: Move PrereqInfo into own class and make this static
    public PrereqInfo prereqInfoFromGraph(Node node, String courseCategoryPropName, String courseWeightPropName,
                                          Relationship rel, String prereqWeightPropName)
    {
        try {
            Object nodeCategory = node.getProperty(courseCategoryPropName);
            if (!(nodeCategory instanceof String)) {
                log.debug("Node course category property is not an String but a: " + nodeCategory.getClass());
                return null;
            }

            Object nodeRecommendations = node.getProperty(courseWeightPropName);
            if (!(nodeRecommendations instanceof Integer)) {
                log.debug("Node recommendations property is not an Integer but a: " + nodeCategory.getClass());
                return null;
            }

            Object relRecommendations = rel.getProperty(prereqWeightPropName);
            if (!(relRecommendations instanceof Integer)) {
                log.debug("Relationship recommendations property is not an Integer but a: "
                            + prereqWeightPropName.getClass());
                return null;
            }

            return new PrereqInfo((String) nodeCategory, (Integer) relRecommendations, (Integer) nodeRecommendations);
        }
        catch (NotFoundException e) {
            log.debug("Graph object property not found: " + e.getMessage());
            return null;
        }
    }

    private class PrereqInfo
    {
        private String category;
        private Integer numberOfPreReqs;
        private Integer numberOfCourseRecommendations;

        public PrereqInfo(String category, Integer numberOfPreReqs, Integer numberOfCourseRecommendations) {
            this.category = category;
            this.numberOfPreReqs = numberOfPreReqs;
            this.numberOfCourseRecommendations = numberOfCourseRecommendations;
        }

        public String getCategory()
        {
            return category;
        }

        public Integer getNumberOfPreReqs()
        {
            return numberOfPreReqs;
        }

        public Integer getNumberOfCourseRecommendations()
        {
            return numberOfCourseRecommendations;
        }
    }


    private class NodeWithWeight
    {
        public Node node;
        public Double weight;

        public NodeWithWeight(Node node, Double weight)
        {
            this.node = node;
            this.weight = weight;
        }
    }
}
