package lernt;

import org.neo4j.graphdb.Direction;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Relationship;
import org.neo4j.graphdb.RelationshipType;

import java.util.*;

public class CandidateDecider
{
    Node currentCourse;
    Tracker tracker;
    ConfigObject config;

    public CandidateDecider(Node currentCourse, Tracker tracker, ConfigObject config)
    {
        this.currentCourse = currentCourse;
        this.tracker = tracker;
        this.config = config;
    }

    public List<Node> getCandidateSet()
    {
        RelationshipType prereqRelType = RelationshipType.withName(config.getPrereqLabelName());
        boolean hasIncoming = currentCourse.hasRelationship(Direction.INCOMING, prereqRelType);

        // There are no incoming relationships; no candidates, return empty
        if (!hasIncoming) {
            return new ArrayList<>();
        }

        Iterator<Relationship> rels = currentCourse.getRelationships(prereqRelType).iterator();

        // Produce a map of nodes and relative frequencies
        // Count relative frequencies

        // For every node in the map, consider if it should be added to final list
        // Produce final list of candidates

        return new ArrayList<>();
    }


    private Map<Node, Integer> getIncomingFrequencies(Iterator<Relationship> it)
    {
        Map<Node, Integer> map = new HashMap<>();

        while(it.hasNext()) {
            Relationship rel = it.next();
            Node otherNode = rel.getOtherNode(currentCourse);
            tracker.addToVisited(otherNode);

            // Relationship is outgoing, we don't need its frequency
            if (rel.getStartNode().equals(currentCourse)) {
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


    private Set<Node> processPrereqs(Map<Node, Integer> incoming)
    {
        int totalIncoming = incoming.values().stream().reduce(0, Integer::sum);


        // for every incoming
            // if passes threshold(course freq, total freq)
            // make new candidate
            // for each existing candidate
                // compare newcomer with incumbent
                // if too similar
                    // pick the one with more recommendations
                    // remove incumbent if necessary







    }


    private boolean passesMinimumThreshold(Node incoming)
    {
        return false;
    }


    public boolean areCourseCategoriesSimilar(Node incumbent, Node incoming)
    {
        // Get the labels and cat of both nodes
        // If more than x similarity, return true
        return false;
    }


    public Set<Node> getListOfCandidates()
    {
        return candidates.keySet();
    }
}
