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
    public Stream<GraphResult> findCoursePath(@Name("startNode") Object startNode,
                                              @Name("threshold") Double threshold,
                                              @Name("config") Map<String, Object> config) throws Exception
    {
        if (!(startNode instanceof Node)) {
            log.debug("findCoursePath: startNode is not a Node.");
            throw new Exception("startNode is not a Node.");
        }

        ConfigObject configuration = new ConfigObject(config);

        // Set up the config variables, ie the labels the algorithm looks for in path searching
        // They are optional; if not provided, they default to these values

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


    private void findCoursePathPrivate(List<Node> nodes, List<Relationship> rels, Set<Long> visited, Node curNode, Double threshold, ConfigObject config)
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


    private class Candidate
    {
        private Node currentCourse;
        private Relationship prereqRel;
        private Node candidateCourse;
        private ConfigObject config;

        public Candidate(Node currentCourse, Relationship prereqRel, Node candidateCourse, ConfigObject config)
        {
            this.currentCourse = currentCourse;
            this.prereqRel = prereqRel;
            this.candidateCourse = candidateCourse;
            this.config = config;
        }

        public double getRecommendationsCoefficient() throws Exception
        {
            Object currentCourseRecommendations = currentCourse.getProperty(config.getCourseWeightPropName());
            if (!(currentCourseRecommendations instanceof Long)) {
                throw new Exception("Node recommendations property is not a Long");
            }

            Object prereqRecommendations = prereqRel.getProperty(config.getPrereqWeightPropName());
            if (!(prereqRecommendations instanceof Long)) {
                throw new Exception("Relationship recommendations property is not a Long");
            }

            Long course = (Long) currentCourseRecommendations;
            Long prereq = (Long) prereqRecommendations;


            if (prereq < 0 || course < 0) {
                throw new Exception("Data model error: negative recommendations: "
                        + "prereq: " + prereq + " course: " + course);
            }

            if (prereq > course) {
                throw new Exception("Data model error: prereq recommendations larger than target course: "
                        + "prereq: " + prereq + " course: " + course);
            }

            // Guard division by zero
            // We are judging a course with no recommendations - should be caught by threshold
            if (course == 0) {
                return 0;
            }

            return (double) prereq / (double) course;
        }

        // TODO: Add to Candidate - it belongs there
        public boolean shouldAddToNextNodes(HashMap<String, Candidate> nextNodes, Double threshold)
                throws Exception
        {
            // The proportion of people that recommend the course as a prereq
            double recommendCoefficient = this.getRecommendationsCoefficient();

            if (recommendCoefficient < threshold) {
                return false;
            }

            Candidate currentBest = nextNodes.get(this.getCandidateCategory());
            return currentBest == null || currentBest.getRecommendationsCoefficient() < recommendCoefficient;
        }


        public Long getCandidateId()
        {
            return candidateCourse.getId();
        }


        public String getCandidateCategory() throws Exception
        {
            Object candidateCategory = candidateCourse.getProperty(config.getCourseCategoryPropName());
            if (!(candidateCategory instanceof String)) {
                throw new Exception("Node course category property is not an String");
            }

            return (String) candidateCategory;
        }

        public Relationship getPrereqRel()
        {
            return prereqRel;
        }

        public Node getCandidateCourse()
        {
            return candidateCourse;
        }
    }
}
