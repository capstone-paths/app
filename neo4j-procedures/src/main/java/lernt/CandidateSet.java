package lernt;

import org.neo4j.graphdb.Direction;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Relationship;
import org.neo4j.graphdb.RelationshipType;

import java.util.*;

public class CandidateSet
{
    Tracker tracker;
    HashMap<Node, Integer> candidates;
    ConfigObject config;
    int totalIncomingCount;

    public static List<Node> getCandidateSet(Node node, Tracker tracker, ConfigObject config)
    {
        RelationshipType prereqRelType = RelationshipType.withName(config.getPrereqLabelName());
        boolean hasIncoming = node.hasRelationship(Direction.INCOMING, prereqRelType);

        // There are no incoming relationships; no candidates, return empty
        if (!hasIncoming) {
            return new ArrayList<>();
        }

        Iterator<Relationship> rels = node.getRelationships(prereqRelType).iterator();

        // Produce a map of nodes and relative frequencies
        // Count relative frequencies

        // For every node in the map, consider if it should be added to final list
        // Produce final list of candidates

        return new ArrayList<>();
    }


    private Map<Node, Integer> getIncomingFrequencies(Node curNode, Iterator<Relationship> it, Tracker tracker)
    {
        Map<Node, Integer> map = new HashMap<>();

        while(it.hasNext()) {
            Relationship rel = it.next();
            Node otherNode = rel.getOtherNode(curNode);
            tracker.addToVisited(otherNode);

            // Relationship is outgoing, we don't need its frequency
            if (rel.getStartNode().equals(curNode)) {
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


    private List<Node> processPrereqs(Map<Node, Integer> incoming, Tracker tracker, ConfigObject config)
    {
        List<NewCandidate> candidates = new ArrayList<>();





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
