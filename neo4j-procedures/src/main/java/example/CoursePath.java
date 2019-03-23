package example;

import org.neo4j.graphdb.*;
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

        Node first = (Node) startNode;
        visited.add(first.getId());

        findCoursePathPrivate(nodes, relationships, visited, first,
                              courseWeightPropName, courseLabelName, courseCategoryPropName,
                              prereqWeightPropName, prereqLabelName, threshold);

        return Stream.of(new GraphResult(nodes, relationships));
    }

    // TODO: Consolidate nodes, rels, visited in a single class
    // TODO: Consolidate all the graph props into a single class - check APOC for reference
    private void findCoursePathPrivate(List<Node> nodes, List<Relationship> rels, Set<Long> visited, Node curNode,
                                       String courseWeightPropName, String courseLabelName, String courseCategoryPropName,
                                       String prereqWeightPropName, String prereqLabelName,
                                       Double threshold)
    {
        // TODO: Add node at end it makes more sense
        // ADD START TO VISITED!!!
        // For the special start case, add at start in caller
        nodes.add(curNode);

        Iterator<Relationship> relsIt = curNode.getRelationships(RelationshipType.withName(prereqLabelName),
                                                                 Direction.INCOMING).iterator();

        if (!relsIt.hasNext()) {
            return;
        }


        // get node id
        // create array of nodes
        long id = curNode.getId();
        HashMap<String, CandidateCourse> nextNodes = new HashMap<>();
        Relationship rel = null;
        Node candidate = null;
        PrereqInfo prereqInfo = null;

        while (relsIt.hasNext()) {
            rel = relsIt.next();
            candidate = rel.getOtherNode(curNode);
            if (visited.contains(candidate.getId())) {
                continue;
            }

            visited.add(candidate.getId());
            prereqInfo = prereqInfoFromGraph(curNode, courseCategoryPropName, courseWeightPropName, rel, prereqWeightPropName);
            if (prereqInfo == null) {
                continue;
            }

            if (shouldAddToNextNodes(nextNodes, prereqInfo, threshold)) {
                nextNodes.put(prereqInfo.getCategory(),
                              new CandidateCourse(candidate, rel, prereqInfo.getRecommendationsCoefficient()));
            }
        }

        for (CandidateCourse course : nextNodes.values()) {
            rels.add(course.getRelationship());
            findCoursePathPrivate(nodes, rels, visited, course.getNode(),
                                  courseWeightPropName, courseLabelName, courseCategoryPropName,
                                  prereqWeightPropName, prereqLabelName,
                                  threshold);
        }



        // process next nodes;
    }

    private boolean shouldAddToNextNodes(HashMap<String, CandidateCourse> nextNodes, PrereqInfo info, Double threshold)
    {
        // The proportion of people that recommend the course as a prereq
        double recommendCoefficient = info.getRecommendationsCoefficient();

        if (recommendCoefficient < threshold) {
            return false;
        }

        CandidateCourse currentBest = nextNodes.get(info.getCategory());
        return currentBest == null || currentBest.getRecommendationCoefficient() < recommendCoefficient;
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
            if (!(nodeRecommendations instanceof Long)) {
                log.debug("Node recommendations property is not an Integer but a: " + nodeCategory.getClass());
                return null;
            }

            Object relRecommendations = rel.getProperty(prereqWeightPropName);
            if (!(relRecommendations instanceof Long)) {
                log.debug("Relationship recommendations property is not an Integer but a: "
                            + prereqWeightPropName.getClass());
                return null;
            }

            return new PrereqInfo((String) nodeCategory, (Long) relRecommendations, (Long) nodeRecommendations);
        }
        catch (NotFoundException e) {
            log.debug("Graph object property not found: " + e.getMessage());
            return null;
        }
    }

    private class PrereqInfo
    {
        private String category;
        private Long numberOfPreReqs;
        private Long numberOfCourseRecommendations;

        public PrereqInfo(String category, Long numberOfPreReqs, Long numberOfCourseRecommendations) {
            this.category = category;
            this.numberOfPreReqs = numberOfPreReqs;
            this.numberOfCourseRecommendations = numberOfCourseRecommendations;
        }

        public String getCategory()
        {
            return category;
        }

        public Long getNumberOfPreReqs()
        {
            return numberOfPreReqs;
        }

        public Long getNumberOfCourseRecommendations()
        {
            return numberOfCourseRecommendations;
        }

        public double getRecommendationsCoefficient()
        {
            return (double) numberOfPreReqs / (double) numberOfCourseRecommendations;
        }
    }


    private class CandidateCourse
    {
        public Node node;
        private Relationship rel;
        public Double recommendationCoefficient;

        public CandidateCourse(Node node, Relationship rel, Double recommendationCoefficient)
        {
            this.node = node;
            this.rel = rel;
            this.recommendationCoefficient = recommendationCoefficient;
        }

        public Node getNode()
        {
            return node;
        }

        public Relationship getRelationship()
        {
            return rel;
        }

        public Double getRecommendationCoefficient()
        {
            return recommendationCoefficient;
        }
    }
}
