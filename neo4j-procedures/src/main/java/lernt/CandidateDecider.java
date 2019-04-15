package lernt;

import org.neo4j.graphdb.*;

import java.util.*;

import static java.util.Map.Entry.comparingByValue;
import static java.util.stream.Collectors.toMap;

public class CandidateDecider
{
    private ResultNode current;
    private Tracker tracker;
    private ConfigObject config;
    private double frequencyThreshold;
    private double similarityThreshold;

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


    public Set<Course> getCandidateSet()
            throws Exception
    {
        Map<Node, Integer> freqs = getIncomingFrequencies();
        int totalIncoming = freqs.values().stream().reduce(0, Integer::sum);


        Map<Node, Integer> sorted = freqs
                .entrySet()
                .stream()
                .sorted(Collections.reverseOrder(Map.Entry.comparingByValue()))
                .collect(toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e2,
                                LinkedHashMap::new));

        // create new set
        // for every relationship of iterator
            // get the other node
            // check if it's a course!
            // make a candidate
            // check if user has completed this course or similar
            // check if similar courses in solution set

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

    private boolean shouldAddToCandidates(Course c, Set<Course> candidateSet)
    {
        return !tracker.hasUserCompletedSimilar(c, similarityThreshold)
                && !tracker.resultsIncludeSimilar(c, similarityThreshold)
                && !hasSimilarCandidate(candidateSet, c);

    }


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


//    private Set<Course> processAll(Map<Node, Integer> incoming)
//            throws Exception
//    {
//        int totalIncoming = incoming.values().stream().reduce(0, Integer::sum);
//
//        Set<Course> candidates = new HashSet<>();
//
//        for (Map.Entry<Node, Integer> entry : incoming.entrySet())
//        {
//            int currentFrequency = entry.getValue();
//            if (!passesMinimumThreshold(currentFrequency, totalIncoming)) {
//                continue;
//            }
//
//            Node candidateNode = entry.getKey();
//
//            String curName = (String) candidateNode.getProperty("name", null);
//
//            // TODO: Make this right
//            if (!candidateNode.hasLabel(Label.label("Course"))) {
//                continue;
//            }
//
//            Course current = new Course(candidateNode, currentFrequency, config);
//
//
//            // TODO: This is absolutely filthy, unperformant, and needs to be cleaned up
//            Set<Course> completed = new HashSet<>();
//            for (Node n : tracker.getUserCompleted()) {
//                completed.add(new Course(n, 0, config));
//            }
//            if (findSimilarCandidate(completed, current) != null) {
//                continue;
//            }
//
//
//
//            Course similar = findSimilarCandidate(candidates, current);
//            if (similar != null) {
//                if (similar.getFrequency() < currentFrequency) {
//                    candidates.remove(similar);
//                    candidates.add(current);
//                }
//            }
//            else {
//                candidates.add(current);
//            }
//        }
//
//        return candidates;
//    }


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

        // return false
        return false;
    }


}
