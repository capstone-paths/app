package example;

import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Relationship;

import java.util.HashMap;

/**
 * Candidate
 * A class that contains the current course evaluated in the recursion, an incoming prereq course, and the relationship
 * - the prereq itself - that ties them.
 * The class contains the core methods of the course path recommendation algorithm.
 */
public class Candidate
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
