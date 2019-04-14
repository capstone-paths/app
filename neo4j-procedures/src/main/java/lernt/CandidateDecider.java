package lernt;

import org.neo4j.graphdb.*;

import java.util.*;

public class CandidateDecider
{
    private Node currentCourse;
    private Tracker tracker;
    private ConfigObject config;
    private double frequencyThreshold;
    private double similarityThreshold;

    public CandidateDecider(Node currentCourse, Tracker tracker, ConfigObject config)
            throws Exception
    {
        this.currentCourse = currentCourse;
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


    public Set<Course> getCandidateSet()
            throws Exception
    {
        // TODO: Change this to incoming rels, no longer need outgoin
        RelationshipType prereqRelType = RelationshipType.withName(config.getPrereqLabelName());
        boolean hasIncoming = currentCourse.hasRelationship(Direction.INCOMING, prereqRelType);

        // There are no incoming relationships; no candidates, return empty
        if (!hasIncoming) {
            return new HashSet<>();
        }

        Iterator<Relationship> rels = currentCourse.getRelationships(prereqRelType).iterator();

        // create new set
        // for every relationship of iterator
            // get the other node
            // check if it's a course!
            // make a candidate
            // check if user has completed this course or similar
            // check if similar courses in solution set



        Map<Node, Integer> coursesAndFrequencies = getIncomingFrequencies(rels);

        return processAll(coursesAndFrequencies);
    }


    private Map<Node, Integer> getIncomingFrequencies(Iterator<Relationship> it)
    {
        Map<Node, Integer> map = new HashMap<>();

        // TODO: Clean up this logic, too many continues
        while(it.hasNext()) {
            Relationship rel = it.next();
            Node otherNode = rel.getOtherNode(currentCourse);

            // User has completed, not interested
            if (tracker.hasUserCompleted(otherNode)) {
                continue;
            }

            boolean isOutgoing = rel.getStartNode().equals(currentCourse);

            // Relationship is outgoing, we don't need its frequency
            if (isOutgoing) {
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


    private Set<Course> processAll(Map<Node, Integer> incoming)
            throws Exception
    {
        int totalIncoming = incoming.values().stream().reduce(0, Integer::sum);

        Set<Course> candidates = new HashSet<>();

        for (Map.Entry<Node, Integer> entry : incoming.entrySet())
        {
            int currentFrequency = entry.getValue();
            if (!passesMinimumThreshold(currentFrequency, totalIncoming)) {
                continue;
            }

            Node candidateNode = entry.getKey();

            String curName = (String) candidateNode.getProperty("name", null);

            // TODO: Make this right
            if (!candidateNode.hasLabel(Label.label("Course"))) {
                continue;
            }

            Course current = new Course(candidateNode, currentFrequency, config);


            // TODO: This is absolutely filthy, unperformant, and needs to be cleaned up
            Set<Course> completed = new HashSet<>();
            for (Node n : tracker.getUserCompleted()) {
                completed.add(new Course(n, 0, config));
            }
            if (findSimilarCandidate(completed, current) != null) {
                continue;
            }



            Course similar = findSimilarCandidate(candidates, current);
            if (similar != null) {
                if (similar.getFrequency() < currentFrequency) {
                    candidates.remove(similar);
                    candidates.add(current);
                }
            }
            else {
                candidates.add(current);
            }
        }

        return candidates;
    }


    private boolean passesMinimumThreshold(int courseFrequency, int totalFrequency)
            throws Exception
    {
        if (totalFrequency <= 0) {
            throw new Exception("totalFrequency is not positive: " + totalFrequency);
        }

        return (double) courseFrequency / (double) totalFrequency > this.frequencyThreshold;
    }

    private Course findSimilarCandidate(Set<Course> set, Course incoming) {
        for (Course incumbent : set) {
            double similarity = incumbent.getSimilarityCoefficient(incoming);
            if (similarity > similarityThreshold) {
                return incumbent;
            }
        }

        // we haven't found anything return null
        return null;
    }


}
