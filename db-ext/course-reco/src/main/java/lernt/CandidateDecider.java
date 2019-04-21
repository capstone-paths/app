package lernt;

import org.neo4j.graphdb.*;

import java.util.*;
import static java.util.stream.Collectors.toMap;


/**
 * Given a course and a possible prereq, decides whether the prereq
 * should be added to the result set
 */
public class CandidateDecider
{
    private ResultNode current;
    private Tracker tracker;
    private ConfigObject config;
    private double frequencyThreshold;
    private double similarityThreshold;


    /**
     * Instantiates a CandidateDecider
     * @param current     The current node in recursion
     * @param tracker     Recursion state
     * @param config      Configuration context
     * @throws Exception  If the config doesn't provide the necessary items
     */
    public CandidateDecider(ResultNode current, Tracker tracker, ConfigObject config)
            throws Exception
    {
        this.current = current;
        this.tracker = tracker;
        this.config = config;

        Object frequencyThreshold = config.getFrequencyThreshold();
        if (!(frequencyThreshold instanceof Double)) {
            throw new Exception("frequencyThreshold not a Double: " + String.valueOf(frequencyThreshold));
        }
        this.frequencyThreshold = (double) frequencyThreshold;

        Object similarityThreshold = config.getSimilarityThreshold();
        if (!(similarityThreshold instanceof Double)) {
            throw new Exception("similarityThreshold not a Double: " + String.valueOf(similarityThreshold));
        }
        this.similarityThreshold = (double) similarityThreshold;
    }


    /**
     * Produces the set of candidates to add to the results tree
     * @return            The set of course candidates to add
     * @throws Exception
     */
    public Set<Course> getCandidateSet()
            throws Exception
    {
        // Get all incoming courses and their relative frequencies, and calculate the total of incoming
        Map<Node, Integer> freqs = getIncomingFrequencies();
        int totalIncoming = freqs.values().stream().reduce(0, Integer::sum);


        // Sort from highest to lower frequency
        // This is necessary when later we check for duplicates
        Map<Node, Integer> sorted = freqs
                .entrySet()
                .stream()
                .sorted(Collections.reverseOrder(Map.Entry.comparingByValue()))
                .collect(toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e2,
                                LinkedHashMap::new));

        Set<Course> candidateSet = new HashSet<>();

        for (Map.Entry<Node, Integer> entry : sorted.entrySet())
        {
            int currentFrequency = entry.getValue();
            if (!passesMinimumThreshold(currentFrequency, totalIncoming)) {
                continue;
            }

            Node candidateNode = entry.getKey();
            Course candidate = tracker.makeCourse(candidateNode);

            if (shouldAddToCandidates(candidate, candidateSet)) {
                candidateSet.add(candidate);
            }
        }

        return candidateSet;
    }


    /**
     * Checks if a course should be added to candidates
     * @param c             The course that we are looking to add
     * @param candidateSet  The set of current candidates
     * @return  True if should add, false otherwise
     */
    private boolean shouldAddToCandidates(Course c, Set<Course> candidateSet)
    {
        return !tracker.hasUserCompletedSimilar(c, similarityThreshold)
                && !tracker.resultsIncludeSimilar(c, similarityThreshold)
                && !hasSimilarCandidate(candidateSet, c);

    }


    /**
     * Organizes all prereqs as a map of relative frequencies and nodes
     * This is due to the fact that our model creates multiple relationships between nodes to signify frequency
     * @return  The map of frequencies and nodes
     */
    private Map<Node, Integer> getIncomingFrequencies()
    {
        RelationshipType prereqRelType = RelationshipType.withName(config.getPrereqLabelName());
        Iterable<Relationship> rels = current.getNode().getRelationships(prereqRelType, Direction.INCOMING);

        Map<Node, Integer> map = new HashMap<>();

        for (Relationship rel : rels) {
            Node otherNode = rel.getStartNode();
            if (!otherNode.hasLabel(Label.label(config.getCourseLabelName()))) {
                continue;
            }

            // Add frequency or update it as needed
            Integer freq = map.get(otherNode);
            if (freq == null) {
                map.put(otherNode, 1);
            }
            else {
                map.put(otherNode, freq + 1);
            }
        }

        return map;
    }


    /**
     * Whether a course passes the minimum threshold set in the procedure custom parameters
     * @param courseFrequency  The relative frequency of the course
     * @param totalFrequency   The total number of incoming relationships for the target course
     * @return
     * @throws Exception If division by zero or negative number
     */
    private boolean passesMinimumThreshold(int courseFrequency, int totalFrequency)
            throws Exception
    {
        if (totalFrequency <= 0) {
            throw new Exception("totalFrequency is not positive: " + totalFrequency);
        }

        return (double) courseFrequency / (double) totalFrequency > this.frequencyThreshold;
    }


    private boolean hasSimilarCandidate(Set<Course> set, Course incoming) {
        for (Course incumbent : set) {
            double similarity = incumbent.getSimilarityCoefficient(incoming);
            if (similarity > similarityThreshold) {
                return true;
            }
        }

        return false;
    }
}
