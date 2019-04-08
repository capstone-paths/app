package lernt;

import org.neo4j.graphdb.Node;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class CandidateSet
{
    int totalIncomingCount;
    HashMap<Node, Integer> candidates;
    ConfigObject config;

    public CandidateSet(int totalIncomingCount, ConfigObject config)
    {
        this.totalIncomingCount = totalIncomingCount;
        this.candidates = new HashMap<>();
        this.config = config;
    }


    public void addNode(Node incoming, int recommendationCount)
    {
        // if node doesn't meet threshold, return

        // for each node in set
            // compare categories with incoming node
            // if categories clash
                // pick a winner
                // return
        // if no winner, add to set
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
